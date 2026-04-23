import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/dal";
import { getStripeClient } from "@/lib/stripe";
import { getCourseById } from "@/lib/courses";
import { createEnrollment, isEnrolled } from "@/lib/enrollments";
import { sendEmail } from "@/lib/mailer";
import { loadSiteSettings } from "@/lib/theme";
import { appUrl as resolveAppUrl, enrollmentEmail } from "@/lib/email-templates";

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Login required" }, { status: 401 });
  }

  let body: { courseId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const courseId = body.courseId;
  if (!courseId) {
    return NextResponse.json({ error: "courseId required" }, { status: 400 });
  }

  const course = await getCourseById(courseId);
  if (!course || !course.published) {
    return NextResponse.json({ error: "Course not found" }, { status: 404 });
  }

  if (await isEnrolled(user.id, course.id)) {
    return NextResponse.json({ url: "/dashboard" });
  }

  if (course.isFree || course.priceCents === 0) {
    await createEnrollment({
      userId: user.id,
      courseId: course.id,
      amountPaidCents: 0,
      currency: course.currency,
    });
    try {
      const site = await loadSiteSettings();
      const tpl = enrollmentEmail({
        siteName: site.name,
        userName: user.name,
        courseTitle: course.title,
        courseSlug: course.slug,
        appUrl: resolveAppUrl(),
      });
      await sendEmail({
        to: user.email,
        subject: tpl.subject,
        html: tpl.html,
        text: tpl.text,
      });
    } catch (err) {
      console.error("[checkout] free enrollment email failed", err);
    }
    return NextResponse.json({ url: "/dashboard" });
  }

  const stripe = await getStripeClient();
  if (!stripe) {
    return NextResponse.json(
      { error: "Payments are not configured." },
      { status: 400 },
    );
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "";

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: [
      {
        price_data: {
          currency: course.currency.toLowerCase(),
          product_data: {
            name: course.title,
            ...(course.subtitle ? { description: course.subtitle } : {}),
          },
          unit_amount: course.priceCents,
        },
        quantity: 1,
      },
    ],
    metadata: {
      courseId: course.id,
      userId: user.id,
    },
    success_url: `${appUrl}/dashboard?enrolled=${course.id}`,
    cancel_url: `${appUrl}/courses/${course.slug}?cancelled=1`,
  });

  return NextResponse.json({ url: session.url });
}
