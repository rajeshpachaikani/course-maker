import {
  pgTable,
  text,
  timestamp,
  boolean,
  integer,
  uniqueIndex,
  index,
  primaryKey,
  jsonb,
  pgEnum,
  bigserial,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- Better Auth core tables (plural) ----------

export const userRole = pgEnum("user_role", ["admin", "trainer", "student"]);

export interface TrainerGrants {
  publish?: boolean;
  pricing?: boolean;
}

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: userRole("role").notNull().default("student"),
  trainerGrants: jsonb("trainer_grants")
    .$type<TrainerGrants>()
    .notNull()
    .default({}),
  createdAt: timestamp("createdAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updatedAt", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const sessions = pgTable(
  "sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    ipAddress: text("ipAddress"),
    userAgent: text("userAgent"),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [index("sessions_userId_idx").on(t.userId)],
);

export const accounts = pgTable(
  "accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("accountId").notNull(),
    providerId: text("providerId").notNull(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("accessToken"),
    refreshToken: text("refreshToken"),
    idToken: text("idToken"),
    accessTokenExpiresAt: timestamp("accessTokenExpiresAt", {
      withTimezone: true,
    }),
    refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt", {
      withTimezone: true,
    }),
    scope: text("scope"),
    password: text("password"),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("accounts_userId_idx").on(t.userId)],
);

export const verifications = pgTable(
  "verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expiresAt", { withTimezone: true }).notNull(),
    createdAt: timestamp("createdAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updatedAt", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("verifications_identifier_idx").on(t.identifier)],
);

// ---------- CourseForge domain ----------

export const courses = pgTable(
  "courses",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull().unique(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    descriptionTiptap: jsonb("description_tiptap"),
    coverImageUrl: text("cover_image_url"),
    priceCents: integer("price_cents").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    isFree: boolean("is_free").notNull().default(false),
    published: boolean("published").notNull().default(false),
    instructorUserId: text("instructor_user_id").references(() => users.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("courses_published_idx").on(t.published)],
);

export const modules = pgTable(
  "modules",
  {
    id: text("id").primaryKey(),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    position: integer("position").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("modules_course_idx").on(t.courseId, t.position)],
);

export const lessons = pgTable(
  "lessons",
  {
    id: text("id").primaryKey(),
    moduleId: text("module_id")
      .notNull()
      .references(() => modules.id, { onDelete: "cascade" }),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    descriptionTiptap: jsonb("description_tiptap"),
    bunnyVideoId: text("bunny_video_id"),
    durationSec: integer("duration_sec"),
    position: integer("position").notNull().default(0),
    isFreePreview: boolean("is_free_preview").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("lessons_module_slug_uq").on(t.moduleId, t.slug),
    index("lessons_module_pos_idx").on(t.moduleId, t.position),
  ],
);

export const enrollments = pgTable(
  "enrollments",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    courseId: text("course_id")
      .notNull()
      .references(() => courses.id, { onDelete: "cascade" }),
    stripeSessionId: text("stripe_session_id"),
    amountPaidCents: integer("amount_paid_cents").notNull().default(0),
    currency: text("currency").notNull().default("USD"),
    enrolledAt: timestamp("enrolled_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("enrollments_user_course_uq").on(t.userId, t.courseId),
    index("enrollments_user_idx").on(t.userId),
  ],
);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    lessonId: text("lesson_id")
      .notNull()
      .references(() => lessons.id, { onDelete: "cascade" }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    lastPositionSec: integer("last_position_sec").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.lessonId] })],
);

export const themeSettings = pgTable("theme_settings", {
  id: text("id").primaryKey().default("singleton"),
  colors: jsonb("colors").notNull(),
  fonts: jsonb("fonts").notNull(),
  borderRadius: text("border_radius").notNull().default("0.5rem"),
  customCss: text("custom_css"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const siteSettings = pgTable("site_settings", {
  id: text("id").primaryKey().default("singleton"),
  name: text("name").notNull().default("CourseForge"),
  tagline: text("tagline"),
  logoUrl: text("logo_url"),
  faviconUrl: text("favicon_url"),
  googleOauthEnabled: boolean("google_oauth_enabled").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const credentialKey = pgEnum("credential_key", [
  "stripe_secret",
  "stripe_webhook_secret",
  "stripe_publishable",
  "bunny_api_key",
  "bunny_stream_library_id",
  "bunny_stream_cdn_hostname",
  "bunny_storage_zone",
  "bunny_storage_key",
  "smtp_host",
  "smtp_port",
  "smtp_user",
  "smtp_password",
  "smtp_from_email",
  "smtp_secure",
  "google_oauth_client_id",
  "google_oauth_client_secret",
]);

export const encryptedCredentials = pgTable("encrypted_credentials", {
  key: credentialKey("key").primaryKey(),
  ciphertext: text("ciphertext").notNull(),
  iv: text("iv").notNull(),
  tag: text("tag").notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const webhookEvents = pgTable(
  "webhook_events",
  {
    id: bigserial("id", { mode: "number" }).primaryKey(),
    provider: text("provider").notNull(),
    eventId: text("event_id").notNull(),
    payload: jsonb("payload").notNull(),
    processedAt: timestamp("processed_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    uniqueIndex("webhook_events_provider_event_uq").on(t.provider, t.eventId),
  ],
);

// ---------- Relations ----------

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  enrollments: many(enrollments),
  progress: many(lessonProgress),
}));

export const coursesRelations = relations(courses, ({ many, one }) => ({
  modules: many(modules),
  enrollments: many(enrollments),
  instructor: one(users, {
    fields: [courses.instructorUserId],
    references: [users.id],
  }),
}));

export const modulesRelations = relations(modules, ({ one, many }) => ({
  course: one(courses, {
    fields: [modules.courseId],
    references: [courses.id],
  }),
  lessons: many(lessons),
}));

export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  module: one(modules, {
    fields: [lessons.moduleId],
    references: [modules.id],
  }),
  progress: many(lessonProgress),
}));

export const enrollmentsRelations = relations(enrollments, ({ one }) => ({
  user: one(users, { fields: [enrollments.userId], references: [users.id] }),
  course: one(courses, {
    fields: [enrollments.courseId],
    references: [courses.id],
  }),
}));

export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  user: one(users, { fields: [lessonProgress.userId], references: [users.id] }),
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
}));

// ---------- Types ----------

export type User = typeof users.$inferSelect;
export type Course = typeof courses.$inferSelect;
export type Module = typeof modules.$inferSelect;
export type Lesson = typeof lessons.$inferSelect;
export type Enrollment = typeof enrollments.$inferSelect;
export type LessonProgress = typeof lessonProgress.$inferSelect;
export type ThemeSettings = typeof themeSettings.$inferSelect;
export type SiteSettings = typeof siteSettings.$inferSelect;
