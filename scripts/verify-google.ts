import { config } from "dotenv";
config({ path: ".env.local" });

import { getGoogleConfig } from "../lib/env";
import { getGoogleAuthClient } from "../lib/googleAuth";
import { generateImage } from "../lib/vertexClient";
import { geminiGenerateText } from "../lib/geminiVertex";
import { synthesizeSpeech } from "../lib/ttsClient";

async function main() {
  console.log("=== Google Cloud Verification ===\n");

  // 1. Env validation
  console.log("1. Checking environment variables...");
  try {
    const cfg = getGoogleConfig();
    console.log(`   Project:  ${cfg.projectId}`);
    console.log(`   Location: ${cfg.location}`);
    console.log(`   Key:      (parsed OK)\n`);
  } catch (e) {
    console.error(`   FAIL: ${e}\n`);
    process.exit(1);
  }

  // 2. Auth
  console.log("2. Testing authentication...");
  try {
    const auth = getGoogleAuthClient();
    const client = await auth.getClient();
    const token = await client.getAccessToken();
    console.log(`   Token:    ${token.token ? "OK" : "MISSING"}\n`);
  } catch (e) {
    console.error(`   FAIL: ${e}\n`);
    process.exit(1);
  }

  // 3. Gemini
  console.log("3. Testing Gemini (Vertex AI)...");
  try {
    const text = await geminiGenerateText("Say hello in one word.");
    console.log(`   Response: "${text.trim()}"`);
    console.log("   PASS\n");
  } catch (e) {
    console.error(`   FAIL: ${e}\n`);
  }

  // 4. Imagen
  console.log("4. Testing Imagen (Vertex AI)...");
  try {
    const imageBuffer = await generateImage("A happy cartoon fox, simple illustration");
    console.log(`   Image:    ${imageBuffer.length} bytes`);
    console.log("   PASS\n");
  } catch (e) {
    console.error(`   FAIL: ${e}\n`);
  }

  // 5. TTS
  console.log("5. Testing Cloud Text-to-Speech...");
  try {
    const audioBuffer = await synthesizeSpeech({
      text: "Hello!",
      voiceName: "en-US-Journey-D",
    });
    console.log(`   Audio:    ${audioBuffer.length} bytes`);
    console.log("   PASS\n");
  } catch (e) {
    console.error(`   FAIL: ${e}\n`);
  }

  console.log("=== Done ===");
}

main();
