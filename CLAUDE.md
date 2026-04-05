# Storytime

A kid-friendly storytelling app where a child records what they want a story about, picks options, and gets a generated story with illustration and narrated audio. Designed by a 6-year-old (UX flow) and built for open-source.

@AGENTS.md

## Tech Stack

- **Framework**: Next.js 15+ (App Router), TypeScript
- **Styling**: Tailwind CSS v4 with custom theme variables
- **AI Pipeline**: Gemini 2.5 Flash (transcription + story JSON) → Imagen 4 Fast (illustration) → Google Cloud TTS (narration, multi-voice)
- **Storage**: Vercel Blob (assets), localStorage (story metadata)
- **Deployment**: Vercel

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in API keys
npm run dev                   # http://localhost:3000
```

## Env Vars

See `.env.example` for the full list. Key variables:
- `GOOGLE_CLOUD_PROJECT` — GCP project ID
- `GOOGLE_CLOUD_LOCATION` — Region (e.g. `us-central1`)
- `GOOGLE_SERVICE_ACCOUNT_KEY` — Service account JSON key (single line, used for ALL Google services)
- `ANTHROPIC_API_KEY` — Reserved (unused in current pipeline)
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob
- `APP_GATE_KEY` — Simple password gate

All Google services (Gemini, Imagen, TTS) use one service account. No API keys, no AI Studio.

## Project Structure

```
app/
  page.tsx                  — Home screen (record + story library)
  story/[id]/page.tsx       — Direct-link story view
  api/                      — API routes (transcribe, story, image, tts)
components/
  GateView.tsx              — Password gate screen
  RecordingView.tsx         — Mic recording UI
  ConfirmView.tsx           — Post-recording options
  StoryView.tsx             — Story result display
  AudioControls.tsx         — Audio playback controls
  StoryCard.tsx             — Saved story thumbnail
  LoadingView.tsx           — Generation loading state
types/
  story.ts                  — TypeScript types + Zod schemas
lib/
  env.ts                    — Env var validation + typed config
  googleAuth.ts             — Google auth client (service account)
  geminiVertex.ts           — Gemini 2.5 Flash client (text + multimodal)
  vertexClient.ts           — Imagen REST client
  ttsClient.ts              — Google Cloud TTS client
  storage.ts                — localStorage helpers
scripts/
  verify-google.ts          — Test all Google services (npm run verify:google)
```

## Conventions

- **Styling**: Tailwind utility classes. Custom theme colors defined in `globals.css` (`--primary`, `--accent`, etc.)
- **Font**: Nunito (loaded via next/font)
- **State**: React useState/useCallback. App flow managed as a state machine in `page.tsx` (`gate → home → confirm → loading → story`)
- **Types**: All data types defined in `types/story.ts` with Zod schemas. Infer TS types from schemas.
- **Components**: One component per file in `components/`. Client components use `"use client"` directive.
- **Child-friendly UI**: Large touch targets, rounded corners, bright calm colors, large fonts. No tiny icons without labels, no nested menus.

## Detailed Docs

- [Architecture](docs/architecture.md) — Data flow, screen states, API pipeline
- [API Routes](docs/api.md) — Route specs, inputs, outputs, error handling
- [Google Cloud Setup](docs/google-setup.md) — Service account, credentials, Vercel deployment
- [Backlog](docs/backlog.md) — Planned features and improvements
