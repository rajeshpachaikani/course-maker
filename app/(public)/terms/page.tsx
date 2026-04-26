import { Suspense } from "react";
import { connection } from "next/server";
import { PublicTopbar } from "@/components/public-topbar";
import { TiptapRender } from "@/components/tiptap-render";
import { loadLegalPage } from "@/lib/legal";
import { LegalArticle, LegalSkeleton } from "../legal-shell";

export const metadata = { title: "Terms of Service" };

const KICKER = "Terms";
const TITLE = "Terms of Service";

export default function TermsPage() {
  return (
    <div className="student-root">
      <PublicTopbar />
      <Suspense fallback={<LegalSkeleton kicker={KICKER} title={TITLE} />}>
        <TermsBody />
      </Suspense>
    </div>
  );
}

async function TermsBody() {
  await connection();
  const page = await loadLegalPage("terms");
  return (
    <LegalArticle title={page.title} kicker={KICKER} updatedAt={page.updatedAt}>
      <TiptapRender doc={page.bodyTiptap as never} />
    </LegalArticle>
  );
}
