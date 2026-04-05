# Backlog

## UX / Performance

### Stream story text to screen
Instead of waiting on the loading screen for full story JSON, split generation into two phases:
1. Stream `title` + `story` + `simple_story` as plain text — skip loading screen entirely, show text appearing word-by-word on the story screen within ~1s of hitting Go
2. Second parallel call generates `characters` + `scenes` (needed for TTS voices)
Image and TTS fire when metadata is ready.
**Effort**: Medium

## Infrastructure

### Vercel Blob storage for images and audio ⚠️ priority
Currently image/audio data URLs are stripped before saving to localStorage (too large). This means replayed stories show text only — no image or audio. Fix: upload from API routes to Vercel Blob and store the returned URLs.
**Effort**: Small
**Blocked by**: Need `BLOB_READ_WRITE_TOKEN` from Vercel project settings (dashboard → Storage → Blob)

## Features

### Multi-voice TTS with per-character pitch/style tuning
Currently voice is assigned by character order (Narrator → Journey-F, first character → Journey-D, etc.). Future: let Gemini suggest a voice gender/style per character and map more precisely, or add SSML pitch/rate tuning per speaker.
**Effort**: Small

### Password gate
Simple gate so only Ezra (and trusted adults) can access the app. Single password checked on load, stored in localStorage. `APP_GATE_KEY` env var already defined.
**Effort**: Small

### Story deletion from library
Allow swiping or long-pressing a story card to delete it from the saved stories list.
**Effort**: Small

### Share / export story
Generate a shareable link or PDF export of a story with its illustration.
**Effort**: Medium
