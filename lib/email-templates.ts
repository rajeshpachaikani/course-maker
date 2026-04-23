import "server-only";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function layout(opts: {
  siteName: string;
  heading: string;
  bodyHtml: string;
  ctaHref?: string;
  ctaLabel?: string;
  footerNote?: string;
}): string {
  const btn =
    opts.ctaHref && opts.ctaLabel
      ? `<p style="margin:28px 0 0"><a href="${opts.ctaHref}" style="background:#111;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">${escapeHtml(opts.ctaLabel)}</a></p>`
      : "";
  const foot = opts.footerNote
    ? `<p style="margin:32px 0 0;color:#888;font-size:12px">${escapeHtml(opts.footerNote)}</p>`
    : "";
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:32px 0">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:32px;max-width:560px">
        <tr><td>
          <div style="font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#888;margin-bottom:8px">${escapeHtml(opts.siteName)}</div>
          <h1 style="margin:0 0 16px;font-size:22px;color:#111;line-height:1.3">${escapeHtml(opts.heading)}</h1>
          <div style="color:#333;font-size:15px;line-height:1.6">${opts.bodyHtml}</div>
          ${btn}
          ${foot}
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

export interface RegistrationEmail {
  subject: string;
  html: string;
  text: string;
}

export function registrationEmail(input: {
  siteName: string;
  userName: string;
  appUrl: string;
}): RegistrationEmail {
  const name = input.userName || "there";
  const subject = `Welcome to ${input.siteName}`;
  const body = `<p>Hi ${escapeHtml(name)},</p>
<p>Your account is ready. Browse the catalog, enroll in a course, and track your progress from the dashboard.</p>`;
  return {
    subject,
    html: layout({
      siteName: input.siteName,
      heading: `Welcome aboard`,
      bodyHtml: body,
      ctaHref: `${input.appUrl}/dashboard`,
      ctaLabel: "Open dashboard",
      footerNote: `You received this email because an account was created on ${input.siteName}.`,
    }),
    text: `Hi ${name}, your ${input.siteName} account is ready. Visit ${input.appUrl}/dashboard to get started.`,
  };
}

export interface EnrollmentEmail {
  subject: string;
  html: string;
  text: string;
}

export function enrollmentEmail(input: {
  siteName: string;
  userName: string;
  courseTitle: string;
  appUrl: string;
  courseSlug: string;
}): EnrollmentEmail {
  const name = input.userName || "there";
  const href = `${input.appUrl}/learn/${input.courseSlug}`;
  const subject = `You're enrolled in ${input.courseTitle}`;
  const body = `<p>Hi ${escapeHtml(name)},</p>
<p>Your enrollment in <strong>${escapeHtml(input.courseTitle)}</strong> is confirmed. Lessons are unlocked and ready to watch.</p>`;
  return {
    subject,
    html: layout({
      siteName: input.siteName,
      heading: `Enrollment confirmed`,
      bodyHtml: body,
      ctaHref: href,
      ctaLabel: "Start learning",
      footerNote: `Need help? Reply to this email.`,
    }),
    text: `Hi ${name}, you're enrolled in ${input.courseTitle}. Start here: ${href}`,
  };
}

export interface CompletionEmail {
  subject: string;
  html: string;
  text: string;
}

export function completionEmail(input: {
  siteName: string;
  userName: string;
  courseTitle: string;
  appUrl: string;
}): CompletionEmail {
  const name = input.userName || "there";
  const subject = `Congratulations — you finished ${input.courseTitle}`;
  const body = `<p>Hi ${escapeHtml(name)},</p>
<p>You just completed every lesson in <strong>${escapeHtml(input.courseTitle)}</strong>. That is a real accomplishment — nicely done.</p>
<p>Keep the momentum going: explore the catalog for your next challenge.</p>`;
  return {
    subject,
    html: layout({
      siteName: input.siteName,
      heading: `Course complete`,
      bodyHtml: body,
      ctaHref: `${input.appUrl}/courses`,
      ctaLabel: "Find another course",
      footerNote: `Thank you for learning with ${input.siteName}.`,
    }),
    text: `Hi ${name}, you finished ${input.courseTitle}. Great work. See ${input.appUrl}/courses for more.`,
  };
}

export function appUrl(): string {
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
}
