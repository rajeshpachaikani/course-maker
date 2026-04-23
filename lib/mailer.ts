import "server-only";
import nodemailer, { type Transporter } from "nodemailer";
import { getCredentials } from "@/lib/credentials";

export interface SmtpConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  fromEmail: string;
  secure: boolean;
}

export async function getSmtpConfig(): Promise<SmtpConfig | null> {
  const creds = await getCredentials([
    "smtp_host",
    "smtp_port",
    "smtp_user",
    "smtp_password",
    "smtp_from_email",
    "smtp_secure",
  ] as const);
  if (
    !creds.smtp_host ||
    !creds.smtp_port ||
    !creds.smtp_user ||
    !creds.smtp_password ||
    !creds.smtp_from_email
  ) {
    return null;
  }
  const port = Number.parseInt(creds.smtp_port, 10);
  if (!Number.isFinite(port)) return null;
  const secure = parseBool(creds.smtp_secure) ?? port === 465;
  return {
    host: creds.smtp_host.trim(),
    port,
    user: creds.smtp_user.trim(),
    password: creds.smtp_password,
    fromEmail: creds.smtp_from_email.trim(),
    secure,
  };
}

function parseBool(v: string | undefined): boolean | null {
  if (v == null) return null;
  const s = v.trim().toLowerCase();
  if (["1", "true", "yes", "on", "ssl", "tls"].includes(s)) return true;
  if (["0", "false", "no", "off", "starttls", "plain"].includes(s)) return false;
  return null;
}

function buildTransport(cfg: SmtpConfig): Transporter {
  return nodemailer.createTransport({
    host: cfg.host,
    port: cfg.port,
    secure: cfg.secure,
    auth: { user: cfg.user, pass: cfg.password },
    requireTLS: !cfg.secure,
  });
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
  text?: string;
}): Promise<void> {
  const cfg = await getSmtpConfig();
  if (!cfg) {
    console.warn("[mailer] skipped send — SMTP not configured");
    return;
  }
  const transporter = buildTransport(cfg);
  try {
    await transporter.sendMail({
      from: cfg.fromEmail,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
  } finally {
    transporter.close();
  }
}
