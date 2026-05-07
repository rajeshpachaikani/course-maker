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

type Mode = "light" | "dark";

interface ThemePalettes {
  light: ThemeColors;
  dark: ThemeColors;
}

interface ResolvedTheme {
  colors: ThemePalettes;
  fonts: { sans: string; heading?: string; mono?: string };
  borderRadius: string;
  customCss: string | null;
}

const CARD_STYLE: React.CSSProperties = {
  background: "var(--paper-2)",
  border: "1px solid var(--hair)",
  borderRadius: "var(--radius-lg)",
  padding: 24,
};

const COLOR_FIELDS: Array<{
  key: keyof ThemeColors;
  label: string;
  hint?: string;
}> = [
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

const ACCENT_PRESETS: Array<{ id: string; primary: string; accent: string }> = [
  {
    id: "pink",
    primary: "oklch(0.72 0.28 355)",
    accent: "oklch(0.58 0.3 340)",
  },
  {
    id: "terracotta",
    primary: "oklch(0.68 0.16 35)",
    accent: "oklch(0.56 0.14 30)",
  },
  {
    id: "olive",
    primary: "oklch(0.6 0.12 120)",
    accent: "oklch(0.48 0.1 120)",
  },
  {
    id: "ochre",
    primary: "oklch(0.75 0.14 75)",
    accent: "oklch(0.6 0.13 70)",
  },
  {
    id: "plum",
    primary: "oklch(0.6 0.18 330)",
    accent: "oklch(0.45 0.15 330)",
  },
  {
    id: "teal",
    primary: "oklch(0.65 0.13 195)",
    accent: "oklch(0.5 0.11 200)",
  },
];

const GOOGLE_FONTS = [
  "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  "Inter, ui-sans-serif, system-ui, sans-serif",
  "Manrope, ui-sans-serif, system-ui, sans-serif",
  "DM Sans, ui-sans-serif, system-ui, sans-serif",
  "Poppins, ui-sans-serif, system-ui, sans-serif",
  "Work Sans, ui-sans-serif, system-ui, sans-serif",
  "Nunito, ui-sans-serif, system-ui, sans-serif",
  "Source Sans 3, ui-sans-serif, system-ui, sans-serif",
  "IBM Plex Sans, ui-sans-serif, system-ui, sans-serif",
  "Space Grotesk, ui-sans-serif, system-ui, sans-serif",
];

const HEADING_FONTS = [
  "'Poppins', ui-sans-serif, system-ui, sans-serif",
  "'Plus Jakarta Sans', ui-sans-serif, system-ui, sans-serif",
  "Inter, ui-sans-serif, system-ui, sans-serif",
  "Manrope, ui-sans-serif, system-ui, sans-serif",
  "Fraunces, ui-serif, Georgia, serif",
  "Playfair Display, ui-serif, Georgia, serif",
  "Space Grotesk, ui-sans-serif, system-ui, sans-serif",
  "Lora, ui-serif, Georgia, serif",
  "DM Serif Display, ui-serif, Georgia, serif",
];

const MONO_FONTS = [
  "'JetBrains Mono', ui-monospace, SFMono-Regular, monospace",
  "ui-monospace, SFMono-Regular, Menlo, monospace",
  "Fira Code, ui-monospace, SFMono-Regular, monospace",
  "IBM Plex Mono, ui-monospace, SFMono-Regular, monospace",
  "Source Code Pro, ui-monospace, SFMono-Regular, monospace",
];

function parseRadiusRem(v: string): number {
  if (v.endsWith("px")) {
    const n = Number.parseFloat(v);
    return Number.isFinite(n) ? n / 16 : 0.625;
  }
  const n = Number.parseFloat(v);
  return Number.isFinite(n) ? n : 0.625;
}

export function AppearanceForm({ initial }: { initial: ResolvedTheme }) {
  const [palettes, setPalettes] = useState<ThemePalettes>(initial.colors);
  const [activeMode, setActiveMode] = useState<Mode>("dark");
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

  const colors = palettes[activeMode];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("customCss", customCss);
    fd.set("borderRadius", `${radius}rem`);
    for (const m of ["light", "dark"] as const) {
      for (const k of Object.keys(palettes[m]) as Array<keyof ThemeColors>) {
        fd.set(`colors.${m}.${k}`, palettes[m][k]);
      }
    }
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
    setPalettes((p) => ({
      ...p,
      [activeMode]: { ...p[activeMode], [key]: value },
    }));
  }

  function applyAccentPreset(preset: (typeof ACCENT_PRESETS)[number]) {
    setPalettes((p) => ({
      ...p,
      [activeMode]: {
        ...p[activeMode],
        primary: preset.primary,
        accent: preset.accent,
      },
    }));
  }

  const activePreset = ACCENT_PRESETS.find(
    (p) => p.primary === colors.primary,
  );

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: 20 }}
    >
      <section style={CARD_STYLE}>
        <div className="mono-label" style={{ marginBottom: 4 }}>
          — Mode
        </div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: 22,
            margin: "2px 0 14px",
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          Editing{" "}
          <span style={{ color: "var(--pink)" }}>
            {activeMode === "dark" ? "dark" : "light"}
          </span>{" "}
          mode
        </h2>
        <div
          role="tablist"
          aria-label="Theme mode"
          style={{
            display: "inline-flex",
            border: "1px solid var(--hair)",
            borderRadius: "var(--radius)",
            overflow: "hidden",
          }}
        >
          {(["light", "dark"] as const).map((m) => {
            const active = activeMode === m;
            return (
              <button
                key={m}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveMode(m)}
                style={{
                  background: active ? "var(--pink)" : "transparent",
                  color: active ? "var(--cm-primary-fg)" : "var(--ink)",
                  border: "none",
                  padding: "8px 18px",
                  fontFamily: "var(--mono)",
                  fontSize: 11,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                }}
              >
                {m}
              </button>
            );
          })}
        </div>
        <p
          style={{
            fontSize: 12,
            color: "var(--ink-3)",
            margin: "10px 0 0",
          }}
        >
          Each mode keeps its own colour palette. Switch tabs to edit the
          other.
        </p>
      </section>

      <section style={CARD_STYLE}>
        <div className="mono-label" style={{ marginBottom: 4 }}>
          — Accent palette
        </div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: 22,
            margin: "2px 0 14px",
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          Pick a preset{" "}
          <span
            style={{
              fontStyle: "italic",
              color: "var(--ink-3)",
              fontSize: 17,
              fontWeight: 500,
            }}
          >
            — or edit values below
          </span>
        </h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            alignItems: "center",
          }}
        >
          {ACCENT_PRESETS.map((p) => (
            <button
              key={p.id}
              type="button"
              className={`swatch ${activePreset?.id === p.id ? "active" : ""}`}
              style={{
                background: `linear-gradient(135deg, ${p.primary} 0%, ${p.accent} 100%)`,
              }}
              onClick={() => applyAccentPreset(p)}
              aria-label={p.id}
              title={p.id}
            />
          ))}
        </div>
      </section>

      <section style={CARD_STYLE}>
        <div className="mono-label" style={{ marginBottom: 4 }}>
          — Colors
        </div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: 22,
            margin: "2px 0 14px",
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          Full palette
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: 16,
          }}
        >
          {COLOR_FIELDS.map((f) => (
            <div key={f.key} className="field" style={{ margin: 0 }}>
              <label>{f.label.toUpperCase()}</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: colors[f.key],
                    border: "1px solid var(--hair)",
                    flexShrink: 0,
                  }}
                />
                <input
                  type="text"
                  name={`colors.${f.key}`}
                  value={colors[f.key]}
                  onChange={(e) => setColor(f.key, e.target.value)}
                  style={{ flex: 1, fontFamily: "var(--mono)", fontSize: 12 }}
                />
              </div>
              {f.hint ? (
                <div
                  className="mono-label"
                  style={{ fontSize: 9.5, marginTop: 4 }}
                >
                  — {f.hint.toUpperCase()}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <section style={CARD_STYLE}>
        <div className="mono-label" style={{ marginBottom: 4 }}>
          — Typography
        </div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: 22,
            margin: "2px 0 14px",
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          Fonts
        </h2>
        <div
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <FontSelect
            label="BODY FONT (SANS)"
            name="fonts.sans"
            value={sans}
            onChange={setSans}
            options={GOOGLE_FONTS}
          />
          <FontSelect
            label="HEADING FONT"
            name="fonts.heading"
            value={heading}
            onChange={setHeading}
            options={HEADING_FONTS}
          />
          <FontSelect
            label="MONO FONT"
            name="fonts.mono"
            value={mono}
            onChange={setMono}
            options={MONO_FONTS}
          />
        </div>
      </section>

      <section style={CARD_STYLE}>
        <div className="mono-label" style={{ marginBottom: 4 }}>
          — Border radius
        </div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: 22,
            margin: "2px 0 14px",
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          Corner rounding
        </h2>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <input
            type="range"
            min="0"
            max="2"
            step="0.05"
            value={radius}
            onChange={(e) => setRadius(Number(e.target.value))}
            style={{ flex: 1, accentColor: "var(--pink)" }}
          />
          <span
            style={{
              width: 80,
              fontFamily: "var(--mono)",
              fontSize: 13,
              color: "var(--ink)",
              textAlign: "right",
            }}
          >
            {radius.toFixed(2)}rem
          </span>
        </div>
      </section>

      <section style={CARD_STYLE}>
        <div className="mono-label" style={{ marginBottom: 4 }}>
          — Custom CSS
        </div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: 22,
            margin: "2px 0 6px",
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          Advanced overrides
        </h2>
        <p
          style={{
            fontSize: 13,
            color: "var(--ink-3)",
            margin: "0 0 14px",
          }}
        >
          Injected globally. Leave empty to clear.
        </p>
        <div
          style={{
            overflow: "hidden",
            borderRadius: "var(--radius)",
            border: "1px solid var(--hair)",
          }}
        >
          <CodeMirror
            value={customCss}
            onChange={setCustomCss}
            extensions={[cssLang()]}
            theme="dark"
            height="240px"
            basicSetup={{
              lineNumbers: true,
              foldGutter: false,
              highlightActiveLine: false,
            }}
          />
        </div>
      </section>

      <section style={CARD_STYLE}>
        <div className="mono-label" style={{ marginBottom: 4 }}>
          — Live preview
        </div>
        <h2
          style={{
            fontFamily: "var(--serif)",
            fontSize: 22,
            margin: "2px 0 14px",
            fontWeight: 600,
            color: "var(--ink)",
          }}
        >
          How it looks
        </h2>
        <div
          style={{
            background: colors.bg,
            color: colors.fg,
            borderRadius: `${radius}rem`,
            padding: 24,
            border: `1px solid ${colors.border}`,
          }}
        >
          <div
            style={{
              fontFamily: heading,
              fontSize: 28,
              fontWeight: 600,
              letterSpacing: "-0.015em",
              marginBottom: 8,
            }}
          >
            Heading example
          </div>
          <div
            style={{
              fontFamily: sans,
              color: colors.mutedFg,
              fontSize: 14,
              marginBottom: 16,
            }}
          >
            Body text renders in the sans font. Muted tone used for secondary
            copy.
          </div>
          <div
            style={{ display: "flex", flexWrap: "wrap", gap: 8, fontFamily: sans }}
          >
            <button
              type="button"
              style={{
                background: `linear-gradient(90deg, ${colors.primary} 0%, ${colors.accent} 100%)`,
                color: colors.primaryFg,
                borderRadius: `${radius}rem`,
                padding: "10px 18px",
                border: "none",
                fontSize: 14,
                fontWeight: 600,
                cursor: "default",
              }}
            >
              Primary CTA
            </button>
            <button
              type="button"
              style={{
                background: "transparent",
                color: colors.fg,
                borderRadius: `${radius}rem`,
                padding: "10px 18px",
                border: `1px solid ${colors.border}`,
                fontSize: 14,
                cursor: "default",
              }}
            >
              Secondary
            </button>
            <span
              style={{
                background: colors.surface,
                color: colors.accent,
                borderRadius: 999,
                padding: "6px 12px",
                fontSize: 11,
                fontFamily: mono,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                alignSelf: "center",
              }}
            >
              — CHIP / TAG
            </span>
          </div>
        </div>
      </section>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          position: "sticky",
          bottom: 16,
          background: "var(--paper)",
          padding: 12,
          border: "1px solid var(--hair)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <button
          type="submit"
          disabled={pending}
          className="btn btn-primary"
          style={{ padding: "12px 22px" }}
        >
          {pending ? "Saving…" : "Save theme"}
        </button>
        {message ? (
          <span className="mono-label" style={{ fontSize: 11 }}>
            {message}
          </span>
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
    <div className="field" style={{ margin: 0 }}>
      <label>{label}</label>
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
        style={{ fontFamily: value }}
      >
        {options.map((o) => (
          <option key={o} value={o} style={{ fontFamily: o }}>
            {o.split(",")[0].replace(/['"]/g, "")}
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
          style={{
            marginTop: 8,
            fontFamily: "var(--mono)",
            fontSize: 12,
          }}
        />
      ) : (
        <div
          style={{
            fontFamily: value,
            fontSize: 18,
            color: "var(--ink-2)",
            marginTop: 8,
            padding: "8px 12px",
            background: "var(--paper-3)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--hair)",
          }}
        >
          Marketing, taught well — the quick brown fox.
        </div>
      )}
    </div>
  );
}
