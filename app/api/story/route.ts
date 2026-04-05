import { NextRequest, NextResponse } from "next/server";
import { getAI, GEMINI_MODEL } from "@/lib/geminiVertex";
import { StoryGenerationSchema, StoryOptions } from "@/types/story";

const STORY_SCHEMA = {
  type: "object",
  properties: {
    title: { type: "string" },
    characters: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          voiceStyle: { type: "string" },
          description: { type: "string" },
        },
        required: ["name", "voiceStyle", "description"],
      },
    },
    scenes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          speaker: { type: "string" },
          text: { type: "string" },
        },
        required: ["speaker", "text"],
      },
    },
    story: { type: "string" },
    simple_story: { type: "string" },
    safety_notes: {
      type: "object",
      properties: {
        is_safe: { type: "boolean" },
        notes: { type: "string" },
      },
      required: ["is_safe", "notes"],
    },
  },
  required: ["title", "characters", "scenes", "story", "simple_story", "safety_notes"],
};

function buildStoryPrompt(transcript: string, options: StoryOptions): string {
  const lines = [`A child wants a story about: "${transcript}"`];
  if (options.onceUponATime) lines.push('- Start with "Once upon a time"');
  if (options.happilyEverAfter) lines.push('- End with "happily ever after"');
  lines.push(`
Guidelines:
- Written for a 6-year-old to understand when read aloud
- Use only simple, everyday words a kindergartener would know — no long or fancy words
- Short sentences. Lots of action. Characters say fun things out loud.
- Tone: warm, playful, a little silly, exciting
- Keep it positive and age-appropriate
- Up to 4 named characters (always include a Narrator)
- scenes: break the full story into narration + dialogue chunks for read-aloud TTS
- story: 300–400 words, simple vocabulary, fun to read aloud
- simple_story: even shorter sentences, 80–120 words, for early readers sounding out words
- voiceStyle per character: TTS hint (e.g. "warm, calm", "bright, energetic")`);
  return lines.join("\n");
}

const IMAGE_PROMPT_SYSTEM = `You are an expert children's book illustrator.

Your task: Convert a children's story into ONE vivid image description of its most important moment.

Requirements:
- Choose the single most emotionally meaningful or visually rich scene
- Write in a way that can be used directly for image generation
- Use a child-friendly illustrated style (warm, whimsical, colorful)
- Include: main characters (appearance, expressions, actions), setting (time of day, environment, key details), mood and emotions, lighting and color palette
- Keep it visually specific but not overly long (5–8 sentences max)
- Avoid abstract language — describe only what can be seen

Style: Soft storybook illustration (like a picture book). Gentle, friendly, safe for young children. Slightly magical or imaginative if appropriate.

Output ONLY the image description. Do not explain your reasoning.`;

async function generateImagePrompt(storyText: string): Promise<string> {
  const res = await getAI().models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      { role: "user", parts: [{ text: `${IMAGE_PROMPT_SYSTEM}\n\nStory:\n"""\n${storyText}\n"""` }] },
    ],
  });
  if (!res.text) throw new Error("No image prompt returned from Gemini");
  return res.text.trim();
}

export async function POST(request: NextRequest) {
  try {
    const { transcript, options } = (await request.json()) as {
      transcript: string;
      options: StoryOptions;
    };

    if (!transcript) {
      return NextResponse.json({ error: "No transcript provided" }, { status: 400 });
    }

    // Step 1: Generate story JSON
    const storyRes = await getAI().models.generateContent({
      model: GEMINI_MODEL,
      contents: buildStoryPrompt(transcript, options),
      config: {
        responseMimeType: "application/json",
        responseSchema: STORY_SCHEMA,
      },
    });

    if (!storyRes.text) throw new Error("No response from Gemini");

    const raw = JSON.parse(storyRes.text);

    const parsed = StoryGenerationSchema.safeParse(raw);
    if (!parsed.success) {
      console.error("Schema validation failed:", parsed.error);
      throw new Error("Story output did not match expected format");
    }

    if (!parsed.data.safety_notes.is_safe) {
      return NextResponse.json(
        { error: "Let's try a different story idea!" },
        { status: 422 }
      );
    }

    // Step 2: Generate image prompt from the finished story
    const image_prompt = await generateImagePrompt(parsed.data.story);

    return NextResponse.json({ ...parsed.data, image_prompt });
  } catch (error) {
    console.error("Story generation error:", error);
    return NextResponse.json(
      { error: "Couldn't write the story. Please try again!" },
      { status: 500 }
    );
  }
}
