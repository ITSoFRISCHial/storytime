# Architecture

## Screen Flow

The app is a single-page state machine with 5 states:

```
home → recording → confirm → loading → story
  ↑                   │                   │
  │                   └── re-record ──────┘
  └──────────── new story ────────────────┘
```

- **home**: "Storytime" title, big CTA button, saved stories grid
- **recording**: Mic capture with timer (max 30s), stop button
- **confirm**: Audio preview, re-record option, "Once upon a time" / "Happily ever after" toggles, confirm button
- **loading**: Spinner with rotating messages while AI generates content
- **story**: Image, story text (full/simplified toggle), audio controls, new story button

State is managed in `app/page.tsx` via `useState<AppScreen>`.

Direct story links are supported via `app/story/[id]/page.tsx`, which loads from localStorage.

## Data Model

All types and Zod schemas are in `types/story.ts`.

**StoryOptions** — user selections from confirm screen:
- `onceUponATime: boolean`
- `happilyEverAfter: boolean`

**StoryGeneration** — structured JSON returned by Claude:
- `title`, `story`, `simple_story`, `image_prompt`
- `characters[]` — name, voiceStyle, description (max 4)
- `scenes[]` — speaker + text for TTS
- `safety_notes` — is_safe flag

**SavedStory** — persisted to localStorage:
- All StoryGeneration fields plus `id`, `createdAt`, `transcript`, `options`, `imageUrl`, `audioUrl`

## API Pipeline (planned)

```
┌─────────────┐     ┌──────────────┐     ┌──────────────┐
│  Audio Blob  │────▶│ /api/transcribe │────▶│  Transcript   │
└─────────────┘     │  (Gemini Flash) │     └──────┬───────┘
                    └──────────────┘            │
                                                ▼
                                     ┌──────────────────┐
                                     │   /api/story      │
                                     │ (Claude Structured│
                                     │    Outputs)       │
                                     └────────┬─────────┘
                                              │
                              ┌───────────────┼───────────────┐
                              ▼               ▼               ▼
                    ┌──────────────┐ ┌──────────────┐ ┌─────────────┐
                    │  Story text  │ │ /api/image   │ │  /api/tts   │
                    │  (immediate) │ │ (Imagen 4)   │ │(Cloud TTS)  │
                    └──────────────┘ └──────────────┘ └─────────────┘
```

Image and TTS generation run in parallel after story text is returned. Story text displays immediately; image and audio appear when ready. If either fails, the story is still saved and shown.

## Storage

- **localStorage**: Story metadata (SavedStory objects) under key `storytime_stories`
- **Vercel Blob**: Generated images and audio MP3s (returned as public URLs)
- **No database**: MVP uses client-side storage only

## Auth (planned)

Simple password gate — not real authentication:
- Modal on first load, password stored in localStorage
- Sent as `x-gate-key` header on API requests
- Backend checks against `APP_GATE_KEY` env var
