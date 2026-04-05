import { GoogleAuth } from "google-auth-library";
import { getGoogleConfig } from "./env";

let _auth: GoogleAuth | null = null;

export function getGoogleAuthClient(): GoogleAuth {
  if (_auth) return _auth;

  const config = getGoogleConfig();

  _auth = new GoogleAuth({
    credentials: config.serviceAccountKey as {
      client_email: string;
      private_key: string;
    },
    projectId: config.projectId,
    scopes: ["https://www.googleapis.com/auth/cloud-platform"],
  });

  return _auth;
}
