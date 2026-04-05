# Storytime

A kid-friendly AI storytelling app. A child records what they want a story about, picks a few options, and gets back a generated story with an illustration and narrated audio — all in under a minute.

The UX flow was designed by a 6-year-old. Built for open source.

## Quick Start

```bash
npm install
cp .env.example .env.local   # fill in your API keys
npm run dev                   # http://localhost:3000
```

## Docs

- **[CLAUDE.md](./CLAUDE.md)** — full project overview, tech stack, conventions, file structure
- **[Google Cloud Setup](./docs/google-setup.md)** — GCP project, service account, enabling APIs
- **[Backlog](./docs/backlog.md)** — planned features

## Tech Stack

- Next.js 15+ (App Router) + TypeScript
- Tailwind CSS v4
- Google Gemini 2.5 Flash — transcription + story generation
- Google Imagen 4 Fast — illustration
- Google Cloud TTS — narration (multi-voice)
- Vercel Blob — image + audio storage
- Vercel — deployment

## Environment Variables

See `.env.example` for the full list. All Google services use a single service account key — no separate API keys needed.

## License

MIT
