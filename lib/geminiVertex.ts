import { GoogleGenAI, Part } from "@google/genai";
import { getGoogleConfig } from "./env";

export const GEMINI_MODEL = "gemini-2.5-flash";

let _ai: GoogleGenAI | null = null;

export function getAI(): GoogleGenAI {
  if (_ai) return _ai;
  const config = getGoogleConfig();
  const key = config.serviceAccountKey as {
    client_email: string;
    private_key: string;
  };
  _ai = new GoogleGenAI({
    vertexai: true,
    project: config.projectId,
    location: config.location,
    googleAuthOptions: {
      credentials: { client_email: key.client_email, private_key: key.private_key },
      projectId: config.projectId,
    },
  });
  return _ai;
}

export async function geminiGenerateText(prompt: string): Promise<string> {
  const res = await getAI().models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
  });
  const text = res.text;
  if (!text) throw new Error("No text returned from Gemini");
  return text;
}

export async function geminiGenerateWithParts(parts: Part[]): Promise<string> {
  const res = await getAI().models.generateContent({
    model: GEMINI_MODEL,
    contents: [{ role: "user", parts }],
  });
  const text = res.text;
  if (!text) throw new Error("No text returned from Gemini");
  return text;
}
