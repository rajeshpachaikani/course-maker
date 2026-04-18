import { notFound } from "next/navigation";
import { Render, type Data } from "@measured/puck";
import { getPublishedPageBySlug } from "@/lib/pages";
import { loadSiteSettings } from "@/lib/theme";
import { buildPuckConfig } from "@/components/puck/config";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await getPublishedPageBySlug(slug);
  if (!page) return { title: "Not found" };
  return { title: page.title ?? page.slug };
}

export default async function PublicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [page, site] = await Promise.all([
    getPublishedPageBySlug(slug),
    loadSiteSettings(),
  ]);
  if (!page) notFound();
  const config = buildPuckConfig({ rawHtmlEnabled: site.rawHtmlBlockEnabled });
  const data = (page.puckData as Data | null) ?? { content: [], root: {} };
  return (
    <main className="cf-page">
      <Render config={config} data={data} />
    </main>
  );
}
