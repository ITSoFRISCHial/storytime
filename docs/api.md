# API Routes

## POST /api/transcribe

Transcribes a child's audio recording into a clean text prompt for story generation.

### Request

- **Content-Type**: `multipart/form-data`
- **Body**: `audio` field containing the recorded audio file (webm/wav)

### Response

**Success (200)**:
```json
{ "transcript": "a story about a fox who goes on an adventure" }
```

**Errors**:
- `400` — No audio file provided
- `422` — Audio was received but could not be understood (empty transcript)
- `500` — Gemini API error

### Implementation

- Uses Gemini Flash (`gemini-2.0-flash`) via `@google/generative-ai` SDK
- Audio is sent as base64 inline data
- Transcription prompt normalizes child speech: preserves meaning, fixes recognition errors, does not embellish
- Client helper: `lib/gemini.ts` (lazy-initialized, uses `GOOGLE_API_KEY`)

### Env vars

- `GOOGLE_API_KEY` — Google AI Studio API key

---

## POST /api/story (planned — Phase 4)

Generates a structured story from a transcript.

## POST /api/image (planned — Phase 5)

Generates a cartoon illustration from an image prompt.

## POST /api/tts (planned — Phase 6)

Generates narrated audio from story scenes.
