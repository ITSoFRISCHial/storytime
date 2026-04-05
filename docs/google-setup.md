# Google Cloud Setup

All Google services (Gemini, Imagen, TTS) use ONE service account. No AI Studio, no API keys.

## Steps

### 1. Create a GCP project

- Go to [console.cloud.google.com](https://console.cloud.google.com)
- Click the project dropdown (top bar) → "New Project"
- Name it (e.g. `storytime`) → Create

### 2. Enable APIs

In the project, go to **APIs & Services → Library** and enable:

- **Vertex AI API** — search "Vertex AI API" → Enable
- **Cloud Text-to-Speech API** — search "Text-to-Speech" → Enable

### 3. Create a service account

- Go to **IAM & Admin → Service Accounts**
- Click **Create Service Account**
- Name: `storytime` (or anything)
- Click **Create and Continue**

### 4. Assign roles

Add these roles on the Grant Access step:

- `Vertex AI User`
- `Cloud Text-to-Speech Admin`

Click **Done**.

### 5. Create a JSON key

- Click on the service account you just created
- Go to **Keys** tab
- **Add Key → Create new key → JSON**
- Download the file

### 6. Add to `.env.local`

Open the downloaded JSON file. Copy the entire contents onto ONE line and paste it:

```
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_CLOUD_LOCATION=us-central1
GOOGLE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"your-project-id",...}
```

### 7. Verify

```bash
npm run verify:google
```

This runs all three services (Gemini, Imagen, TTS) and prints PASS/FAIL for each.

## Vercel Deployment

Add these three env vars in **Vercel → Project Settings → Environment Variables**:

| Variable | Value |
|---|---|
| `GOOGLE_CLOUD_PROJECT` | Your GCP project ID |
| `GOOGLE_CLOUD_LOCATION` | `us-central1` |
| `GOOGLE_SERVICE_ACCOUNT_KEY` | Entire JSON key on one line |

The JSON must be a single line — no newlines. The same format as `.env.local`.
