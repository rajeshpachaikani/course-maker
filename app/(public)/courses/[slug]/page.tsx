import { notFound } from "next/navigation";
import { Render, type Data } from "@measured/puck";
import { eq, asc } from "drizzle-orm";
import { db } from "@/lib/db";
import { courses, modules, lessons } from "@/lib/db/schema";
import { getCourseBySlug } from "@/lib/courses";
import { loadSiteSettings } from "@/lib/theme";
import { buildPuckConfig } from "@/components/puck/config";
import { TiptapRender } from "@/components/tiptap-render";
import { BuyButton } from "./buy-button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course) return { title: "Not found" };
  return { title: course.title };
}

export default async function CoursePublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);
  if (!course || !course.published) notFound();

  const [site, modRows, lessonRows] = await Promise.all([
    loadSiteSettings(),
    db
      .select()
      .from(modules)
      .where(eq(modules.courseId, course.id))
      .orderBy(asc(modules.position)),
    db
      .select({
        id: lessons.id,
        title: lessons.title,
        moduleId: lessons.moduleId,
        isFreePreview: lessons.isFreePreview,
        position: lessons.position,
      })
      .from(lessons)
      .innerJoin(modules, eq(modules.id, lessons.moduleId))
      .where(eq(modules.courseId, course.id))
      .orderBy(asc(lessons.position)),
  ]);

  const lessonsByModule = new Map<string, typeof lessonRows>();
  for (const l of lessonRows) {
    const arr = lessonsByModule.get(l.moduleId) ?? [];
    arr.push(l);
    lessonsByModule.set(l.moduleId, arr);
  }

  const salesData = course.salesPagePuck as Data | null;
  const priceLabel = course.isFree
    ? "Free"
    : new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: course.currency,
      }).format(course.priceCents / 100);

  return (
    <main className="flex flex-col gap-12 pb-16">
      {salesData ? (
        <PuckSales data={salesData} rawHtmlEnabled={site.rawHtmlBlockEnabled} />
      ) : (
        <section className="mx-auto w-full max-w-4xl px-6 pt-16">
          <h1
            className="text-4xl font-semibold"
            style={{ fontFamily: "var(--cf-font-heading)" }}
          >
            {course.title}
          </h1>
          {course.subtitle ? (
            <p className="mt-3 text-lg text-[var(--cf-muted-fg)]">
              {course.subtitle}
            </p>
          ) : null}
          {course.coverImageUrl ? (
            <img
              src={course.coverImageUrl}
              alt=""
              className="mt-6 w-full rounded-[var(--cf-radius)]"
            />
          ) : null}
          <div className="mt-6 text-sm leading-relaxed">
            <TiptapRender doc={course.descriptionTiptap as never} />
          </div>
        </section>
      )}

      <section className="mx-auto flex w-full max-w-4xl flex-col gap-4 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6 px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-[var(--cf-muted-fg)]">Enroll</div>
            <div className="text-3xl font-semibold">{priceLabel}</div>
          </div>
          <BuyButton
            courseId={course.id}
            isFree={course.isFree || course.priceCents === 0}
          />
        </div>
      </section>

      <section className="mx-auto w-full max-w-4xl px-6">
        <h2 className="text-2xl font-semibold">Curriculum</h2>
        {modRows.length === 0 ? (
          <p className="mt-4 text-sm text-[var(--cf-muted-fg)]">
            Curriculum coming soon.
          </p>
        ) : (
          <ol className="mt-6 flex flex-col gap-3">
            {modRows.map((m, i) => {
              const items = lessonsByModule.get(m.id) ?? [];
              return (
                <li
                  key={m.id}
                  className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-4"
                >
                  <div className="font-medium">
                    {i + 1}. {m.title}
                  </div>
                  <ul className="mt-2 flex flex-col gap-1">
                    {items.map((l) => (
                      <li
                        key={l.id}
                        className="text-sm text-[var(--cf-muted-fg)]"
                      >
                        · {l.title}
                        {l.isFreePreview ? (
                          <span className="ml-2 rounded border border-[var(--cf-accent)] px-1.5 py-0.5 text-xs text-[var(--cf-accent)]">
                            Preview
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </main>
  );
}

async function PuckSales({
  data,
  rawHtmlEnabled,
}: {
  data: Data;
  rawHtmlEnabled: boolean;
}) {
  const config = buildPuckConfig({ rawHtmlEnabled });
  return <Render config={config} data={data} />;
}
