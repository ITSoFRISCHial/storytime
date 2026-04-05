import { TextToSpeechClient, protos } from "@google-cloud/text-to-speech";
import { getGoogleConfig } from "./env";

let _ttsClient: TextToSpeechClient | null = null;

function getTTSClient(): TextToSpeechClient {
  if (_ttsClient) return _ttsClient;

  const config = getGoogleConfig();
  const key = config.serviceAccountKey as {
    client_email: string;
    private_key: string;
  };

  _ttsClient = new TextToSpeechClient({
    credentials: {
      client_email: key.client_email,
      private_key: key.private_key,
    },
    projectId: config.projectId,
  });

  return _ttsClient;
}

interface SynthesizeOptions {
  text: string;
  voiceName: string;
  speakingRate?: number;
}

export async function synthesizeSpeech({
  text,
  voiceName,
  speakingRate = 1.0,
}: SynthesizeOptions): Promise<Buffer> {
  const client = getTTSClient();

  const [response] = await client.synthesizeSpeech({
    input: { text },
    voice: {
      name: voiceName,
      languageCode: voiceName.substring(0, 5), // e.g. "en-US" from "en-US-Journey-D"
    },
    audioConfig: {
      audioEncoding:
        protos.google.cloud.texttospeech.v1.AudioEncoding.MP3,
      speakingRate,
    },
  });

  if (!response.audioContent) {
    throw new Error("No audio content returned from TTS API");
  }

  return Buffer.from(response.audioContent as Uint8Array);
}
