import { connection } from "next/server";
import { requireAdmin } from "@/lib/dal";
import { loadTheme } from "@/lib/theme";
import { AppearanceForm } from "./appearance-form";

export const metadata = { title: "Appearance" };

export default async function AdminAppearancePage() {
  await connection();
  await requireAdmin();
  const theme = await loadTheme();
  return (
    <>
      <div className="admin-header">
        <div>
          <h1>Theme & brand</h1>
          <div className="admin-header-sub">
            — Colors, typography, radius, custom CSS
          </div>
        </div>
      </div>

      <div className="admin-section">
        <AppearanceForm initial={theme} />
      </div>
    </>
  );
}
