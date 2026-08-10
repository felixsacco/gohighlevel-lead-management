import { VerifiedCompany } from '@/lib/companies-house';

export interface AiVerificationInput {
  tradespersonId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  trade: string;
  city: string;
  postcode: string;
  yearsExperience: number | null;
  companyNumber: string | null;
  documents: {
    docType: string;
    status: string | null;
    expiryDate: string | null;
    docNumber: string | null;
  }[];
  companiesHouseProfile: VerifiedCompany | null;
}

export interface AiVerificationResult {
  riskLevel: 'low' | 'medium' | 'high';
  riskScore: number; // 0-100, higher = riskier
  confidence: number; // 0-1
  flags: string[];
  summary: string;
}

const DEEPSEEK_VERIFY_MODEL = 'deepseek-chat';

function buildVerifyPrompt(input: AiVerificationInput): string {
  const docs = input.documents
    .map((d) => {
      const parts = [`  - ${d.docType}`];
      if (d.status) parts.push(`(status: ${d.status})`);
      if (d.expiryDate) parts.push(`(expires: ${d.expiryDate})`);
      if (d.docNumber) parts.push(`(ref: ${d.docNumber})`);
      return parts.join(' ');
    })
    .join('\n');

  const ch = input.companiesHouseProfile;

  return `Analyze this UK tradesperson's profile for verification risk. Return a structured assessment.

PROFILE:
- Name: ${input.firstName} ${input.lastName}
- Trade: ${input.trade}
- Location: ${input.city}, ${input.postcode}
- Years experience: ${input.yearsExperience ?? 'not provided'}
- Company number: ${input.companyNumber ?? 'none'}
- Phone: ${input.phone}
- Email: ${input.email}

DOCUMENTS UPLOADED:
${docs || '  (none)'}

COMPANIES HOUSE:
${ch ? `- Name: ${ch.companyName}
- Status: ${ch.status}
- Type: ${ch.type}
- Incorporated: ${ch.dateOfCreation}
- SIC codes: ${ch.sicCodes.join(', ') || 'none'}
- Address: ${ch.address.line1}, ${ch.address.locality}, ${ch.address.postalCode}` : '  (no Companies House match)'}

Rate risk as low/medium/high (score 0-100), confidence 0-1. List any red flags (empty array if none). Write a 1-2 sentence summary.

Red flags to consider: missing documents, name mismatch with Companies House, dissolved/inactive company, company type doesn't match trade, SIC codes unrelated to trade, expired insurance, very low experience, suspicious location patterns, phone/email formatting issues.

Return ONLY valid JSON with keys: riskLevel, riskScore, confidence, flags, summary.`;
}

export async function aiVerifyTradesperson(
  input: AiVerificationInput,
): Promise<AiVerificationResult | null> {
  const apiKey = process.env.DEEPSEEK_API_KEY?.trim();
  if (!apiKey) {
    console.warn('[ai-verify] DEEPSEEK_API_KEY not set');
    return null;
  }

  try {
    const res = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEEPSEEK_VERIFY_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a verification risk assessor for a UK tradesperson platform. You analyze profile data for red flags and inconsistencies. You return only valid JSON, never markdown or commentary.',
          },
          { role: 'user', content: buildVerifyPrompt(input) },
        ],
        max_tokens: 500,
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!res.ok) {
      console.warn(
        '[ai-verify] DeepSeek API returned',
        res.status,
        await res.text().catch(() => ''),
      );
      return null;
    }

    const json = (await res.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = json.choices?.[0]?.message?.content?.trim();
    if (!text) return null;

    const parsed = JSON.parse(text) as AiVerificationResult;

    if (
      !parsed.riskLevel ||
      typeof parsed.riskScore !== 'number' ||
      typeof parsed.confidence !== 'number' ||
      !Array.isArray(parsed.flags) ||
      typeof parsed.summary !== 'string'
    ) {
      console.warn('[ai-verify] Unexpected response shape:', text);
      return null;
    }

    return parsed;
  } catch (e) {
    console.warn('[ai-verify] DeepSeek call failed:', e);
    return null;
  }
}
