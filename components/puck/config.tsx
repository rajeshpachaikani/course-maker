import type { Config } from "@measured/puck";

export interface HeroProps {
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  imageUrl?: string;
  align: "left" | "center";
}

export interface HeadingProps {
  text: string;
  level: "h1" | "h2" | "h3";
  align: "left" | "center" | "right";
}

export interface ParagraphProps {
  text: string;
  align: "left" | "center" | "right";
}

export interface ImageProps {
  src: string;
  alt: string;
  caption?: string;
  maxWidth?: string;
}

export interface VideoProps {
  embedUrl: string;
  caption?: string;
}

export interface CtaProps {
  label: string;
  href: string;
  variant: "primary" | "secondary";
  align: "left" | "center" | "right";
}

export interface FeatureItem {
  title: string;
  description: string;
  icon?: string;
}

export interface FeatureGridProps {
  heading?: string;
  features: FeatureItem[];
  columns: "2" | "3" | "4";
}

export interface Testimonial {
  quote: string;
  author: string;
  role?: string;
}

export interface TestimonialsProps {
  heading?: string;
  items: Testimonial[];
}

export interface PricingTier {
  name: string;
  price: string;
  period?: string;
  features: { text: string }[];
  ctaLabel: string;
  ctaHref: string;
  highlighted?: boolean;
}

export interface PricingProps {
  heading?: string;
  tiers: PricingTier[];
}

export interface RawHtmlProps {
  html: string;
}

type ComponentMap = {
  Hero: HeroProps;
  Heading: HeadingProps;
  Paragraph: ParagraphProps;
  Image: ImageProps;
  Video: VideoProps;
  Cta: CtaProps;
  FeatureGrid: FeatureGridProps;
  Testimonials: TestimonialsProps;
  Pricing: PricingProps;
  RawHtml: RawHtmlProps;
};

export type PuckConfig = Config<ComponentMap>;

export function Hero({
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  imageUrl,
  align,
}: HeroProps) {
  return (
    <section
      className={`cf-block cf-hero ${
        align === "center" ? "text-center" : "text-left"
      }`}
      style={{ padding: "5rem 1.5rem" }}
    >
      <div
        className="mx-auto flex max-w-5xl flex-col gap-6"
        style={{ alignItems: align === "center" ? "center" : "flex-start" }}
      >
        <h1
          style={{
            fontFamily: "var(--cf-font-heading)",
            fontSize: "3rem",
            lineHeight: 1.1,
            fontWeight: 600,
          }}
        >
          {title}
        </h1>
        {subtitle ? (
          <p
            style={{
              fontSize: "1.25rem",
              color: "var(--cf-muted-fg)",
              maxWidth: "36rem",
            }}
          >
            {subtitle}
          </p>
        ) : null}
        {ctaLabel && ctaHref ? (
          <a
            href={ctaHref}
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              borderRadius: "var(--cf-radius)",
              background: "var(--cf-primary)",
              color: "var(--cf-primary-fg)",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            {ctaLabel}
          </a>
        ) : null}
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            style={{
              marginTop: "1.5rem",
              maxWidth: "100%",
              borderRadius: "var(--cf-radius)",
            }}
          />
        ) : null}
      </div>
    </section>
  );
}

function Heading({ text, level, align }: HeadingProps) {
  const Tag = level;
  const size = level === "h1" ? "2.5rem" : level === "h2" ? "2rem" : "1.5rem";
  return (
    <section className="cf-block" style={{ padding: "1.5rem" }}>
      <div className="mx-auto max-w-5xl" style={{ textAlign: align }}>
        <Tag
          style={{
            fontFamily: "var(--cf-font-heading)",
            fontSize: size,
            fontWeight: 600,
            lineHeight: 1.2,
          }}
        >
          {text}
        </Tag>
      </div>
    </section>
  );
}

function Paragraph({ text, align }: ParagraphProps) {
  return (
    <section className="cf-block" style={{ padding: "1rem 1.5rem" }}>
      <div
        className="mx-auto max-w-3xl"
        style={{
          textAlign: align,
          fontSize: "1rem",
          lineHeight: 1.6,
          color: "var(--cf-fg)",
          whiteSpace: "pre-wrap",
        }}
      >
        {text}
      </div>
    </section>
  );
}

