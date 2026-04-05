import { getGoogleConfig } from "./env";
import { getGoogleAuthClient } from "./googleAuth";

export const IMAGEN_MODEL = "imagen-4.0-fast-generate-001";

export async function generateImage(prompt: string): Promise<Buffer> {
  const config = getGoogleConfig();
  const auth = getGoogleAuthClient();
  const client = await auth.getClient();
  const token = await client.getAccessToken();

  const url = `https://${config.location}-aiplatform.googleapis.com/v1/projects/${config.projectId}/locations/${config.location}/publishers/google/models/${IMAGEN_MODEL}:predict`;

  console.log("Imagen prompt:", prompt);

  const response = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token.token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "4:3",
        personGeneration: "allow_all",
        addWatermark: true,
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Imagen API error (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const base64Image = data.predictions?.[0]?.bytesBase64Encoded;

  if (!base64Image) {
    console.error("Imagen returned no image. Full response:", JSON.stringify(data));
    throw new Error("No image returned from Imagen API");
  }

  return Buffer.from(base64Image, "base64");
}
