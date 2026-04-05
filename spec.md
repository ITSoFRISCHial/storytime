Product concept

A child records what they want a story about. The app transcribes the recording, lets them choose a couple of simple story-shape options, then generates:
	•	a 1–2 minute kid-safe story
	•	a simplified early-reader version
	•	one cartoon image
	•	one narrated audio track with different voices for narrator and characters

The UI should follow the child-designed flow from the mockup: Recording → Confirm Options → Story Result.  ￼

⸻

MVP stack
	•	Next.js 15+ with App Router
	•	TypeScript
	•	Vercel deployment
	•	Vercel Functions for backend routes
	•	Google Vertex AI / Gemini for transcription + story generation
	•	Google Vertex AI / Imagen 4 for image generation
	•	Browser localStorage for:
	•	local gate password
	•	saved story metadata
	•	recent session state
	•	Vercel Blob for storing generated audio and image assets

Vercel Functions are suited to API and AI workloads, and Next.js route handlers are the cleanest way to keep this as a single full-stack repo.  ￼

⸻

UX flow based on the PDF

1. First screen: Recording screen

Match the mockup closely:
	•	app title: “Storytime”
	•	prominent record state
	•	elapsed timer
	•	close/cancel button in upper corner
	•	simple child-friendly UI
	•	optional waveform or pulsing circle
	•	stop button when recording is active

Behavior:
	•	tapping record starts mic capture
	•	timer starts at 0:00
	•	max recording length: 30 seconds for MVP
	•	when stopped, move to the post-recording confirmation screen
	•	if canceled, discard recording and return to idle state

Why cap it: it keeps generation focused, reduces cost, and matches a 6-year-old workflow better than open-ended dictation.

⸻

2. Second screen: Post-recording confirmation

This comes directly from the mockup and is a very good design choice. After recording:
	•	show short playback of the recorded prompt
	•	show two checkboxes/toggles:
	•	“Once upon a time”
	•	“Happily ever after”
	•	show Confirm button
	•	show back button to re-record

Interpretation of these options:
	•	“Once upon a time” means the generated story should start in a classic fairytale style
	•	“Happily ever after” means the ending must resolve warmly and positively

These options should be sent as structured inputs to story generation, not as raw appended text.

Also add one hidden/default rule, not user-editable in MVP:
	•	“safe for a 6-year-old”

This screen is valuable because it makes the child feel like a co-author instead of just a prompt source.  ￼

⸻

3. Third screen: Story result

Match the mockup’s final state:
	•	generated image at top
	•	full story text
	•	simplified reading version toggle
	•	audio controls at bottom:
	•	play/pause
	•	skip back 10 sec
	•	restart
	•	optional highlight mode later, but not MVP

Recommended layout:
	•	title
	•	large image
	•	segmented control:
	•	“Read to me”
	•	“I read myself”
	•	in “Read to me” mode:
	•	show full story text
	•	show audio controls
	•	in “I read myself” mode:
	•	default to simplified version
	•	larger font
	•	shorter paragraphs
	•	optional word highlighting later

The mockup shows both image and text on the result page, so keep both on one screen rather than splitting into tabs for MVP.  ￼

⸻

Functional requirements

A. Recording
	•	browser mic capture
	•	up to 30 seconds
	•	audio preview before confirmation
	•	store temporary audio in memory until confirmed

B. Transcription

Use Gemini audio understanding with a Flash-class model. Gemini supports audio input and transcription-style tasks, so the backend can send the recorded clip and ask for a clean transcript.  ￼

Transcription prompt should normalize kid speech lightly:
	•	preserve meaning
	•	fix obvious ASR errors
	•	do not embellish
	•	return plain text only

Example backend instruction:

Transcribe this child’s recording into a clean plain-text prompt.
Keep the meaning.
Fix obvious speech recognition mistakes.
Do not add new story ideas.
Return only the transcript.

C. Story generation

Generate structured JSON, not freeform prose first.

Output schema:

{
  "title": "string",
  "prompt_transcript": "string",
  "story_options": {
    "onceUponATime": true,
    "happilyEverAfter": true
  },
  "characters": [
    {
      "name": "string",
      "voiceStyle": "string",
      "description": "string"
    }
  ],
  "scenes": [
    {
      "speaker": "Narrator|CharacterName",
      "text": "string"
    }
  ],
  "story": "string",
  "simple_story": "string",
  "image_prompt": "string",
  "safety_notes": {
    "is_safe": true,
    "notes": "string"
  }
}

Story rules:
	•	target 250–400 words total
	•	1–2 minute read aloud
	•	2–4 characters max
	•	cheerful, gentle, low-conflict
	•	no horror
	•	no peril beyond very mild tension
	•	no death, injury, punishment, or mean humor
	•	concrete, visual language
	•	satisfying ending
	•	if “once upon a time” is checked, begin with that phrase
	•	if “happily ever after” is checked, end with a clearly positive closing

