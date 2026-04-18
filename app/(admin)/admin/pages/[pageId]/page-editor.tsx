"use client";

import { useMemo, useState, useTransition } from "react";
import { Puck, type Data } from "@measured/puck";
import { buildPuckConfig } from "@/components/puck/config";
import { savePageAction } from "../actions";

const EMPTY_DATA: Data = { content: [], root: {} };

export function PageEditor({
  page,
  rawHtmlEnabled,
}: {
  page: {
    id: string;
    title: string | null;
    slug: string;
    published: boolean;
    puckData: unknown;
  };
  rawHtmlEnabled: boolean;
}) {
  const config = useMemo(
    () => buildPuckConfig({ rawHtmlEnabled }),
    [rawHtmlEnabled],
  );
  const [title, setTitle] = useState(page.title ?? "");
  const [slug, setSlug] = useState(page.slug);
  const [published, setPublished] = useState(page.published);
  const [data, setData] = useState<Data>(
    (page.puckData as Data | null) ?? EMPTY_DATA,
  );
  const [pending, start] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  function save(nextData?: Data, nextPublished?: boolean) {
    const payloadData = nextData ?? data;
    const payloadPublished = nextPublished ?? published;
    start(async () => {
      setMessage(null);
      try {
        await savePageAction(page.id, {
          title: title.trim().length ? title.trim() : page.slug,
          slug,
          puckData: payloadData,
          published: payloadPublished,
        });
        setMessage("Saved.");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end gap-3 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-4">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Slug</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => {
              setPublished(e.target.checked);
              save(undefined, e.target.checked);
            }}
          />
          <span>Published</span>
        </label>
        <button
          type="button"
          onClick={() => save()}
          disabled={pending}
          className="cf-btn-primary"
        >
          {pending ? "Saving…" : "Save"}
        </button>
        {message ? (
          <span className="text-sm text-[var(--cf-muted-fg)]">{message}</span>
        ) : null}
      </div>

      <div className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] overflow-hidden">
        <Puck
          config={config}
          data={data}
          onChange={setData}
          onPublish={(d) => save(d, true)}
        />
      </div>
    </div>
  );
}
