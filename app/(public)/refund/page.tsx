import { Suspense } from "react";
import { connection } from "next/server";
import { PublicTopbar } from "@/components/public-topbar";
import { TiptapRender } from "@/components/tiptap-render";
import { loadLegalPage } from "@/lib/legal";
import { LegalArticle, LegalSkeleton } from "../legal-shell";

export const metadata = { title: "Cancellation & Refund Policy" };

const KICKER = "Refund";
const TITLE = "Cancellation & Refund Policy";

export default function RefundPage() {
  return (
    <div className="student-root">
      <PublicTopbar />
      <Suspense fallback={<LegalSkeleton kicker={KICKER} title={TITLE} />}>
        <RefundBody />
      </Suspense>
    </div>
  );
}

async function RefundBody() {
  await connection();
  const page = await loadLegalPage("refund");
  return (
    <LegalArticle title={page.title} kicker={KICKER} updatedAt={page.updatedAt}>
      <TiptapRender doc={page.bodyTiptap as never} />
    </LegalArticle>
  );
}