D. Simplified reading version

This is a separate generated output, not just a shortened summary.

Rules for simple_story:
	•	much shorter than full story
	•	very short sentences
	•	mostly high-frequency words
	•	simple punctuation
	•	avoid unusual names if possible
	•	keep same plot and characters
	•	suitable for an early reader around age 6

Prompt language for that part should be explicit:

Also create a simplified reading version for a 6-year-old early reader.
Use short sentences.
Prefer very common words and sight words.
Keep the same characters and basic plot.
Do not make it babyish.

E. Narrated audio

For MVP, I would not make Claude Code depend on a single “multiSpeakerVoiceConfig” call path. Instead, have it:
	1.	generate a list of scenes/lines with a speaker
	2.	map each speaker to a chosen voice profile
	3.	synthesize line by line
	4.	concatenate into one MP3 on the server

That is more reliable for debugging and easier to swap providers later.

Suggested voice mapping logic:
	•	Narrator: warm, calm
	•	Hero/main child character: bright, energetic
	•	Sidekick: playful
	•	Villain or obstacle character: gentle and silly, never scary

Even if you later use a native multi-speaker capability, keep the line-structured format in the spec.

F. Image generation

Use the generated image_prompt instead of the full story text. Imagen on Vertex AI supports text-to-image generation, and Imagen 4 is the current model family to target.  ￼

Image prompt rules:
	•	cartoon illustration
	•	colorful
	•	child-safe
	•	one clear main scene
	•	no text in image
	•	no photorealism
	•	no extra limbs or scary expressions
	•	landscape orientation for web

G. Saving stories

Since you do not want Supabase yet:
	•	store binary assets in Vercel Blob
	•	store story metadata in localStorage
	•	optionally add a lightweight JSON file manifest later, but not for MVP

Each saved story record:

{
  "id": "uuid",
  "createdAt": "ISO timestamp",
  "title": "string",
  "transcript": "string",
  "options": {
    "onceUponATime": true,
    "happilyEverAfter": true
  },
  "story": "string",
  "simpleStory": "string",
  "imageUrl": "string",
  "audioUrl": "string",
  "durationSeconds": 75
}


⸻

Incremental build plan for Claude Code

This is the part I’d make especially explicit so it builds in testable slices.

Phase 1: Static UI only

Build the three screens with mocked data:
	•	recording screen
	•	confirmation screen
	•	result screen

No APIs yet.
Just local state and mocked transitions.

Acceptance criteria:
	•	can move through entire flow
	•	layout matches child mockup spirit
	•	responsive on mobile and desktop
	•	pleasant child-friendly styling

Phase 2: Real recording + local playback

Add:
	•	browser mic recording
	•	elapsed timer
	•	stop/cancel
	•	audio playback of recorded prompt

Acceptance criteria:
	•	can record in browser
	•	can replay prompt before confirm
	•	can re-record

Phase 3: Real transcription API

Add /api/transcribe
	•	upload recorded audio to route handler
	•	call Gemini audio understanding
	•	return cleaned transcript

Acceptance criteria:
	•	transcript visible in dev panel
	•	user can confirm or re-record
	•	graceful error if transcription fails

Phase 4: Story generation with structured JSON

Add /api/story
Input:

{
  "transcript": "string",
  "options": {
    "onceUponATime": true,
    "happilyEverAfter": true
  }
}

Acceptance criteria:
	•	JSON validated with Zod
	•	retries once if model returns invalid JSON
	•	story and simple story both render

Phase 5: Image generation

Add /api/image
	•	generate one cartoon image from image_prompt
	•	save to Blob
	•	return URL

Acceptance criteria:
	•	image appears on story screen
	•	regenerated if missing or failed

Phase 6: TTS generation

Add /api/tts
	•	generate voice clips per scene
	•	merge server-side
	•	store final MP3 in Blob
	•	return URL

Acceptance criteria:
	•	play full story audio
	•	narrator and characters sound distinct
	•	no blocking UI after job starts

Phase 7: Save/replay library

Add home screen section:
	•	Recent Stories
	•	thumbnail
	•	title
	•	replay button

Acceptance criteria:
	•	localStorage persists stories across refresh
	•	clicking saved story reopens result page

Phase 8: Local gate password

Add a simple startup gate:
	•	password entry modal on first load
	•	password stored locally
	•	frontend sends x-api-key header on all requests
	•	backend checks against env var

Important caveat: this is not real auth. It only lightly protects your API from casual misuse, which is fine for MVP.

⸻

Suggested repo structure

