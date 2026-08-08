import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

interface TutorRequest {
  message: string;
  lessonId?: string;
  sourceLanguage?: string;
  targetLanguage?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { message, lessonId, sourceLanguage = "en", targetLanguage = "hy" } = (await req.json()) as TutorRequest;

    if (!message) {
      return NextResponse.json({ error: "Message required" }, { status: 400 });
    }

    // For now, return a static response – replace with actual AI later
    const response = `I'm your AI tutor for ${targetLanguage}. You said: "${message}". Let's practice!`;

    return NextResponse.json({ response, score: 0.5 });
  } catch (error) {
    console.error("AI tutor error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}