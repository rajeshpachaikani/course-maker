"use client";

import { useState, useTransition } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { css as cssLang } from "@codemirror/lang-css";
import { saveThemeAction } from "./actions";

interface ThemeColors {
  bg: string;
  fg: string;
  surface: string;
  mutedFg: string;
  border: string;
  primary: string;
  primaryFg: string;
  accent: string;
  accentFg: string;
}

interface ResolvedTheme {
  colors: ThemeColors;
  fonts: { sans: string; heading?: string; mono?: string };
  borderRadius: string;
  customCss: string | null;
}

const COLOR_FIELDS: Array<{ key: keyof ThemeColors; label: string; hint?: string }> = [
  { key: "bg", label: "Background", hint: "Page background" },
  { key: "fg", label: "Foreground", hint: "Body text" },
  { key: "surface", label: "Surface", hint: "Cards & panels" },
  { key: "mutedFg", label: "Muted text", hint: "Secondary text" },
  { key: "border", label: "Border", hint: "Dividers & outlines" },
  { key: "primary", label: "Primary", hint: "Buttons, CTAs" },
  { key: "primaryFg", label: "Primary text", hint: "Text on primary" },
  { key: "accent", label: "Accent", hint: "Links, highlights" },
  { key: "accentFg", label: "Accent text", hint: "Text on accent" },
];

const GOOGLE_FONTS = [
  "Inter, ui-sans-serif, system-ui, sans-serif",
  "Manrope, ui-sans-serif, system-ui, sans-serif",
  "Plus Jakarta Sans, ui-sans-serif, system-ui, sans-serif",
  "DM Sans, ui-sans-serif, system-ui, sans-serif",
  "Poppins, ui-sans-serif, system-ui, sans-serif",
  "Work Sans, ui-sans-serif, system-ui, sans-serif",
  "Nunito, ui-sans-serif, system-ui, sans-serif",
  "Source Sans 3, ui-sans-serif, system-ui, sans-serif",
  "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif",
  "Space Grotesk, ui-sans-serif, system-ui, sans-serif",
];

const HEADING_FONTS = [
  "Inter, ui-sans-serif, system-ui, sans-serif",
  "Manrope, ui-sans-serif, system-ui, sans-serif",
  "Poppins, ui-sans-serif, system-ui, sans-serif",
  "Fraunces, ui-serif, Georgia, serif",
  "Playfair Display, ui-serif, Georgia, serif",
  "Space Grotesk, ui-sans-serif, system-ui, sans-serif",
  "Lora, ui-serif, Georgia, serif",
  "DM Serif Display, ui-serif, Georgia, serif",
];

const MONO_FONTS = [
  "ui-monospace, SFMono-Regular, Menlo, monospace",
  "JetBrains Mono, ui-monospace, SFMono-Regular, monospace",
  "Fira Code, ui-monospace, SFMono-Regular, monospace",
  "IBM Plex Mono, ui-monospace, SFMono-Regular, monospace",
  "Source Code Pro, ui-monospace, SFMono-Regular, monospace",
];

function parseRadiusRem(v: string): number {
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0.5;
}