/app
  /page.tsx
  /story/[id]/page.tsx
  /api/transcribe/route.ts
  /api/story/route.ts
  /api/image/route.ts
  /api/tts/route.ts

/components
  AppShell.tsx
  RecordingScreen.tsx
  ConfirmScreen.tsx
  StoryScreen.tsx
  AudioControls.tsx
  PasswordGate.tsx
  StoryCard.tsx

/lib
  env.ts
  gemini.ts
  imagen.ts
  tts.ts
  blob.ts
  prompts.ts
  schemas.ts
  storage.ts
  audio.ts

/types
  story.ts


⸻

Prompt spec for Claude Code to implement

Transcription prompt

Transcribe this child’s audio recording into a clean plain-text idea for a story.

Rules:
- Preserve the child’s meaning.
- Fix obvious recognition mistakes.
- Do not expand the idea.
- Do not add any commentary.
- Return only the plain transcript.

Story generation prompt

You are writing a kind, imaginative story for a 6-year-old.

Input transcript:
{{transcript}}

Story options:
- Start with "Once upon a time": {{onceUponATime}}
- End with a clearly happy ending: {{happilyEverAfter}}

Requirements:
- 250 to 400 words
- 1 to 2 minute read-aloud
- safe and gentle for a young child
- no scary content
- no violence, death, cruelty, or upsetting themes
- 2 to 4 characters maximum
- include dialogue
- make it playful, clear, and visual
- give it a satisfying ending

Also create:
1. a simplified early-reader version using short sentences and mostly very common words
2. a cartoon image prompt showing one memorable scene
3. a scene-by-scene dialogue list for narration

Return valid JSON only with this exact schema:
{
  "title": "string",
  "characters": [
    {
      "name": "string",
      "voiceStyle": "string",
      "description": "string"
    }
  ],
  "scenes": [
    {
      "speaker": "string",
      "text": "string"
    }
  ],
  "story": "string",
  "simple_story": "string",
  "image_prompt": "string",
  "safety_notes": {
    "is_safe": true,
    "notes": "string"
  }
}

Image prompt post-processing rule

Claude Code should prepend something like:

Children's book cartoon illustration, bright colors, warm expressions, soft shapes, clean composition.

Then append the model-generated scene prompt.

⸻

Data validation requirements

Claude Code should use Zod for:
	•	API request validation
	•	model response validation

If story JSON fails validation:
	1.	retry once with a “return valid JSON only” correction
	2.	if it still fails, show a friendly error and allow retry

Also require:
	•	simple_story.length < story.length
	•	characters.length <= 4
	•	all scenes[].speaker values must be either Narrator or a named character
	•	safety_notes.is_safe === true

⸻

UI details to reflect the child’s mockup

Use the mockup as product truth for MVP:
	•	bold “Storytime” branding
	•	large touch targets
	•	one primary action per screen
	•	visible recording timer
	•	a simple “Confirm” button on the post-recording step
	•	transport controls at bottom on final screen
	•	image above story text
	•	close button on recording flow
	•	keep typography large and legible for a child audience  ￼

I would also tell Claude Code:
	•	avoid clutter
	•	no tiny icons without labels
	•	no nested menus
	•	use rounded cards and bright but not overstimulating colors

⸻

Setup instructions for you

Vercel
	1.	Create a new Next.js app locally.
	2.	Push to GitHub.
	3.	Import repo into Vercel.
	4.	Add env vars in project settings.
	5.	Enable Vercel Blob if you want hosted file storage.

Vercel supports server-side functions and Next.js route handlers cleanly, which is why it remains the simplest starting point here.  ￼

Google Cloud / Vertex AI
	1.	Create a Google Cloud project.
	2.	Enable Vertex AI.
	3.	Create credentials usable by your app flow.
	4.	Choose the exact Gemini and Imagen model IDs available in your project/region.
	5.	Put those IDs in env vars instead of hard-coding them.

Vertex AI’s current docs cover Gemini multimodal usage, audio understanding, and Imagen generation, so this is a normal supported setup.  ￼

Suggested env vars:

GOOGLE_API_KEY=...
APP_GATE_KEY=...
GEMINI_TRANSCRIBE_MODEL=...
GEMINI_STORY_MODEL=...
IMAGEN_MODEL=...
BLOB_READ_WRITE_TOKEN=...


⸻

One pushback I’d make before Claude Code starts

Do not ask Claude Code to build “perfect security” or “full auth” right now. Your local password + backend key check is enough for this phase, but it should be described honestly in the spec as a lightweight gate, not true authentication.

Do not ask it to do live streaming narration yet either. Google does have Live API capabilities for real-time voice interactions, but your chosen UX is “generate then play,” which is simpler and more reliable for an MVP.  ￼

If you want, next I can turn this into a single polished Claude Code prompt/spec document you can paste in as-is.