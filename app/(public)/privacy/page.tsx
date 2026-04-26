import { Suspense } from "react";
import { connection } from "next/server";
import { PublicTopbar } from "@/components/public-topbar";
import { TiptapRender } from "@/components/tiptap-render";
import { loadLegalPage } from "@/lib/legal";
import { LegalArticle, LegalSkeleton } from "../legal-shell";

export const metadata = { title: "Privacy Policy" };

const KICKER = "Privacy";
const TITLE = "Privacy Policy";

export default function PrivacyPage() {
  return (
    <div className="student-root">
      <PublicTopbar />
      <Suspense fallback={<LegalSkeleton kicker={KICKER} title={TITLE} />}>
        <PrivacyBody />
      </Suspense>
    </div>
  );
}

async function PrivacyBody() {
  await connection();
  const page = await loadLegalPage("privacy");
  return (
    <LegalArticle title={page.title} kicker={KICKER} updatedAt={page.updatedAt}>
      <TiptapRender doc={page.bodyTiptap as never} />
    </LegalArticle>
  );
}
