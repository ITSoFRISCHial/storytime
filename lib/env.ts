export interface GoogleConfig {
  projectId: string;
  location: string;
  serviceAccountKey: object;
}

let _config: GoogleConfig | null = null;

export function getGoogleConfig(): GoogleConfig {
  if (_config) return _config;

  const projectId = process.env.GOOGLE_CLOUD_PROJECT;
  if (!projectId) {
    throw new Error(
      "GOOGLE_CLOUD_PROJECT is not set. Add your GCP project ID to .env.local"
    );
  }

  const location = process.env.GOOGLE_CLOUD_LOCATION;
  if (!location) {
    throw new Error(
      "GOOGLE_CLOUD_LOCATION is not set. Add a region (e.g. us-central1) to .env.local"
    );
  }

  const keyJson = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  if (!keyJson) {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY is not set. Paste your service account JSON key (as a single line) into .env.local"
    );
  }

  let serviceAccountKey: object;
  try {
    serviceAccountKey = JSON.parse(keyJson);
  } catch {
    throw new Error(
      "GOOGLE_SERVICE_ACCOUNT_KEY is not valid JSON. Make sure the entire JSON key is on one line."
    );
  }

  _config = { projectId, location, serviceAccountKey };
  return _config;
}