export function AppearanceForm({ initial }: { initial: ResolvedTheme }) {
  const [colors, setColors] = useState<ThemeColors>(initial.colors);
  const [sans, setSans] = useState(initial.fonts.sans);
  const [heading, setHeading] = useState(
    initial.fonts.heading ?? initial.fonts.sans,
  );
  const [mono, setMono] = useState(
    initial.fonts.mono ?? "ui-monospace, SFMono-Regular, Menlo, monospace",
  );
  const [radius, setRadius] = useState(parseRadiusRem(initial.borderRadius));
  const [customCss, setCustomCss] = useState(initial.customCss ?? "");
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("customCss", customCss);
    fd.set("borderRadius", String(radius));
    start(async () => {
      setMessage(null);
      try {
        await saveThemeAction(fd);
        setMessage("Saved. Theme applied on next page load.");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  function setColor(key: keyof ThemeColors, value: string) {
    setColors((c) => ({ ...c, [key]: value }));
  }

  const previewStyle = {
    "--cf-bg": colors.bg,
    "--cf-fg": colors.fg,
    "--cf-surface": colors.surface,
    "--cf-muted-fg": colors.mutedFg,
    "--cf-border": colors.border,
    "--cf-primary": colors.primary,
    "--cf-primary-fg": colors.primaryFg,
    "--cf-accent": colors.accent,
    "--cf-accent-fg": colors.accentFg,
    "--cf-radius": `${radius}rem`,
    "--cf-font-sans": sans,
    "--cf-font-heading": heading,
  } as React.CSSProperties;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-8">
      <section className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6">
        <h2 className="text-lg font-semibold">Colors</h2>
        <p className="mt-1 text-sm text-[var(--cf-muted-fg)]">
          Hex values. Applied as CSS custom properties.
        </p>
        <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {COLOR_FIELDS.map((f) => (
            <label key={f.key} className="flex flex-col gap-1 text-sm">
              <span className="font-medium">{f.label}</span>
              {f.hint ? (
                <span className="text-xs text-[var(--cf-muted-fg)]">
                  {f.hint}
                </span>
              ) : null}
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={colors[f.key]}
                  onChange={(e) => setColor(f.key, e.target.value)}
                  className="h-9 w-12 cursor-pointer rounded-[var(--cf-radius)] border border-[var(--cf-border)]"
                  aria-label={`${f.label} color`}
                />
                <input
                  type="text"
                  name={`colors.${f.key}`}
                  value={colors[f.key]}
                  onChange={(e) => setColor(f.key, e.target.value)}
                  pattern="^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$"
                  className="flex-1 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 font-mono text-xs"
                />
              </div>
            </label>
          ))}
        </div>
      </section>

      <section className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6">
        <h2 className="text-lg font-semibold">Typography</h2>
        <div className="mt-4 flex flex-col gap-4">
          <FontSelect
            label="Body font (sans)"
            name="fonts.sans"
            value={sans}
            onChange={setSans}
            options={GOOGLE_FONTS}
          />
          <FontSelect
            label="Heading font"
            name="fonts.heading"
            value={heading}
            onChange={setHeading}
            options={HEADING_FONTS}
          />
          <FontSelect
            label="Mono font"
            name="fonts.mono"
            value={mono}
            onChange={setMono}
            options={MONO_FONTS}
          />
        </div>
      </section>

      <section className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6">
        <h2 className="text-lg font-semibold">Border radius</h2>
        <p className="mt-1 text-sm text-[var(--cf-muted-fg)]">
          Global corner rounding. Applied to buttons, cards, and inputs.
        </p>
        <div className="mt-4 flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            className="flex-1"
          />
          <span className="w-16 font-mono text-sm">{radius.toFixed(2)}rem</span>
        </div>
      </section>

      <section className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6">
        <h2 className="text-lg font-semibold">Custom CSS</h2>
        <p className="mt-1 text-sm text-[var(--cf-muted-fg)]">
          Injected globally. Use for brand-specific tweaks. Leave empty to clear.
        </p>
        <div className="mt-4 overflow-hidden rounded-[var(--cf-radius)] border border-[var(--cf-border)]">
          <CodeMirror
            value={customCss}
            onChange={setCustomCss}
            extensions={[cssLang()]}
            height="240px"
            basicSetup={{
              lineNumbers: true,
              foldGutter: false,
              highlightActiveLine: false,
            }}
          />
        </div>
      </section>

      <section
        className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] p-6"
        style={previewStyle}
      >
        <h2 className="text-lg font-semibold" style={{ color: colors.fg }}>
          Preview
        </h2>
        <div
          className="mt-4 flex flex-col gap-3 rounded-[var(--cf-radius)] p-4"
          style={{ background: colors.bg, color: colors.fg }}
        >
          <div style={{ fontFamily: heading, fontSize: "1.25rem", fontWeight: 600 }}>
            Heading example
          </div>
          <div style={{ fontFamily: sans, color: colors.mutedFg }}>
            Body text renders in the sans font. Muted tone used for secondary
            copy.
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              style={{
                background: colors.primary,
                color: colors.primaryFg,
                borderRadius: `${radius}rem`,
                padding: "0.5rem 1rem",
                border: "none",
                cursor: "default",
              }}
            >
              Primary
            </button>
            <button
              type="button"
              style={{
                background: colors.accent,
                color: colors.accentFg,
                borderRadius: `${radius}rem`,
                padding: "0.5rem 1rem",
                border: "none",
                cursor: "default",
              }}
            >
              Accent
            </button>
            <button
              type="button"
              style={{
                background: colors.surface,
                color: colors.fg,
                borderRadius: `${radius}rem`,
                padding: "0.5rem 1rem",
                border: `1px solid ${colors.border}`,
                cursor: "default",
              }}
            >
              Secondary
            </button>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="cf-btn-primary">
          {pending ? "Saving…" : "Save theme"}
        </button>
        {message ? (
          <span className="text-sm text-[var(--cf-muted-fg)]">{message}</span>
        ) : null}
      </div>
    </form>
  );
}

function FontSelect({
  label,
  name,
  value,
  onChange,
  options,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: string[];
}) {
  const inList = options.includes(value);
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input type="hidden" name={name} value={value} />
      <select
        value={inList ? value : "__custom__"}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "__custom__") {
            onChange("");
            return;
          }
          onChange(v);
        }}
        className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm"
        style={{ fontFamily: value }}
      >
        {options.map((o) => (
          <option key={o} value={o} style={{ fontFamily: o }}>
            {o.split(",")[0]}
          </option>
        ))}
        <option value="__custom__">Custom…</option>
      </select>
      {!inList ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Custom font stack (CSS font-family value)"
          className="mt-1 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 font-mono text-xs"
        />
      ) : null}
    </label>
  );
}
