const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";
const TIMEOUT_MS = 15_000;

export interface DeepSeekEstimateInput {
  trade: string;
  description: string;
  postcode?: string;
  urgency?: string;
  availability?: string;
}

export interface DeepSeekClassification {
  jobType: string;
  complexity: "low" | "medium" | "high";
  accessDifficulty: "easy" | "moderate" | "hard";
  estimatedHours: number;
  materialsRequired: string[];
  source: "deepseek";
}

// Legacy interface kept for backward compat with any callers not yet updated
export interface DeepSeekEstimate {
  exactPrice: number;
  min: number;
  max: number;
  estimateLabel: string;
  breakdown: {
    materials: string;
    labour: string;
    time: string;
  };
  confidence: "high" | "medium" | "low";
  notes: string;
  source: "deepseek";
}

function getPostcodeRegion(postcode: string): string {
  if (!postcode) return "UK average";
  const area = postcode.replace(/\s+/g, "").toUpperCase();
  // London postcodes
  if (/^(E|EC|N|NW|SE|SW|W|WC)/.test(area)) return "London";
  // South East
  if (/^(BN|BR|CR|CT|DA|GU|ME|MK|OX|PO|RG|RH|SL|SO|TN)/.test(area)) return "South East";
  // South West
  if (/^(BA|BH|BS|DT|EX|GL|PL|SN|SP|TA|TQ|TR)/.test(area)) return "South West";
  // East of England
  if (/^(AL|CB|CM|CO|EN|HP|IG|IP|LU|NR|PE|RM|SG|SS|WD)/.test(area)) return "East of England";
  // East Midlands
  if (/^(DE|DN|LE|LN|NG|NN)/.test(area)) return "East Midlands";
  // West Midlands
  if (/^(B|CV|DY|HR|ST|TF|WR|WS|WV)/.test(area)) return "West Midlands";
  // Yorkshire & Humber
  if (/^(BD|DN|HD|HG|HU|HX|LS|S|WF|YO)/.test(area)) return "Yorkshire & Humber";
  // North West
  if (/^(BB|BL|CA|CH|CW|FY|L|LA|M|OL|PR|SK|WA|WN)/.test(area)) return "North West";
  // North East
  if (/^(DH|DL|NE|SR|TS)/.test(area)) return "North East";
  // Scotland
  if (/^(AB|DD|DG|EH|FK|G|HS|IV|KA|KW|KY|ML|PA|PH|TD|ZE)/.test(area)) return "Scotland";
  // Wales
  if (/^(CF|LD|LL|NP|SA|SY)/.test(area)) return "Wales";
  // Northern Ireland
  if (/^BT/.test(area)) return "Northern Ireland";
  return "UK average";
}

function buildClassificationPrompt(input: DeepSeekEstimateInput): string {
  const region = getPostcodeRegion(input.postcode || "");

  return `You are a UK trades job classifier. Analyse this job description and classify it — do NOT estimate any pricing. The pricing is handled by a separate calculator.

Job details:
Trade: ${input.trade}
Description: ${input.description}
Postcode: ${input.postcode || "Not provided"} → ${region}
Urgency: ${input.urgency || "normal"}

Rules:
1. Classify the job type in plain English (e.g. "boiler repair", "socket installation", "full rewire")
2. complexity: "low" (simple, straightforward), "medium" (typical trade work), or "high" (complex, multi-stage, safety-critical)
3. accessDifficulty: "easy" (clear access), "moderate" (some obstacles), or "hard" (confined space, height, difficult access)
4. estimatedHours: realistic total person-hours for a qualified tradesperson (number only)
5. materialsRequired: list of main materials/supplies needed (string array)

Return ONLY valid JSON (no markdown, no explanation):
{
  "jobType": "<string>",
  "complexity": "<low|medium|high>",
  "accessDifficulty": "<easy|moderate|hard>",
  "estimatedHours": <number>,
  "materialsRequired": ["<string>", ...]
}`;
}

function hashInput(input: DeepSeekEstimateInput): string {
  return `${input.trade}::${input.description.trim().toLowerCase()}::${input.postcode || ""}::${input.urgency || ""}::${input.availability || ""}`;
}

const CLASSIFICATION_CACHE_TTL = 30 * 60 * 1000; // 30 minutes

interface CacheEntry {
  result: DeepSeekClassification;
  at: number;
}

const classificationCache = new Map<string, CacheEntry>();

function cacheGet(key: string): DeepSeekClassification | null {
  const entry = classificationCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.at > CLASSIFICATION_CACHE_TTL) {
    classificationCache.delete(key);
    return null;
  }
  return entry.result;
}

function cacheSet(key: string, result: DeepSeekClassification): void {
  if (classificationCache.size >= 500) {
    const first = classificationCache.keys().next().value;
    if (first !== undefined) classificationCache.delete(first);
  }
  classificationCache.set(key, { result, at: Date.now() });
}

