import { TiptapRender } from "@/components/tiptap-render";
import { loadLegalPage } from "@/lib/legal";
import { LegalShell } from "../legal-shell";

export const metadata = { title: "Terms of Service" };

export default async function TermsPage() {
  const page = await loadLegalPage("terms");
  return (
    <LegalShell title={page.title} kicker="Terms" updatedAt={page.updatedAt}>
      <TiptapRender doc={page.bodyTiptap as never} />
    </LegalShell>
  );
}
