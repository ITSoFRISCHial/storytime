# Storytime

A kid-friendly storytelling app where a child records what they want a story about, picks options, and gets a generated story with illustration and narrated audio. Designed by a 6-year-old (UX flow) and built for open-source.

@AGENTS.md

## Tech Stack

- **Framework**: Next.js 15+ (App Router), TypeScript
- **Styling**: Tailwind CSS v4 with custom theme variables
- **AI Pipeline**: Gemini Flash (transcription) → Claude (story JSON via Structured Outputs) → Imagen 4 (illustration) → Google Cloud TTS (narration)
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
- `GOOGLE_API_KEY` — Gemini transcription
- `GOOGLE_SERVICE_ACCOUNT_KEY` — JSON key for Imagen + TTS
- `GOOGLE_CLOUD_PROJECT` / `GOOGLE_CLOUD_LOCATION` — GCP config
- `ANTHROPIC_API_KEY` — Claude story generation
- `BLOB_READ_WRITE_TOKEN` — Vercel Blob
- `APP_GATE_KEY` — Simple password gate

## Project Structure

```
app/
  page.tsx                  — Home screen (record + story library)
  story/[id]/page.tsx       — Direct-link story view
  api/                      — API routes (transcribe, story, image, tts)
components/
  RecordingView.tsx         — Mic recording UI
  ConfirmView.tsx           — Post-recording options
  StoryView.tsx             — Story result display
  AudioControls.tsx         — Audio playback controls
  StoryCard.tsx             — Saved story thumbnail
  LoadingView.tsx           — Generation loading state
types/
  story.ts                  — TypeScript types + Zod schemas
lib/
  storage.ts                — localStorage helpers
```

## Conventions

- **Styling**: Tailwind utility classes. Custom theme colors defined in `globals.css` (`--primary`, `--accent`, etc.)
- **Font**: Nunito (loaded via next/font)
- **State**: React useState/useCallback. App flow managed as a state machine in `page.tsx` (`home → recording → confirm → loading → story`)
- **Types**: All data types defined in `types/story.ts` with Zod schemas. Infer TS types from schemas.
- **Components**: One component per file in `components/`. Client components use `"use client"` directive.
- **Child-friendly UI**: Large touch targets, rounded corners, bright calm colors, large fonts. No tiny icons without labels, no nested menus.

## Detailed Docs

- [Architecture](docs/architecture.md) — Data flow, screen states, API pipeline
