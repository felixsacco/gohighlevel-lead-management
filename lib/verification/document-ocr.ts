// Phase 2b (audit P2#10) — document machine-parse on ingest.
//
// `documents` rows have always recorded only the raw upload (file_path,
// upload_date, a single 'pending' status); nothing ever read the file. This
// module adds the missing read: on registration each uploaded document is sent
// to Gemini (the same REST generateContent + JSON-mode pattern as
// lib/verification/ai-verify.ts), which returns structured fields extracted
// from the image:
//
//   { docType, issuer, docNumber, expiryDate, confidence, flags }
//
// The ingest path persists that parse onto the documents row (parse_status /
// parse_payload / parsed_at — the columns sql/phase15-document-ocr.sql adds)
// and, when the parse is both HIGH-CONFIDENCE and type-consistent with the slot
// the file was uploaded into, promotes documents.status to 'approved' and
// writes the machine-extracted doc_number / expiry_date. Those promoted rows
// are exactly what evaluateVerificationState (user-status-machine.ts) consumes:
// a doc is approved only when its status is null or 'approved'.
//
// HONEST FALLBACK — never a silent pass: any parse that is low-confidence,
// type-inconsistent, upstream-failed, or not-attempted leaves the document
// 'pending' (its insert default), so the profile honestly lands in
// pending_review. A machine reading you could not trust must not be what lets a
// profile through.
//
// Independence: the model is deliberately NOT shown the self-declared
// doc_number / expiry_date the registrant typed. Feeding them in would bias the
// extraction toward confirming the human's claim, which defeats the purpose of
// an independent read of the actual document.
//
// SECURITY NOTE: this module sends document bytes to Google's Gemini API. That
// is a transfer of an applicant's document imagery to a third party, gated only
// by the presence of GEMINI_API_KEY — it is the platform operator's documented
// vetting choice (docs/VERIFICATION.md), not something the anon browser client
// can invoke (the ingest path runs on the service-role register route).

export type OcrDocTypeSlot = 'id' | 'insurance' | 'qualification' | 'trade_card';

export interface DocumentOcrResult {
  /** Canonical label for what the document actually is (see synonyms below). */
  docType: string;
  issuer: string | null;
  docNumber: string | null;
  /** Normalised YYYY-MM-DD, or null when no printed/legible expiry exists. */
  expiryDate: string | null;
  /** 0-1 — confidence the extraction is right AND the doc is genuine/unaltered. */
  confidence: number;
  flags: string[];
}

/**
 * What the ingest path should persist for a single document. `parseStatus` maps
 * 1:1 onto the parse_status vocabulary (NULL | 'parsed' | 'low_confidence' |
 * 'failed'): a null return from parseDocumentImage means NOT ATTEMPTED (no API
 * key) and the column is left NULL.
 */
export type OcrParse = {
  parseStatus: 'parsed' | 'low_confidence' | 'failed';
  /** True only for a high-confidence, type-consistent parse — the sole case
   *  that may promote documents.status to 'approved'. */
  promote: boolean;
  /** Normalised result when a usable parse happened, else null. */
  payload: DocumentOcrResult | null;
};

/** Below this confidence a parse is real but not trustworthy enough to act on. */
export const OCR_HIGH_CONFIDENCE_THRESHOLD = 0.7;

const GEMINI_OCR_MODEL = 'gemini-2.5-flash';

// Canonical labels the model is asked to return, keyed by the upload slot.
// Documents carry doc_type CHECKed to exactly these four slots
// (master-consolidated.sql L112-122), so the machine matches OCR output back to
// the slot the file was uploaded into.
const DOC_TYPE_SYNONYMS: Record<OcrDocTypeSlot, string[]> = {
  id: [
    'passport',
    'driving_licence',
    'driver',
    'national_id',
    'national_identity',
    'identity_card',
    'id_card',
    'identity',
    'proof_of_age',
  ],
  insurance: [
    'insurance_certificate',
    'certificate_of_insurance',
    'insurance_schedule',
    'cover_note',
    'insurance',
  ],
  qualification: [
    'qualification_certificate',
    'certificate',
    'diploma',
    'award',
    'nvq',
    'city_and_guilds',
  ],
  trade_card: [
    'trade_card',
    'gas_safe_card',
    'gas_safe',
    'competent_person_card',
    'registration_card',
    'skill_card',
  ],
};

