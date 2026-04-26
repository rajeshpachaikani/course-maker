import { connection } from "next/server";
import { TiptapRender } from "@/components/tiptap-render";
import { loadLegalPage } from "@/lib/legal";
import { LegalShell } from "../legal-shell";

export const metadata = { title: "Cancellation & Refund Policy" };

export default async function RefundPage() {
  await connection();
  const page = await loadLegalPage("refund");
  return (
    <LegalShell title={page.title} kicker="Refund" updatedAt={page.updatedAt}>
      <TiptapRender doc={page.bodyTiptap as never} />
    </LegalShell>
  );
}
