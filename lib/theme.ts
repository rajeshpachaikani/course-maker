import "server-only";
import { cacheTag, cacheLife } from "next/cache";
import { db } from "@/lib/db";
import { themeSettings, siteSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const THEME_TAG = "theme";
export const SITE_TAG = "site-settings";

export interface ThemeColors {
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

export interface ThemeFonts {
  sans: string;
  heading?: string;
  mono?: string;
}

export type ThemeMode = "light" | "dark";

export interface ThemePalettes {
  light: ThemeColors;
  dark: ThemeColors;
}

export interface ResolvedTheme {
  colors: ThemePalettes;
  fonts: ThemeFonts;
  borderRadius: string;
  customCss: string | null;
}

const DEFAULT_DARK: ThemeColors = {
  bg: "oklch(0.16 0.025 300)",
  fg: "oklch(0.98 0.005 300)",
  surface: "oklch(0.20 0.03 300)",
  mutedFg: "oklch(0.60 0.02 300)",
  border: "oklch(0.28 0.03 300)",
  primary: "oklch(0.72 0.28 355)",
  primaryFg: "oklch(1 0 0)",
  accent: "oklch(0.58 0.3 340)",
  accentFg: "oklch(1 0 0)",
};

const DEFAULT_LIGHT: ThemeColors = {
  bg: "oklch(0.98 0.005 300)",
  fg: "oklch(0.18 0.025 300)",
  surface: "oklch(0.95 0.01 300)",
  mutedFg: "oklch(0.45 0.02 300)",
  border: "oklch(0.85 0.02 300)",
  primary: "oklch(0.62 0.25 355)",
  primaryFg: "oklch(1 0 0)",
  accent: "oklch(0.5 0.27 340)",
  accentFg: "oklch(1 0 0)",
};

const DEFAULT_THEME: ResolvedTheme = {
  colors: { light: DEFAULT_LIGHT, dark: DEFAULT_DARK },
  fonts: {
    sans: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    heading: "'Poppins', 'Plus Jakarta Sans', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
  },
  borderRadius: "10px",
  customCss: null,
};

function isFlatColors(v: unknown): v is Partial<ThemeColors> {
  return (
    !!v &&
    typeof v === "object" &&
    "bg" in (v as Record<string, unknown>) &&
    typeof (v as Record<string, unknown>).bg === "string"
  );
}

function normalizeColors(raw: unknown): ThemePalettes {
  if (!raw || typeof raw !== "object") {
    return { light: DEFAULT_LIGHT, dark: DEFAULT_DARK };
  }
  if (isFlatColors(raw)) {
    return {
      light: DEFAULT_LIGHT,
      dark: { ...DEFAULT_DARK, ...(raw as Partial<ThemeColors>) },
    };
  }
  const obj = raw as { light?: Partial<ThemeColors>; dark?: Partial<ThemeColors> };
  return {
    light: { ...DEFAULT_LIGHT, ...(obj.light ?? {}) },
    dark: { ...DEFAULT_DARK, ...(obj.dark ?? {}) },
  };
}

const DEFAULT_SITE = {
  id: "singleton" as const,
  name: "CourseMaker",
  tagline: null as string | null,
  logoUrl: null as string | null,
  faviconUrl: null as string | null,
  googleOauthEnabled: false,
  companyName: null as string | null,
  companyAddress: null as string | null,
  contactPhone: null as string | null,
  supportEmail: null as string | null,
  updatedAt: new Date(0),
};

export async function loadTheme(): Promise<ResolvedTheme> {
  "use cache";
  cacheTag(THEME_TAG);
  cacheLife("max");
  try {
    const rows = await db
      .select()
      .from(themeSettings)
      .where(eq(themeSettings.id, "singleton"))
      .limit(1);
    const row = rows[0];
    if (!row) return DEFAULT_THEME;
    const fonts = (row.fonts as Partial<ThemeFonts>) ?? {};
    return {
      colors: normalizeColors(row.colors),
      fonts: { ...DEFAULT_THEME.fonts, ...fonts },
      borderRadius: row.borderRadius ?? DEFAULT_THEME.borderRadius,
      customCss: row.customCss,
    };
  } catch {
    return DEFAULT_THEME;
  }
}

export async function loadSiteSettings() {
  "use cache";
  cacheTag(SITE_TAG);
  cacheLife("max");
  try {
    const rows = await db
      .select()
      .from(siteSettings)
      .where(eq(siteSettings.id, "singleton"))
      .limit(1);
    return rows[0] ?? DEFAULT_SITE;
  } catch {
    return DEFAULT_SITE;
  }
}

type SiteSettingsPatch = {
  name?: string;
  tagline?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  googleOauthEnabled?: boolean;
  companyName?: string | null;
  companyAddress?: string | null;
  contactPhone?: string | null;
  supportEmail?: string | null;
};

export async function upsertSiteSettings(patch: SiteSettingsPatch) {
  const existing = await db
    .select()
    .from(siteSettings)
    .where(eq(siteSettings.id, "singleton"))
    .limit(1);
  if (existing[0]) {
    await db
      .update(siteSettings)
      .set({ ...patch, updatedAt: new Date() })
      .where(eq(siteSettings.id, "singleton"));
  } else {
    await db.insert(siteSettings).values({
      id: "singleton",
      name: patch.name ?? "CourseMaker",
      tagline: patch.tagline ?? null,
      logoUrl: patch.logoUrl ?? null,
      faviconUrl: patch.faviconUrl ?? null,
      googleOauthEnabled: patch.googleOauthEnabled ?? false,
      companyName: patch.companyName ?? null,
      companyAddress: patch.companyAddress ?? null,
      contactPhone: patch.contactPhone ?? null,
      supportEmail: patch.supportEmail ?? null,
    });
  }
}

type ThemePatch = {
  colors?: {
    light?: Partial<ThemeColors>;
    dark?: Partial<ThemeColors>;
  };
  fonts?: Partial<ThemeFonts>;
  borderRadius?: string;
  customCss?: string | null;
};

export async function upsertTheme(patch: ThemePatch) {
  const current = await loadThemeUncached();
  const nextColors: ThemePalettes = {
    light: { ...current.colors.light, ...(patch.colors?.light ?? {}) },
    dark: { ...current.colors.dark, ...(patch.colors?.dark ?? {}) },
  };
  const nextFonts = { ...current.fonts, ...(patch.fonts ?? {}) };
  const existing = await db
    .select()
    .from(themeSettings)
    .where(eq(themeSettings.id, "singleton"))
    .limit(1);
  const payload = {
    colors: nextColors,
    fonts: nextFonts,
    borderRadius: patch.borderRadius ?? current.borderRadius,
    customCss:
      patch.customCss !== undefined ? patch.customCss : current.customCss,
    updatedAt: new Date(),
  };
  if (existing[0]) {
    await db
      .update(themeSettings)
      .set(payload)
      .where(eq(themeSettings.id, "singleton"));
  } else {
    await db.insert(themeSettings).values({ id: "singleton", ...payload });
  }
}

async function loadThemeUncached(): Promise<ResolvedTheme> {
  const rows = await db
    .select()
    .from(themeSettings)
    .where(eq(themeSettings.id, "singleton"))
    .limit(1);
  const row = rows[0];
  if (!row) return DEFAULT_THEME;
  const fonts = (row.fonts as Partial<ThemeFonts>) ?? {};
  return {
    colors: normalizeColors(row.colors),
    fonts: { ...DEFAULT_THEME.fonts, ...fonts },
    borderRadius: row.borderRadius ?? DEFAULT_THEME.borderRadius,
    customCss: row.customCss,
  };
}

export { loadThemeUncached };

function paletteVars(c: ThemeColors): string {
  return `--paper: ${c.bg};
  --paper-2: ${c.surface};
  --ink: ${c.fg};
  --ink-3: ${c.mutedFg};
  --hair: ${c.border};
  --pink: ${c.primary};
  --magenta: ${c.accent};
  --terracotta: ${c.primary};
  --terracotta-deep: ${c.accent};
  --brand-grad: linear-gradient(90deg, ${c.primary} 0%, ${c.accent} 100%);
  --cm-bg: ${c.bg};
  --cm-fg: ${c.fg};
  --cm-surface: ${c.surface};
  --cm-muted-fg: ${c.mutedFg};
  --cm-border: ${c.border};
  --cm-primary: ${c.primary};
  --cm-primary-fg: ${c.primaryFg};
  --cm-accent: ${c.accent};
  --cm-accent-fg: ${c.accentFg};`;
}

export function themeToCssVars(theme: ResolvedTheme): string {
  const f = theme.fonts;
  const heading = f.heading ?? f.sans;
  const mono = f.mono ?? "ui-monospace, monospace";
  const fontAndRadius = `--sans: ${f.sans};
  --serif: ${heading};
  --mono: ${mono};
  --radius: ${theme.borderRadius};
  --cm-radius: ${theme.borderRadius};
  --cm-font-sans: ${f.sans};
  --cm-font-heading: ${heading};
  --cm-font-mono: ${mono};`;
  return `:root {
  ${paletteVars(theme.colors.light)}
  ${fontAndRadius}
  color-scheme: light;
}
:root[data-theme="dark"] {
  ${paletteVars(theme.colors.dark)}
  color-scheme: dark;
}`;
}
