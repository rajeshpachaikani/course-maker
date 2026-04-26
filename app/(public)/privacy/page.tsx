import { TiptapRender } from "@/components/tiptap-render";
import { loadLegalPage } from "@/lib/legal";
import { LegalShell } from "../legal-shell";

export const metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const page = await loadLegalPage("privacy");
  return (
    <LegalShell
      title={page.title}
      kicker="Privacy"
      updatedAt={page.updatedAt}
    >
      <TiptapRender doc={page.bodyTiptap as never} />
    </LegalShell>
  );
}
