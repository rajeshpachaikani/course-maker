import { loadTheme } from "@/lib/theme";
import { AppearanceForm } from "./appearance-form";

export const metadata = { title: "Appearance" };

export default async function AdminAppearancePage() {
  const theme = await loadTheme();
  return (
    <div className="flex flex-col gap-6 max-w-4xl">
      <header>
        <h1 className="text-2xl font-semibold">Appearance</h1>
        <p className="text-sm text-[var(--cf-muted-fg)]">
          Colors, fonts, radius, and custom CSS. Changes are applied across the
          public site and dashboard on next page load.
        </p>
      </header>
      <AppearanceForm initial={theme} />
    </div>
  );
}