function buildOcrPrompt(expectedDocType: OcrDocTypeSlot): string {
  const slotGuide: Record<OcrDocTypeSlot, string> = {
    id: 'a photo ID — passport, driving licence or national identity card',
    insurance:
      'an insurance certificate or schedule evidencing current cover',
    qualification:
      'a qualification / award certificate (e.g. NVQ, City & Guilds) proving the trade skill',
    trade_card:
      'a trade / gas-safe / competent-person registration card proving scheme membership',
  };

  return `You are an expert document reader for a UK tradesperson vetting check. Examine the attached image and extract the printed fields.

The file was uploaded as their ${expectedDocType.toUpperCase()} evidence. Expected: ${slotGuide[expectedDocType]}.

Return ONLY valid JSON with exactly these keys:
- docType: what the document actually IS, as a short lowercase machine label, e.g. passport, driving_licence, national_id, id_card, insurance_certificate, insurance_schedule, qualification_certificate, diploma, trade_card, gas_safe_card. Use null only if you cannot tell at all.
- issuer: the organisation that issued the document (e.g. "DVLA", "Gas Safe Register", the training provider). null if not visible.
- docNumber: the reference / registration number printed on the document, as printed. null if none is printed or it is illegible.
- expiryDate: the expiry date as YYYY-MM-DD. null if no expiry is printed or it is illegible.
- confidence: a number 0-1 reflecting how confident you are in BOTH the field extraction AND that this is a genuine, unaltered document of the claimed type.
- flags: an array of short lowercase concern strings. Use ONLY these, empty array when none: "illegible", "partially_visible", "expired", "no_expiry_date", "no_document_number", "possible_alteration", "doc_type_mismatch".

If the image is blank, upside-down, cut off, or clearly not a document, set docType to null and confidence below 0.3. Never invent a field you cannot read.`;
}

