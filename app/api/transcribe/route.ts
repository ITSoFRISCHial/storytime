import { NextRequest, NextResponse } from "next/server";
import { geminiGenerateWithParts } from "@/lib/geminiVertex";

const TRANSCRIPTION_PROMPT = `Transcribe this child's audio recording into a clean plain-text idea for a story.

Rules:
- Preserve the child's meaning.
- Fix obvious recognition mistakes.
- Do not expand the idea.
- Do not add any commentary.
- Return only the plain transcript.`;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File | null;

    if (!audioFile) {
      return NextResponse.json(
        { error: "No audio file provided" },
        { status: 400 }
      );
    }

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64Audio = Buffer.from(arrayBuffer).toString("base64");

    const transcript = await geminiGenerateWithParts([
      {
        inlineData: {
          mimeType: audioFile.type || "audio/webm",
          data: base64Audio,
        },
      },
      { text: TRANSCRIPTION_PROMPT },
    ]);

    if (!transcript.trim()) {
      return NextResponse.json(
        { error: "Could not understand the recording. Try speaking a bit louder!" },
        { status: 422 }
      );
    }

    return NextResponse.json({ transcript: transcript.trim() });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json(
      { error: "Something went wrong. Please try again!" },
      { status: 500 }
    );
  }
}