const VALID_COMPLEXITIES = ["low", "medium", "high"];
const VALID_ACCESS = ["easy", "moderate", "hard"];

function sanitizeClassification(raw: Record<string, any>, trade: string): DeepSeekClassification {
  // If the AI returned a price field, warn and discard it
  if ("price" in raw || "exactPrice" in raw || "min" in raw || "max" in raw || "cost" in raw) {
    console.warn("DeepSeekService: AI returned price in classification response — discarding price fields");
  }

  const jobType = typeof raw.jobType === "string" && raw.jobType.trim() ? raw.jobType.trim() : trade;
  const complexity = VALID_COMPLEXITIES.includes(raw.complexity) ? raw.complexity : "medium";
  const accessDifficulty = VALID_ACCESS.includes(raw.accessDifficulty) ? raw.accessDifficulty : "moderate";
  const estimatedHours = typeof raw.estimatedHours === "number" && raw.estimatedHours > 0 && raw.estimatedHours <= 1000
    ? Math.round(raw.estimatedHours * 10) / 10
    : 2;
  const materialsRequired = Array.isArray(raw.materialsRequired)
    ? raw.materialsRequired.filter((m: any) => typeof m === "string" && m.trim()).map((m: string) => m.trim())
    : [];

  return {
    jobType,
    complexity,
    accessDifficulty,
    estimatedHours,
    materialsRequired,
    source: "deepseek",
  };
}

export class DeepSeekService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.DEEPSEEK_API_KEY || "";
  }

  async generateClassification(input: DeepSeekEstimateInput): Promise<DeepSeekClassification | null> {
    if (!this.apiKey) {
      console.warn("DeepSeekService: DEEPSEEK_API_KEY not configured, skipping AI classification");
      return null;
    }

    const cacheKey = hashInput(input);
    const cached = cacheGet(cacheKey);
    if (cached) return cached;

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(DEEPSEEK_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: "You are a UK trades job classifier. Always respond with valid JSON only. Never include pricing or cost estimates." },
            { role: "user", content: buildClassificationPrompt(input) },
          ],
          temperature: 0,
          max_tokens: 400,
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        console.error("DeepSeek API error:", response.status, await response.text().catch(() => ""));
        return null;
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || "";

      // Strip markdown code fences if present
      const jsonStr = content.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
      const rawParsed = JSON.parse(jsonStr) as Record<string, any>;
      const result = sanitizeClassification(rawParsed, input.trade);

      cacheSet(cacheKey, result);
      return result;
    } catch (error: any) {
      if (error.name === "AbortError") {
        console.warn("DeepSeekService: request timed out");
      } else {
        console.error("DeepSeekService: error generating classification", error);
      }
      return null;
    } finally {
      clearTimeout(timer);
    }
  }
}

export const deepseekService = new DeepSeekService();

export interface DescriptionValidation {
  wordCount: number;
  minWords: number;
  hasEnoughWords: boolean;
  isSpam: boolean;
  spamReason: string | null;
  spellingIssues: Array<{ word: string; suggestion: string }>;
  feedback: string | null;
}

export async function validateDescription(description: string, trade: string): Promise<DescriptionValidation> {
  const words = description.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const minWords = 10;
  const hasEnoughWords = wordCount >= minWords;

  if (!hasEnoughWords) {
    return {
      wordCount,
      minWords,
      hasEnoughWords,
      isSpam: false,
      spamReason: null,
      spellingIssues: [],
      feedback: `Please write at least ${minWords} words describing your job.`,
    };
  }

  // Try AI spell check via DeepSeek
  const result: DescriptionValidation = {
    wordCount,
    minWords,
    hasEnoughWords,
    isSpam: false,
    spamReason: null,
    spellingIssues: [],
    feedback: null,
  };

  try {
    const apiKey = process.env.DEEPSEEK_API_KEY || '';
    if (!apiKey) {
      result.feedback = 'AI review unavailable — check spelling manually';
      return result;
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: 'You are a UK English spell checker for trades job descriptions. Only check for spelling mistakes and grammar errors — do NOT judge whether the job is genuine or legitimate. Return ONLY valid JSON.',
          },
          {
            role: 'user',
            content: `Trade: ${trade}\nDescription: "${description}"\n\nReturn JSON:\n{\n  "spellingErrors": [{"word": "misspelled", "suggestion": "correct"}],\n  "feedback": "brief note about any corrections needed, or null if fine"\n}`,
          },
        ],
        temperature: 0,
        max_tokens: 300,
      }),
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (response.ok) {
      const data = await response.json();
      const content = data.choices?.[0]?.message?.content || '';
      const jsonStr = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
      const parsed = JSON.parse(jsonStr);
      result.spellingIssues = (parsed.spellingErrors || []).map((e: any) => ({
        word: e.word || '',
        suggestion: e.suggestion || '',
      }));
      result.feedback = parsed.feedback || null;
    }
  } catch {
    // AI check failed silently
  }

  return result;
}
