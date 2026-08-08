/**
 * NUR Lingo — AI Semantic Evaluation Pipeline
 *
 * Uses LLM (OpenRouter → Claude / Gemini / Llama) to evaluate meaning
 * equivalence when rule-based layers are insufficient.
 *
 * This layer is:
 * - Rate-limited (only called when other layers fail)
 * - Cacheable (same question/answer pairs reuse results)
 * - Auditable (all decisions logged with reasoning)
 * - Bilingual (prompt in both Armenian and English)
 */

import type { ValidationResult } from "../semantic/validator";

// ─── AI Provider Config ──────────────────────────────────────────────────────

export type AIProvider = "openrouter" | "groq" | "gemini";

export interface AIEvalConfig {
  provider: AIProvider;
  model: string;
  apiKey: string;
  temperature: number;
  maxTokens: number;
  timeoutMs: number;
}

const PROVIDER_ENDPOINTS: Record<AIProvider, string> = {
  openrouter: "https://openrouter.ai/api/v1/chat/completions",
  groq:       "https://api.groq.com/openai/v1/chat/completions",
  gemini:     "https://generativelanguage.googleapis.com/v1beta/models",
};

const DEFAULT_MODELS: Record<AIProvider, string> = {
  openrouter: "anthropic/claude-3-haiku",
  groq:       "llama3-8b-8192",
  gemini:     "gemini-1.5-flash",
};

// ─── AI Evaluation Request ───────────────────────────────────────────────────

export interface AIEvalRequest {
  sourceSentence: string;
  expectedAnswer: string;
  userAnswer: string;
  sourceLanguage: "en" | "hy" | "ru";
  targetLanguage: "en" | "hy" | "ru";
  allValidForms?: string[];
  context?: string;
}

export interface AIEvalResponse {
  accepted: boolean;
  score: number;
  reasoning: string;
  areFunctionallyEquivalent: boolean;
  issues?: string[];
  suggestions?: string[];
  confidence: number;
  provider: AIProvider;
  cached?: boolean;
}

// ─── System Prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are an expert language evaluator for NUR Lingo, an Armenian language learning platform.

Your task: Evaluate whether a student's answer is SEMANTICALLY EQUIVALENT to the expected answer, given the source sentence.

KEY PRINCIPLES for evaluation:
1. Armenian has FREE WORD ORDER. "Ես գնում եմ տուն" and "Ես տուն եմ գնում" are BOTH correct for "I am going home".
2. Subject pronouns can be DROPPED in Armenian when implied by verb conjugation.
3. SYNONYMS should be accepted (e.g., "բնակարան" for "տուն", "auto" for "car").
4. Different but equivalent verb forms should be accepted if meaning is preserved.
5. Eastern Armenian (Արևելահայերեն) standard orthography is preferred for Armenian.
6. Minor spelling mistakes or typos should be flagged but may still be accepted if the meaning is clear (lower the score slightly).

Response format — return ONLY valid JSON:
{
  "accepted": true/false,
  "score": 0.0-1.0,
  "areFunctionallyEquivalent": true/false,
  "reasoning": "brief explanation in English",
  "issues": ["list of issues if any"],
  "suggestions": ["better phrasings if applicable"],
  "confidence": 0.0-1.0
}`;

// ─── Build evaluation prompt ─────────────────────────────────────────────────

function buildPrompt(req: AIEvalRequest): string {
  const validList = req.allValidForms?.length
    ? `\nKnown valid forms:\n${req.allValidForms.map((f) => `  • ${f}`).join("\n")}`
    : "";

  return `Evaluate this language exercise:

Source sentence (${req.sourceLanguage}): "${req.sourceSentence}"
Expected answer (${req.targetLanguage}): "${req.expectedAnswer}"
Student's answer (${req.targetLanguage}): "${req.userAnswer}"${validList}