// Gemini may return dates in a non-canonical form. Accept YYYY-MM-DD (with or
// without a trailing time) directly, else fall back to Date parsing. Returns
// null when the value is missing or not a real calendar date — a value we would
// reject is never stored into the `date` column (a PostgREST error on a bad
// date is survivable but would lose the whole parse in the same update).
export function normalizeExpiryDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;

  const iso = /^(\d{4})-(\d{2})-(\d{2})/.exec(trimmed);
  let y: number;
  let m: number;
  let d: number;
  if (iso) {
    y = Number(iso[1]);
    m = Number(iso[2]);
    d = Number(iso[3]);
  } else {
    const t = Date.parse(trimmed);
    if (Number.isNaN(t)) return null;
    const dt = new Date(t);
    y = dt.getUTCFullYear();
    m = dt.getUTCMonth() + 1;
    d = dt.getUTCDate();
  }

  if (y < 1900 || y > 2200) return null;

  // Round-trip through Date.UTC so impossible dates (2027-02-31) are rejected
  // rather than handed to Postgres as an invalid `date`.
  const check = new Date(Date.UTC(y, m - 1, d));
  if (
    check.getUTCFullYear() !== y ||
    check.getUTCMonth() !== m - 1 ||
    check.getUTCDate() !== d
  ) {
    return null;
  }
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${y}-${pad(m)}-${pad(d)}`;
}

function normalizeLabel(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

function normalizeDocNumber(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed || null;
}

function normalizeFlags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((f): f is string => typeof f === 'string' && f.trim().length > 0)
    .map((f) => f.trim().toLowerCase());
}

function normalizeConfidence(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

// Lenient containment in both directions: the model's label is a substring of a
// known synonym (e.g. "gas safe" inside "gas_safe_card") or a synonym is a
// substring of the label ("qualification" inside "qualification_certificate").
// The point is not perfect taxonomy but catching slot CONFUSION — a certificate
// uploaded into the ID slot, a gas-safe card into the qualification slot — so
// it lands in review rather than passing as the wrong document type.
function docTypeMatches(
  expected: OcrDocTypeSlot,
  actualLabel: string,
): boolean {
  if (!actualLabel) return false;
  return DOC_TYPE_SYNONYMS[expected].some(
    (syn) => actualLabel.includes(syn) || syn.includes(actualLabel),
  );
}

function guessMimeFromName(fileName: string): string {
  const ext = (fileName.split('.').pop() || '').toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'application/pdf';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'application/octet-stream';
  }
}

/**
 * Send one uploaded document to Gemini and classify the parse.
 *
 * Returns null ONLY when the parse was not attempted (GEMINI_API_KEY absent) —
 * the ingest path then leaves parse_status NULL. Any other outcome is an
 * OcrParse whose parseStatus is written verbatim.
 *
 * The caller passes the raw bytes as a Buffer (the register route runs on the
 * default Node runtime). base64 inflates the payload ~33%; the register form
 * already caps each file, and Vercel functions accept bodies far above that.
 */
export async function parseDocumentImage(input: {
  expectedDocType: OcrDocTypeSlot;
  fileName: string;
  mimeType: string;
  buffer: Buffer;
}): Promise<OcrParse | null> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    console.warn('[document-ocr] GEMINI_API_KEY not set');
    return null;
  }

  const mimeType = input.mimeType || guessMimeFromName(input.fileName);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_OCR_MODEL}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: mimeType,
                    data: input.buffer.toString('base64'),
                  },
                },
                {
                  text: `You return only valid JSON, never markdown or commentary.\n\n${buildOcrPrompt(input.expectedDocType)}`,
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: 'application/json',
          },
        }),
      },
    );

    if (!res.ok) {
      console.warn(
        '[document-ocr] Gemini API returned',
        res.status,
        await res.text().catch(() => ''),
      );
      return { parseStatus: 'failed', promote: false, payload: null };
    }

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      return { parseStatus: 'failed', promote: false, payload: null };
    }

    const raw = JSON.parse(text) as {
      docType?: unknown;
      issuer?: unknown;
      docNumber?: unknown;
      expiryDate?: unknown;
      confidence?: unknown;
      flags?: unknown;
    };

    const confidence = normalizeConfidence(raw.confidence);
    const flags = normalizeFlags(raw.flags);
    const docType = normalizeLabel(raw.docType);

    if (!docType) {
      // The model could not even identify the document (blank / not a document /
      // unreadable). Nothing trustworthy to persist.
      return { parseStatus: 'failed', promote: false, payload: null };
    }

    const payload: DocumentOcrResult = {
      docType,
      issuer: normalizeDocNumber(raw.issuer),
      docNumber: normalizeDocNumber(raw.docNumber),
      expiryDate: normalizeExpiryDate(raw.expiryDate),
      confidence,
      flags,
    };

    const matches = docTypeMatches(input.expectedDocType, docType);
    if (!matches) {
      // Slot confusion is a review signal, not a pass: the file does not appear
      // to be the document type it was uploaded as.
      payload.flags = [...payload.flags, 'doc_type_mismatch'];
    }

    if (matches && confidence >= OCR_HIGH_CONFIDENCE_THRESHOLD) {
      return {
        parseStatus: 'parsed',
        promote: true,
        payload,
      };
    }

    // A parse happened but is not trustworthy enough to promote — keep the
    // document 'pending' (honest fallback → pending_review).
    return { parseStatus: 'low_confidence', promote: false, payload };
  } catch (e) {
    console.warn('[document-ocr] Gemini call failed:', e);
    return { parseStatus: 'failed', promote: false, payload: null };
  }
}