function ImageBlock({ src, alt, caption, maxWidth }: ImageProps) {
  return (
    <section className="cf-block" style={{ padding: "1.5rem" }}>
      <figure
        className="mx-auto"
        style={{ maxWidth: maxWidth ?? "60rem", margin: "0 auto" }}
      >
        {src ? (
          <img
            src={src}
            alt={alt}
            style={{
              width: "100%",
              borderRadius: "var(--cf-radius)",
              display: "block",
            }}
          />
        ) : (
          <div
            style={{
              background: "var(--cf-border)",
              aspectRatio: "16/9",
              borderRadius: "var(--cf-radius)",
            }}
          />
        )}
        {caption ? (
          <figcaption
            style={{
              fontSize: "0.875rem",
              color: "var(--cf-muted-fg)",
              textAlign: "center",
              marginTop: "0.5rem",
            }}
          >
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}

function VideoBlock({ embedUrl, caption }: VideoProps) {
  return (
    <section className="cf-block" style={{ padding: "1.5rem" }}>
      <figure className="mx-auto" style={{ maxWidth: "60rem" }}>
        <div
          style={{
            position: "relative",
            paddingBottom: "56.25%",
            height: 0,
            overflow: "hidden",
            borderRadius: "var(--cf-radius)",
            background: "var(--cf-border)",
          }}
        >
          {embedUrl ? (
            <iframe
              src={embedUrl}
              allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
            />
          ) : null}
        </div>
        {caption ? (
          <figcaption
            style={{
              fontSize: "0.875rem",
              color: "var(--cf-muted-fg)",
              textAlign: "center",
              marginTop: "0.5rem",
            }}
          >
            {caption}
          </figcaption>
        ) : null}
      </figure>
    </section>
  );
}

function CtaBlock({ label, href, variant, align }: CtaProps) {
  const bg =
    variant === "primary" ? "var(--cf-primary)" : "var(--cf-accent)";
  const fg =
    variant === "primary" ? "var(--cf-primary-fg)" : "var(--cf-accent-fg)";
  return (
    <section className="cf-block" style={{ padding: "2rem 1.5rem" }}>
      <div className="mx-auto max-w-5xl" style={{ textAlign: align }}>
        <a
          href={href}
          style={{
            display: "inline-block",
            padding: "0.875rem 1.75rem",
            borderRadius: "var(--cf-radius)",
            background: bg,
            color: fg,
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          {label}
        </a>
      </div>
    </section>
  );
}

function FeatureGrid({ heading, features, columns }: FeatureGridProps) {
  return (
    <section className="cf-block" style={{ padding: "3rem 1.5rem" }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {heading ? (
          <h2
            style={{
              fontFamily: "var(--cf-font-heading)",
              fontSize: "2rem",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {heading}
          </h2>
        ) : null}
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          }}
          className="cf-feature-grid"
        >
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                padding: "1.5rem",
                borderRadius: "var(--cf-radius)",
                border: "1px solid var(--cf-border)",
                background: "var(--cf-surface)",
              }}
            >
              {f.icon ? (
                <div style={{ fontSize: "2rem" }}>{f.icon}</div>
              ) : null}
              <div
                style={{
                  marginTop: f.icon ? "0.75rem" : 0,
                  fontWeight: 600,
                  fontSize: "1.125rem",
                }}
              >
                {f.title}
              </div>
              <div
                style={{
                  marginTop: "0.5rem",
                  color: "var(--cf-muted-fg)",
                  fontSize: "0.95rem",
                  lineHeight: 1.5,
                }}
              >
                {f.description}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials({ heading, items }: TestimonialsProps) {
  return (
    <section className="cf-block" style={{ padding: "3rem 1.5rem" }}>
      <div className="mx-auto flex max-w-5xl flex-col gap-8">
        {heading ? (
          <h2
            style={{
              fontFamily: "var(--cf-font-heading)",
              fontSize: "2rem",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {heading}
          </h2>
        ) : null}
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: `repeat(auto-fit, minmax(16rem, 1fr))`,
          }}
        >
          {items.map((t, i) => (
            <blockquote
              key={i}
              style={{
                padding: "1.5rem",
                borderRadius: "var(--cf-radius)",
                border: "1px solid var(--cf-border)",
                background: "var(--cf-surface)",
                margin: 0,
              }}
            >
              <p style={{ fontSize: "1rem", lineHeight: 1.5 }}>“{t.quote}”</p>
              <footer
                style={{
                  marginTop: "1rem",
                  fontSize: "0.875rem",
                  color: "var(--cf-muted-fg)",
                }}
              >
                <strong style={{ color: "var(--cf-fg)" }}>{t.author}</strong>
                {t.role ? ` · ${t.role}` : null}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

function Pricing({ heading, tiers }: PricingProps) {
  return (
    <section className="cf-block" style={{ padding: "3rem 1.5rem" }}>
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        {heading ? (
          <h2
            style={{
              fontFamily: "var(--cf-font-heading)",
              fontSize: "2rem",
              textAlign: "center",
              fontWeight: 600,
            }}
          >
            {heading}
          </h2>
        ) : null}
        <div
          style={{
            display: "grid",
            gap: "1.5rem",
            gridTemplateColumns: `repeat(auto-fit, minmax(18rem, 1fr))`,
          }}
        >
          {tiers.map((t, i) => (
            <div
              key={i}
              style={{
                padding: "2rem",
                borderRadius: "var(--cf-radius)",
                border: `1px solid ${
                  t.highlighted ? "var(--cf-primary)" : "var(--cf-border)"
                }`,
                background: "var(--cf-surface)",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div style={{ fontWeight: 600, fontSize: "1.25rem" }}>
                {t.name}
              </div>
              <div style={{ fontSize: "2.5rem", fontWeight: 700 }}>
                {t.price}
                {t.period ? (
                  <span
                    style={{
                      fontSize: "1rem",
                      color: "var(--cf-muted-fg)",
                      fontWeight: 400,
                    }}
                  >
                    {" "}
                    /{t.period}
                  </span>
                ) : null}
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: 0,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {t.features.map((f, j) => (
                  <li
                    key={j}
                    style={{ color: "var(--cf-muted-fg)", fontSize: "0.95rem" }}
                  >
                    ✓ {f.text}
                  </li>
                ))}
              </ul>
              <a
                href={t.ctaHref}
                style={{
                  marginTop: "auto",
                  display: "inline-block",
                  textAlign: "center",
                  padding: "0.75rem 1.5rem",
                  borderRadius: "var(--cf-radius)",
                  background: t.highlighted
                    ? "var(--cf-primary)"
                    : "var(--cf-surface)",
                  color: t.highlighted ? "var(--cf-primary-fg)" : "var(--cf-fg)",
                  textDecoration: "none",
                  fontWeight: 500,
                  border: "1px solid var(--cf-primary)",
                }}
              >
                {t.ctaLabel}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RawHtml({ html }: RawHtmlProps) {
  return (
    <section
      className="cf-block"
      style={{ padding: "1.5rem" }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function buildPuckConfig(opts: {
  rawHtmlEnabled: boolean;
}): PuckConfig {
  const components: PuckConfig["components"] = {
    Hero: {
      label: "Hero",
      fields: {
        title: { type: "text" },
        subtitle: { type: "textarea" },
        ctaLabel: { type: "text" },
        ctaHref: { type: "text" },
        imageUrl: { type: "text" },
        align: {
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
          ],
        },
      },
      defaultProps: {
        title: "Welcome",
        subtitle: "A short pitch",
        ctaLabel: "Get started",
        ctaHref: "/courses",
        imageUrl: "",
        align: "center",
      },
      render: Hero,
    },
    Heading: {
      label: "Heading",
      fields: {
        text: { type: "text" },
        level: {
          type: "select",
          options: [
            { label: "H1", value: "h1" },
            { label: "H2", value: "h2" },
            { label: "H3", value: "h3" },
          ],
        },
        align: {
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: { text: "Heading", level: "h2", align: "left" },
      render: Heading,
    },
    Paragraph: {
      label: "Paragraph",
      fields: {
        text: { type: "textarea" },
        align: {
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: { text: "Your copy here.", align: "left" },
      render: Paragraph,
    },
    Image: {
      label: "Image",
      fields: {
        src: { type: "text" },
        alt: { type: "text" },
        caption: { type: "text" },
        maxWidth: { type: "text" },
      },
      defaultProps: { src: "", alt: "", caption: "", maxWidth: "60rem" },
      render: ImageBlock,
    },
    Video: {
      label: "Video embed",
      fields: {
        embedUrl: { type: "text" },
        caption: { type: "text" },
      },
      defaultProps: { embedUrl: "", caption: "" },
      render: VideoBlock,
    },
    Cta: {
      label: "Call to action",
      fields: {
        label: { type: "text" },
        href: { type: "text" },
        variant: {
          type: "select",
          options: [
            { label: "Primary", value: "primary" },
            { label: "Accent", value: "secondary" },
          ],
        },
        align: {
          type: "select",
          options: [
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ],
        },
      },
      defaultProps: {
        label: "Get started",
        href: "/signup",
        variant: "primary",
        align: "center",
      },
      render: CtaBlock,
    },
    FeatureGrid: {
      label: "Feature grid",
      fields: {
        heading: { type: "text" },
        columns: {
          type: "select",
          options: [
            { label: "2", value: "2" },
            { label: "3", value: "3" },
            { label: "4", value: "4" },
          ],
        },
        features: {
          type: "array",
          arrayFields: {
            title: { type: "text" },
            description: { type: "textarea" },
            icon: { type: "text" },
          },
        },
      },
      defaultProps: {
        heading: "Features",
        columns: "3",
        features: [
          { title: "Fast", description: "Blazing fast delivery.", icon: "⚡" },
          { title: "Secure", description: "Rock-solid security.", icon: "🔒" },
          {
            title: "Scalable",
            description: "Grows with your audience.",
            icon: "📈",
          },
        ],
      },
      render: FeatureGrid,
    },
    Testimonials: {
      label: "Testimonials",
      fields: {
        heading: { type: "text" },
        items: {
          type: "array",
          arrayFields: {
            quote: { type: "textarea" },
            author: { type: "text" },
            role: { type: "text" },
          },
        },
      },
      defaultProps: {
        heading: "Loved by learners",
        items: [
          {
            quote: "This course changed how I think about the topic.",
            author: "Jane Doe",
            role: "Product manager",
          },
        ],
      },
      render: Testimonials,
    },
    Pricing: {
      label: "Pricing",
      fields: {
        heading: { type: "text" },
        tiers: {
          type: "array",
          arrayFields: {
            name: { type: "text" },
            price: { type: "text" },
            period: { type: "text" },
            ctaLabel: { type: "text" },
            ctaHref: { type: "text" },
            highlighted: {
              type: "radio",
              options: [
                { label: "No", value: false },
                { label: "Yes", value: true },
              ],
            },
            features: {
              type: "array",
              arrayFields: {
                text: { type: "text" },
              },
            },
          },
        },
      },
      defaultProps: {
        heading: "Pricing",
        tiers: [
          {
            name: "Starter",
            price: "$29",
            period: "mo",
            ctaLabel: "Start",
            ctaHref: "/signup",
            highlighted: false,
            features: [{ text: "All basics" }],
          },
          {
            name: "Pro",
            price: "$79",
            period: "mo",
            ctaLabel: "Upgrade",
            ctaHref: "/signup",
            highlighted: true,
            features: [{ text: "Everything in Starter" }, { text: "Priority support" }],
          },
        ],
      },
      render: Pricing,
    },
    RawHtml: {
      label: "Raw HTML",
      fields: {
        html: { type: "textarea" },
      },
      defaultProps: { html: "<p>Replace me</p>" },
      render: RawHtml,
    },
  };

  const filtered: PuckConfig["components"] = opts.rawHtmlEnabled
    ? components
    : (() => {
        const { RawHtml: _removed, ...rest } = components;
        return rest as PuckConfig["components"];
      })();

  return {
    components: filtered,
    categories: {
      layout: {
        title: "Layout",
        components: ["Hero", "Heading", "Paragraph", "Cta"],
      },
      media: { title: "Media", components: ["Image", "Video"] },
      social: {
        title: "Social proof",
        components: ["FeatureGrid", "Testimonials", "Pricing"],
      },
      ...(opts.rawHtmlEnabled
        ? { advanced: { title: "Advanced", components: ["RawHtml"] } }
        : {}),
    },
  };
}
