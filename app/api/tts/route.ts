import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech } from "@/lib/ttsClient";
import { put } from "@vercel/blob";
import { Character, Scene } from "@/types/story";

// Standard voices pool — assigned to characters in order
// C = warm female, D = deeper male, E = bright female, B = lower male
const VOICE_POOL = [
  "en-US-Standard-C", // narrator: warm female
  "en-US-Standard-D", // character 1: deeper male
  "en-US-Standard-E", // character 2: bright female
  "en-US-Standard-B", // character 3: lower male
];

function assignVoices(characters: Character[]): Record<string, string> {
  const map: Record<string, string> = {};
  let poolIndex = 0;
  for (const char of characters) {
    // Assign narrator first slot; rotate through pool for others
    map[char.name] = VOICE_POOL[poolIndex % VOICE_POOL.length];
    poolIndex++;
  }
  return map;
}

export async function POST(request: NextRequest) {
  try {
    const { scenes, characters } = await request.json() as {
      scenes: Scene[];
      characters: Character[];
    };

    if (!scenes?.length) {
      return NextResponse.json({ error: "No scenes provided" }, { status: 400 });
    }

    const voiceMap = assignVoices(characters ?? []);
    const fallbackVoice = VOICE_POOL[0];

    // Generate each scene's audio in sequence to preserve order
    const clips = await Promise.all(
      scenes.map((scene) =>
        synthesizeSpeech({
          text: scene.text,
          voiceName: voiceMap[scene.speaker] ?? fallbackVoice,
          speakingRate: 0.95,
        })
      )
    );

    // Concatenate MP3 buffers — valid for sequential playback
    const combined = Buffer.concat(clips);

    const { url } = await put(`audio/${Date.now()}.mp3`, combined, {
      access: "public",
      contentType: "audio/mpeg",
    });

    return NextResponse.json({ url });
  } catch (error) {
    console.error("TTS error:", error);
    return NextResponse.json(
      { error: "Couldn't create audio. The story will show without narration." },
      { status: 500 }
    );
  }
}
