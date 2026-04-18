import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { loadTheme, loadSiteSettings, themeToCssVars } from "@/lib/theme";

export async function generateMetadata(): Promise<Metadata> {
  const site = await loadSiteSettings();
  return {
    title: {
      default: site.name,
      template: `%s · ${site.name}`,
    },
    description: site.tagline ?? "Learn at your own pace.",
    icons: site.faviconUrl ? [{ url: site.faviconUrl }] : undefined,
  };
}

async function ThemeStyle() {
  "use cache";
  const theme = await loadTheme();
  const css = themeToCssVars(theme);
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {theme.customCss ? (
        <style dangerouslySetInnerHTML={{ __html: theme.customCss }} />
      ) : null}
    </>
  );
}

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <Suspense>
          <ThemeStyle />
        </Suspense>
      </head>
      <body className="min-h-full flex flex-col bg-[var(--cf-bg)] text-[var(--cf-fg)]">
        {children}
      </body>
    </html>
  );
}
