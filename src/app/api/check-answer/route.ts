import { NextRequest, NextResponse } from "next/server";
import { fullValidationWithAI } from "@/lib/ai/evaluator";
import { getLessonById, HAYQ_REWARDS, SEED_REWARDS } from "@/lib/lessons/engine";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { 
      userAnswer, 
      lessonId,
      expectedAnswers = [],
      sourceLanguage = "en",
      targetLanguage = "hy",
    } = await req.json();

    if (!userAnswer || !lessonId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const lesson = getLessonById(lessonId);
    if (!lesson) {
        return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    // Determine the source sentence and expected answer for validation
    const primaryExpected = expectedAnswers[0] || "";

    // Find the exercise to get the correct prompt (source)
    const exercise = lesson.exercises.find(e => 
        e.targetAnswer === primaryExpected || (e.acceptableAnswers && e.acceptableAnswers.includes(primaryExpected))
    );

    const sourceSentence = exercise ? exercise.prompt : primaryExpected;

    const result = await fullValidationWithAI({
      userAnswer,
      expectedAnswer: primaryExpected,
      sourceSentence,
      sourceLanguage,
      targetLanguage,
      allValidForms: expectedAnswers,
    });

    // Reward calculation based on standardized engine constants
    let hayq = 0;
    let seeds = 0;

    if (result.accepted) {
      if (result.score >= 0.98) {
        hayq = HAYQ_REWARDS.PERFECT;
        seeds = SEED_REWARDS.PERFECT_EXERCISE;
      } else if (result.score >= 0.85) {
        hayq = HAYQ_REWARDS.EXCELLENT;
      } else if (result.score >= 0.75) {
        hayq = HAYQ_REWARDS.GOOD;
      } else {
        hayq = HAYQ_REWARDS.PARTIAL;
      }
    }
    
    return NextResponse.json({
      correct: result.accepted,
      hayq,
      seeds,
      score: result.score,
      feedback: result.feedback,
      corrections: result.corrections,
      layer: result.layer,
      aiUsed: result.aiUsed,
    });

  } catch (error) {
    console.error("[NUR Lingo API Error]:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
