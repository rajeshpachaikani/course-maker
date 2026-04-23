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

export interface ResolvedTheme {
  colors: ThemeColors;
  fonts: ThemeFonts;
  borderRadius: string;
  customCss: string | null;
}

const DEFAULT_THEME: ResolvedTheme = {
  colors: {
    bg: "oklch(0.16 0.025 300)",
    fg: "oklch(0.98 0.005 300)",
    surface: "oklch(0.20 0.03 300)",
    mutedFg: "oklch(0.60 0.02 300)",
    border: "oklch(0.28 0.03 300)",
    primary: "oklch(0.72 0.28 355)",
    primaryFg: "oklch(1 0 0)",
    accent: "oklch(0.58 0.3 340)",
    accentFg: "oklch(1 0 0)",
  },
  fonts: {
    sans: "'Plus Jakarta Sans', 'Inter', system-ui, sans-serif",
    heading: "'Poppins', 'Plus Jakarta Sans', system-ui, sans-serif",
    mono: "'JetBrains Mono', 'SF Mono', Menlo, monospace",
  },
  borderRadius: "10px",
  customCss: null,
};

const DEFAULT_SITE = {
  id: "singleton" as const,
  name: "CourseForge",
  tagline: null as string | null,
  logoUrl: null as string | null,
  faviconUrl: null as string | null,
  googleOauthEnabled: false,
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
    const colors = (row.colors as Partial<ThemeColors>) ?? {};
    const fonts = (row.fonts as Partial<ThemeFonts>) ?? {};
    return {
      colors: { ...DEFAULT_THEME.colors, ...colors },
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
      name: patch.name ?? "CourseForge",
      tagline: patch.tagline ?? null,
      logoUrl: patch.logoUrl ?? null,
      faviconUrl: patch.faviconUrl ?? null,
      googleOauthEnabled: patch.googleOauthEnabled ?? false,
    });
  }
}

type ThemePatch = {
  colors?: Partial<ThemeColors>;
  fonts?: Partial<ThemeFonts>;
  borderRadius?: string;
  customCss?: string | null;
};

export async function upsertTheme(patch: ThemePatch) {
  const current = await loadThemeUncached();
  const nextColors = { ...current.colors, ...(patch.colors ?? {}) };
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
  const colors = (row.colors as Partial<ThemeColors>) ?? {};
  const fonts = (row.fonts as Partial<ThemeFonts>) ?? {};
  return {
    colors: { ...DEFAULT_THEME.colors, ...colors },
    fonts: { ...DEFAULT_THEME.fonts, ...fonts },
    borderRadius: row.borderRadius ?? DEFAULT_THEME.borderRadius,
    customCss: row.customCss,
  };
}

export { loadThemeUncached };

export function themeToCssVars(theme: ResolvedTheme): string {
  const c = theme.colors;
  const f = theme.fonts;
  return `:root {
  --cf-bg: ${c.bg};
  --cf-fg: ${c.fg};
  --cf-surface: ${c.surface};
  --cf-muted-fg: ${c.mutedFg};
  --cf-border: ${c.border};
  --cf-primary: ${c.primary};
  --cf-primary-fg: ${c.primaryFg};
  --cf-accent: ${c.accent};
  --cf-accent-fg: ${c.accentFg};
  --cf-radius: ${theme.borderRadius};
  --cf-font-sans: ${f.sans};
  --cf-font-heading: ${f.heading ?? f.sans};
  --cf-font-mono: ${f.mono ?? "ui-monospace, monospace"};
}`;
}
