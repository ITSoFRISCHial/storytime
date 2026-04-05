import { NextRequest, NextResponse } from "next/server";
import { generateImage } from "@/lib/vertexClient";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();
    if (!prompt) {
      return NextResponse.json({ error: "No prompt provided" }, { status: 400 });
    }

    console.log("Imagen prompt:", prompt);
    const imageBuffer = await generateImage(prompt);

    const { url } = await put(`images/${Date.now()}.png`, imageBuffer, {
      access: "public",
      contentType: "image/png",
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Image generation error:", error);
    return NextResponse.json(
      { error: "Couldn't draw the picture. The story will show without an image." },
      { status: 500 }
    );
  }
}
