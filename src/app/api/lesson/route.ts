/**
 * NUR Lingo — /api/lesson
 * GET: Fetch lesson data with exercises
 * POST: Submit lesson completion, update progress
 */
import { NextRequest, NextResponse } from "next/server";
import {
  LESSONS,
  UNITS,
  getLessonById,
  getUnitById,
  getLessonsForUnit,
  hayqToLevel,
} from "@/lib/lessons/engine";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id    = searchParams.get("id");
  const unit  = searchParams.get("unit");
  const all   = searchParams.get("all");

  // ── All lessons + units ────────────────────────────────────────────────
  if (all) {
    return NextResponse.json({
      units: UNITS,
      lessons: LESSONS.map((l) => ({
        ...l,
        exerciseCount: l.exercises.length,
        exercises: undefined,   // omit full exercises in list view
      })),
    });
  }

  // ── Unit + its lessons ─────────────────────────────────────────────────
  if (unit) {
    const u = getUnitById(unit);
    if (!u) return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    const lessons = getLessonsForUnit(unit);
    return NextResponse.json({ unit: u, lessons });
  }

  // ── Single lesson with full exercises ─────────────────────────────────
  if (id) {
    const lesson = getLessonById(id);
    if (!lesson) return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    return NextResponse.json(lesson);
  }

  // ── Default: unit list ─────────────────────────────────────────────────
  return NextResponse.json({ units: UNITS, totalLessons: LESSONS.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lessonId, hayqEarned, correctAnswers, totalAnswers } = body;

    if (!lessonId) {
      return NextResponse.json({ error: "lessonId required" }, { status: 400 });
    }

    const lesson = getLessonById(lessonId);
    if (!lesson) {
      return NextResponse.json({ error: "Lesson not found" }, { status: 404 });
    }

    const score = totalAnswers > 0 ? Math.round((correctAnswers / totalAnswers) * 100) : 0;
    const levelInfo = hayqToLevel(hayqEarned ?? 0);

    return NextResponse.json({
      lessonId,
      score,
      hayqEarned: hayqEarned ?? 0,
      levelInfo,
      status: score >= 70 ? "completed" : "needs_review",
      message:
        score >= 90
          ? "Կատարյալ! (Perfect!)"
          : score >= 70
          ? "Շատ լավ! (Very good!)"
          : "Փորձեք կրկին: (Try again.)",
    });
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
