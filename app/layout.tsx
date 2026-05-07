import type { Metadata } from "next";
import { Suspense } from "react";
import { cacheTag } from "next/cache";
import "./globals.css";
import {
  loadTheme,
  loadSiteSettings,
  themeToCssVars,
  THEME_TAG,
} from "@/lib/theme";

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
  cacheTag(THEME_TAG);
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

const THEME_INIT_SCRIPT = `(function(){try{var s=localStorage.getItem('cm-theme');var m=s==='light'||s==='dark'?s:(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=m;}catch(e){document.documentElement.dataset.theme='dark';}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <Suspense>
          <ThemeStyle />
        </Suspense>
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
