"use server";

import { updateTag } from "next/cache";
import { requireAdmin } from "@/lib/dal";
import { upsertTheme, THEME_TAG, type ThemeColors } from "@/lib/theme";

const COLOR_KEYS: Array<keyof ThemeColors> = [
  "bg",
  "fg",
  "surface",
  "mutedFg",
  "border",
  "primary",
  "primaryFg",
  "accent",
  "accentFg",
];

const COLOR_RE =
  /^(#([0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})|(rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\([^()]*\)|[a-zA-Z]+)$/;

function readColor(formData: FormData, name: string): string | null {
  const v = formData.get(name);
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  if (t.length > 200 || /[\r\n;{}]/.test(t)) {
    throw new Error(`Invalid color for ${name}`);
  }
  if (!COLOR_RE.test(t)) {
    throw new Error(`Invalid color for ${name}`);
  }
  return t;
}

function readText(formData: FormData, name: string): string | null {
  const v = formData.get(name);
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

export async function saveThemeAction(formData: FormData) {
  await requireAdmin();

  const colors: Partial<ThemeColors> = {};
  for (const key of COLOR_KEYS) {
    const v = readColor(formData, `colors.${key}`);
    if (v) colors[key] = v;
  }

  const fonts = {
    sans: readText(formData, "fonts.sans") ?? undefined,
    heading: readText(formData, "fonts.heading") ?? undefined,
    mono: readText(formData, "fonts.mono") ?? undefined,
  };

  const radiusRaw = formData.get("borderRadius");
  const radiusNum =
    typeof radiusRaw === "string" ? Number.parseFloat(radiusRaw) : NaN;
  const borderRadius = Number.isFinite(radiusNum)
    ? `${radiusNum}rem`
    : undefined;

  const customCssRaw = formData.get("customCss");
  const customCss =
    typeof customCssRaw === "string"
      ? customCssRaw.length > 0
        ? customCssRaw
        : null
      : undefined;

  await upsertTheme({
    colors,
    fonts: {
      ...(fonts.sans ? { sans: fonts.sans } : {}),
      ...(fonts.heading ? { heading: fonts.heading } : {}),
      ...(fonts.mono ? { mono: fonts.mono } : {}),
    },
    ...(borderRadius ? { borderRadius } : {}),
    ...(customCss !== undefined ? { customCss } : {}),
  });

  updateTag(THEME_TAG);
}
