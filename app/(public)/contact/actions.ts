"use server";

import { loadSiteSettings } from "@/lib/theme";
import { sendEmail } from "@/lib/mailer";

export interface ContactResult {
  ok: boolean;
  message: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function esc(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export async function submitContactAction(
  _prev: ContactResult | null,
  formData: FormData,
): Promise<ContactResult> {
  const name = (formData.get("name") as string | null)?.trim() ?? "";
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const subject =
    (formData.get("subject") as string | null)?.trim() || "Message via contact form";
  const message = (formData.get("message") as string | null)?.trim() ?? "";

  if (name.length < 2) return { ok: false, message: "Name is required." };
  if (!EMAIL_RE.test(email)) return { ok: false, message: "Valid email is required." };
  if (message.length < 10)
    return { ok: false, message: "Message must be at least 10 characters." };

  const site = await loadSiteSettings();
  const siteName = site.companyName ?? site.name;
  const adminEmail = site.supportEmail;

  const adminHtml = `
<p><strong>Name:</strong> ${esc(name)}</p>
<p><strong>Email:</strong> <a href="mailto:${esc(email)}">${esc(email)}</a></p>
<p><strong>Subject:</strong> ${esc(subject)}</p>
<hr style="border:none;border-top:1px solid #e0e0e0;margin:16px 0"/>
<p style="white-space:pre-wrap;font-size:15px">${esc(message)}</p>`;

  const userHtml = `
<p>Hi ${esc(name)},</p>
<p>Thanks for reaching out to <strong>${esc(siteName)}</strong>. We have received your message and will get back to you within 1 business day.</p>
<hr style="border:none;border-top:1px solid #e0e0e0;margin:16px 0"/>
<p><strong>Your message:</strong></p>
<p style="white-space:pre-wrap;color:#555;font-size:14px">${esc(message)}</p>
<p style="margin-top:24px">— ${esc(siteName)} Support</p>`;

  const sends: Promise<void>[] = [];

  if (adminEmail) {
    sends.push(
      sendEmail({
        to: adminEmail,
        replyTo: `${name} <${email}>`,
        subject: `[Contact] ${subject}`,
        html: adminHtml,
        text: `From: ${name} <${email}>\n\n${message}`,
      }),
    );
  }

  sends.push(
    sendEmail({
      to: email,
      subject: `We received your message — ${siteName}`,
      html: userHtml,
      text: `Hi ${name},\n\nThanks for reaching out. We'll be in touch within 1 business day.\n\nYour message:\n${message}\n\n— ${siteName} Support`,
    }),
  );

  try {
    await Promise.all(sends);
    return { ok: true, message: "Message sent. We'll be in touch soon." };
  } catch (err) {
    console.error("[contact-form]", err);
    return { ok: false, message: "Failed to send. Please try again later." };
  }
}
