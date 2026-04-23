import "server-only";
import { betterAuth } from "better-auth";
import { nextCookies } from "better-auth/next-js";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { count, eq } from "drizzle-orm";
import { sendEmail } from "@/lib/mailer";
import { appUrl, registrationEmail } from "@/lib/email-templates";
import { loadSiteSettings } from "@/lib/theme";

export const auth = betterAuth({
  appName: "CourseForge",
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: false,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const [row] = await db.select({ n: count() }).from(users);
          const isFirst = (row?.n ?? 0) === 0;
          return {
            data: {
              ...user,
              role: isFirst ? "admin" : "student",
            },
          };
        },
        after: async (user) => {
          try {
            const site = await loadSiteSettings();
            const tpl = registrationEmail({
              siteName: site.name,
              userName: user.name,
              appUrl: appUrl(),
            });
            await sendEmail({
              to: user.email,
              subject: tpl.subject,
              html: tpl.html,
              text: tpl.text,
            });
          } catch (err) {
            console.error("[auth] registration email failed", err);
          }
        },
      },
    },
  },
  plugins: [nextCookies()],
});

export type Auth = typeof auth;
export type Session = Awaited<ReturnType<typeof auth.api.getSession>>;

export async function promoteToAdmin(userId: string) {
  await db.update(users).set({ role: "admin" }).where(eq(users.id, userId));
}
