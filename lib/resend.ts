import "server-only";
import { Resend } from "resend";
import { getCredentials } from "@/lib/credentials";

export interface ResendConfig {
  apiKey: string;
  fromEmail: string;
}

export async function getResendConfig(): Promise<ResendConfig | null> {
  const creds = await getCredentials([
    "resend_api_key",
    "resend_from_email",
  ] as const);
  if (!creds.resend_api_key || !creds.resend_from_email) return null;
  return {
    apiKey: creds.resend_api_key,
    fromEmail: creds.resend_from_email,
  };
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const cfg = await getResendConfig();
  if (!cfg) {
    console.warn("[resend] skipped send — credentials not configured");
    return;
  }
  const client = new Resend(cfg.apiKey);
  const res = await client.emails.send({
    from: cfg.fromEmail,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
  });
  if (res.error) {
    throw new Error(`Resend send failed: ${res.error.message}`);
  }
}
