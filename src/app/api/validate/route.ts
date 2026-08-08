import { NextRequest, NextResponse } from "next/server";
import { fullValidationWithAI } from "@/lib/ai/evaluator";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.legacy) {
      // Simple exact match for legacy systems
      const correct =
        body.userAnswer.trim().toLowerCase() ===
        body.expectedAnswer.trim().toLowerCase();
      return NextResponse.json({
        accepted: correct,
        score: correct ? 1.0 : 0,
        layer: "exact_match",
        feedback: correct ? "Correct!" : "Try again",
      });
    } else {
      // Full pipeline including AI fallback
      const aiResult = await fullValidationWithAI({
        userAnswer: body.userAnswer,
        expectedAnswer: body.expectedAnswer,
        sourceSentence: body.englishOriginal,
        sourceLanguage: body.sourceLanguage || "en",
        targetLanguage: body.targetLanguage || "hy",
        allValidForms: body.allValidAnswers,
      });

      return NextResponse.json(aiResult);
    }
  } catch (error) {
    console.error("[NUR Lingo API Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
