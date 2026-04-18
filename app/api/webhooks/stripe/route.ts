import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripeClient, getStripeConfig } from "@/lib/stripe";
import { createEnrollment, recordWebhookEvent } from "@/lib/enrollments";
import { getCourseById } from "@/lib/courses";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/resend";
import { loadSiteSettings } from "@/lib/theme";

export async function POST(request: Request) {
  const cfg = await getStripeConfig();
  const stripe = await getStripeClient();
  if (!cfg || !stripe || !cfg.webhookSecret) {
    return NextResponse.json(
      { error: "Stripe webhook not configured" },
      { status: 400 },
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }
  const rawBody = await request.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, cfg.webhookSecret);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Invalid signature";
    return NextResponse.json({ error: msg }, { status: 400 });
  }

  const isNew = await recordWebhookEvent("stripe", event.id, event);
  if (!isNew) return NextResponse.json({ received: true, duplicate: true });

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.metadata?.userId;
    const courseId = session.metadata?.courseId;
    if (!userId || !courseId) {
      return NextResponse.json({ received: true, skipped: "metadata" });
    }
    const course = await getCourseById(courseId);
    if (!course) {
      return NextResponse.json({ received: true, skipped: "no-course" });
    }
    await createEnrollment({
      userId,
      courseId,
      stripeSessionId: session.id,
      amountPaidCents: session.amount_total ?? course.priceCents,
      currency: (session.currency ?? course.currency).toUpperCase(),
    });

    const userRows = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const user = userRows[0];
    if (user) {
      const site = await loadSiteSettings();
      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";
      try {
        await sendEmail({
          to: user.email,
          subject: `You're enrolled in ${course.title}`,
          html: `<p>Hi ${escapeHtml(user.name)},</p>
<p>Your purchase of <strong>${escapeHtml(course.title)}</strong> on ${escapeHtml(site.name)} is confirmed.</p>
<p><a href="${appUrl}/dashboard">Start learning →</a></p>`,
          text: `Hi ${user.name}, your purchase of ${course.title} is confirmed. Visit ${appUrl}/dashboard to start.`,
        });
      } catch (err) {
        console.error("[stripe-webhook] email failed", err);
      }
    }
  }

  return NextResponse.json({ received: true });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
