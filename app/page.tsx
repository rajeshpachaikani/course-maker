import Link from "next/link";
import type { Route } from "next";
import { Suspense } from "react";
import { loadSiteSettings } from "@/lib/theme";
import { listPublishedCourses } from "@/lib/courses";
import { PublicTopbar } from "@/components/public-topbar";

const THUMB_BG = [
  "bg-pink-grad",
  "bg-plum",
  "bg-clay",
  "bg-ochre",
  "bg-teal",
  "bg-moss",
  "bg-rust",
  "bg-sage",
  "bg-ink",
  "bg-brick",
];

export default function HomePage() {
  return (
    <div className="student-root">
      <PublicTopbar active="courses" />
      <Suspense fallback={<HomeSkeleton />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}

function HomeSkeleton() {
  return (
    <section className="hero">
      <div className="mono-label">— Loading…</div>
    </section>
  );
}

async function HomeContent() {
  const [site, courses] = await Promise.all([
    loadSiteSettings(),
    listPublishedCourses(),
  ]);
  const published = courses;
  const featured = published[0];
  const featuredBg = THUMB_BG[0];
  const totalCourses = published.length;

  return (
    <>
      <section className="hero">
        <div>
          <div className="hero-eyebrow">— {site.name}</div>
          <h1>
            Learn by doing.
            <br />
            <em>Build</em> things that
            <br />
            <em>matter</em>.
          </h1>
          <p>
            {site.tagline ??
              "Production-grade courses, streamed from your own library. No SaaS lock-in, no platform fees."}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/courses" className="btn btn-primary">
              Browse all courses →
            </Link>
            <Link href={"/signup" as Route} className="btn btn-ghost">
              Create an account
            </Link>
          </div>
          <div className="hero-stats">
            <div>
              <div className="hero-stat-num">{totalCourses}</div>
              <div className="hero-stat-label">Courses live</div>
            </div>
            <div>
              <div className="hero-stat-num">HLS</div>
              <div className="hero-stat-label">Adaptive streaming</div>
            </div>
            <div>
              <div className="hero-stat-num">∞</div>
              <div className="hero-stat-label">Lifetime access</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          {featured ? (
            <Link
              href={`/courses/${featured.slug}` as Route}
              className={`hero-featured ${featured.coverImageUrl ? "" : featuredBg}`}
              style={featured.coverImageUrl ? { background: "oklch(0.12 0.025 300)" } : undefined}
            >
              <div className="hero-featured-meta">
                <span className="chip chip-dot" style={{ background: "oklch(1 0 0 / 0.12)", color: "oklch(0.95 0.02 60)", border: "none" }}>
                  Featured
                </span>
                <span>· Start here</span>
              </div>
              <div>
                <div
                  style={{
                    fontFamily: "var(--serif)",
                    fontStyle: "italic",
                    fontSize: 130,
                    lineHeight: 0.8,
                    opacity: 0.18,
                    marginBottom: -20,
                    letterSpacing: "-0.04em",
                    fontWeight: 700,
                  }}
                >
                  01
                </div>
                <h3>{featured.title}</h3>
                {featured.subtitle ? (
                  <p
                    style={{
                      fontSize: 14,
                      opacity: 0.8,
                      margin: "12px 0 0",
                      maxWidth: "32ch",
                    }}
                  >
                    {featured.subtitle}
                  </p>
                ) : null}
              </div>
              <div className="hero-featured-cta">
                <div>
                  <div
                    style={{
                      fontFamily: "var(--mono)",
                      fontSize: 10,
                      letterSpacing: "0.1em",
                      opacity: 0.75,
                      textTransform: "uppercase",
                    }}
                  >
                    Starts at
                  </div>
                  <div
                    style={{
                      fontFamily: "var(--serif)",
                      fontSize: 34,
                      fontWeight: 600,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {featured.isFree
                      ? "Free"
                      : new Intl.NumberFormat("en-US", {
                          style: "currency",
                          currency: featured.currency,
                          maximumFractionDigits: 0,
                        }).format(featured.priceCents / 100)}
                  </div>
                </div>
                <span className="play-btn-lg" aria-hidden>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </div>
            </Link>
          ) : (
            <div className="hero-featured bg-pink-grad">
              <div className="hero-featured-meta">
                <span className="chip chip-dot" style={{ background: "oklch(1 0 0 / 0.12)", color: "oklch(0.95 0.02 60)", border: "none" }}>
                  Coming soon
                </span>
              </div>
              <div>
                <h3>Your catalogue lives here.</h3>
                <p style={{ fontSize: 14, opacity: 0.8, margin: "12px 0 0", maxWidth: "32ch" }}>
                  Publish your first course from the admin dashboard.
                </p>
              </div>
              <div className="hero-featured-cta">
                <span className="mono-label" style={{ color: "oklch(1 0 0 / 0.7)" }}>— Empty catalogue</span>
              </div>
            </div>
          )}
        </div>
      </section>

      <div className="section-head">
        <div>
          <div className="mono-label" style={{ marginBottom: 8 }}>— The Catalogue</div>
          <h2>
            All courses{" "}
            <span className="count">
              ({totalCourses})
            </span>
          </h2>
        </div>
        <Link href="/courses" className="mono-label" style={{ cursor: "pointer" }}>
          View all ↗
        </Link>
      </div>

      <div className="course-grid">
        {published.slice(0, 6).map((c, i) => {
          const priceLabel = c.isFree
            ? "Free"
            : new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: c.currency,
                maximumFractionDigits: 0,
              }).format(c.priceCents / 100);
          const bg = THUMB_BG[i % THUMB_BG.length];
          return (
            <Link
              key={c.id}
              href={`/courses/${c.slug}` as Route}
              className="course-card"
            >
              <div className={`course-thumb ${c.coverImageUrl ? "bg-image" : bg}`}>
                {c.coverImageUrl ? (
                  <img src={c.coverImageUrl} alt="" />
                ) : (
                  <>
                    <span className="course-thumb-num">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {c.subtitle ? (
                      <span className="course-thumb-cat">{c.subtitle}</span>
                    ) : null}
                  </>
                )}
              </div>
              <div className="course-body">
                <h4>{c.title}</h4>
                {c.subtitle ? <p>{c.subtitle}</p> : <p style={{ opacity: 0.6 }}>Get started →</p>}
                <div className="course-meta">
                  <span>
                    {c.isFree ? "Free access" : "Lifetime access"}
                  </span>
                  <span className="course-price">
                    {c.isFree ? (
                      "Free"
                    ) : (
                      <>
                        <sup>$</sup>
                        {Math.round(c.priceCents / 100)}
                      </>
                    )}
                  </span>
                </div>
                <span className="sr-only">{priceLabel}</span>
              </div>
            </Link>
          );
        })}
        {published.length === 0 ? (
          <div
            className="card"
            style={{
              padding: 40,
              gridColumn: "1 / -1",
              textAlign: "center",
              color: "var(--ink-3)",
            }}
          >
            <div
              style={{
                fontFamily: "var(--serif)",
                fontSize: 26,
                fontWeight: 600,
                color: "var(--ink)",
                marginBottom: 8,
              }}
            >
              No published courses yet.
            </div>
            <div className="mono-label">Create one from the admin dashboard.</div>
          </div>
        ) : null}
      </div>
    </>
  );
}