Does the student's answer convey the same meaning as the source sentence and is it semantically equivalent to the expected answer?
Return ONLY the JSON object described in the system prompt.`;
}

// ─── Simple in-memory cache ──────────────────────────────────────────────────

const evalCache = new Map<string, AIEvalResponse>();

function cacheKey(req: AIEvalRequest): string {
  return `${req.sourceSentence}|||${req.userAnswer}|||${req.expectedAnswer}|||${req.targetLanguage}`;
}

// ─── OpenRouter / compatible API call ───────────────────────────────────────

async function callOpenRouterCompatible(
  config: AIEvalConfig,
  prompt: string
): Promise<AIEvalResponse> {
  const endpoint = PROVIDER_ENDPOINTS[config.provider];

  const body = {
    model: config.model,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: prompt },
    ],
    temperature: config.temperature,
    max_tokens: config.maxTokens,
    response_format: { type: "json_object" },
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${config.apiKey}`,
      ...(config.provider === "openrouter"
        ? {
            "HTTP-Referer": "https://nurlingo.am",
            "X-Title": "NUR Lingo Armenian Learning",
          }
        : {}),
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(config.timeoutMs),
  });

  if (!response.ok) {
    throw new Error(`AI API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? "{}";

  let parsed: Omit<AIEvalResponse, "provider" | "cached">;
  try {
    parsed = JSON.parse(content.replace(/```json|```/g, "").trim());
  } catch {
    throw new Error(`Failed to parse AI response: ${content}`);
  }

  return {
    ...parsed,
    provider: config.provider,
    cached: false,
  };
}

// ─── Main AI Evaluator ───────────────────────────────────────────────────────

export async function evaluateWithAI(
  req: AIEvalRequest,
  config?: Partial<AIEvalConfig>
): Promise<AIEvalResponse> {
  // Check cache
  const key = cacheKey(req);
  const cached = evalCache.get(key);
  if (cached) return { ...cached, cached: true };

  // Build config with defaults
  const provider: AIProvider = (config?.provider as AIProvider) ?? "openrouter";
  const fullConfig: AIEvalConfig = {
    provider,
    model: config?.model ?? DEFAULT_MODELS[provider],
    apiKey:
      config?.apiKey ??
      (provider === "openrouter"
        ? process.env.OPENROUTER_API_KEY ?? ""
        : provider === "groq"
        ? process.env.GROQ_API_KEY ?? ""
        : process.env.GEMINI_API_KEY ?? ""),
    temperature: config?.temperature ?? 0.1,
    maxTokens: config?.maxTokens ?? 300,
    timeoutMs: config?.timeoutMs ?? 8000,
  };

  if (!fullConfig.apiKey) {
    // Fallback: no API key available — return cautious neutral result
    return {
      accepted: false,
      score: 0.5,
      areFunctionallyEquivalent: false,
      reasoning: "AI evaluation unavailable (no API key configured)",
      confidence: 0.3,
      provider,
      cached: false,
    };
  }

  const prompt = buildPrompt(req);
  const result = await callOpenRouterCompatible(fullConfig, prompt);

  // Cache successful results
  evalCache.set(key, result);

  return result;
}

// ─── Convert AI result → ValidationResult ───────────────────────────────────

export function aiResponseToValidation(
  aiResult: AIEvalResponse
): ValidationResult {
  const accepted =
    aiResult.accepted ||
    aiResult.areFunctionallyEquivalent ||
    aiResult.score >= 0.75;

  return {
    accepted,
    score: aiResult.score,
    layer: "ai",
    feedback: accepted
      ? `✅ ${aiResult.reasoning}`
      : `❌ ${aiResult.reasoning}${
          aiResult.issues?.length
            ? ` | Issues: ${aiResult.issues.join("; ")}`
            : ""
        }`,
    corrections: aiResult.suggestions,
    confidence: aiResult.confidence,
    debug: {
      ai_provider: aiResult.provider,
      ai_reasoning: aiResult.reasoning,
      ai_issues: aiResult.issues,
      cached: aiResult.cached,
    },
  };
}

// ─── Full AI-augmented validation pipeline ───────────────────────────────────

export async function fullValidationWithAI(
  req: AIEvalRequest,
  aiConfig?: Partial<AIEvalConfig>
): Promise<ValidationResult & { aiUsed: boolean }> {
  // Import inline to avoid circular deps
  const { validateAnswer } = await import("../semantic/validator");

  const ruleResult = await validateAnswer({
    userAnswer: req.userAnswer,
    expectedAnswer: req.expectedAnswer,
    sourceSentence: req.sourceSentence,
    sourceLanguage: req.sourceLanguage,
    targetLanguage: req.targetLanguage,
    options: {
      allValidAnswers: req.allValidForms,
    }
  });

  // If rule-based engine is confident → return without AI
  if (ruleResult.accepted && ruleResult.confidence >= 0.85) {
    return { ...ruleResult, aiUsed: false };
  }

  // If clearly rejected with high confidence → return without AI
  if (!ruleResult.accepted && ruleResult.confidence >= 0.90) {
    return { ...ruleResult, aiUsed: false };
  }

  // Ambiguous zone → escalate to AI
  try {
    const aiResult = await evaluateWithAI(req, aiConfig);
    const aiValidation = aiResponseToValidation(aiResult);

    // AI takes priority in ambiguous zone
    return {
      ...aiValidation,
      aiUsed: true,
      // Preserve any corrections from rule-based layer if AI has none
      corrections: aiValidation.corrections ?? ruleResult.corrections,
    };
  } catch (error) {
    // AI failed → fall back to rule-based result
    console.error("AI evaluation failed:", error);
    return {
      ...ruleResult,
      aiUsed: false,
      feedback: ruleResult.feedback + " (AI evaluation unavailable)",
    };
  }
}
