"use client";

import { useState, useTransition } from "react";
import { TiptapEditor, type JSONContent } from "@/components/tiptap-editor";
import {
  updateCourseAction,
  updateCourseDescriptionAction,
} from "../actions";

interface CourseMetaFormProps {
  course: {
    id: string;
    title: string;
    slug: string;
    subtitle: string | null;
    coverImageUrl: string | null;
    priceCents: number;
    currency: string;
    isFree: boolean;
    published: boolean;
    descriptionTiptap: unknown;
  };
}

export function CourseMetaForm({ course }: CourseMetaFormProps) {
  const [pending, start] = useTransition();
  const [descSaving, setDescSaving] = useState(false);
  const [descMessage, setDescMessage] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [description, setDescription] = useState<JSONContent | null>(
    (course.descriptionTiptap as JSONContent) ?? null,
  );

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      setMessage(null);
      try {
        await updateCourseAction(fd);
        setMessage("Saved.");
      } catch (err) {
        setMessage(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  async function saveDescription() {
    setDescSaving(true);
    setDescMessage(null);
    try {
      await updateCourseDescriptionAction(course.id, description);
      setDescMessage("Saved.");
    } catch (err) {
      setDescMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setDescSaving(false);
    }
  }

  return (
    <>
      <form
        onSubmit={onSubmit}
        className="card"
        style={{
          background: "var(--paper-2)",
          border: "1px solid var(--hair)",
          borderRadius: "var(--radius-lg)",
          padding: 22,
          marginBottom: 16,
        }}
      >
        <div className="mono-label" style={{ marginBottom: 12 }}>
          — Course details
        </div>
        <input type="hidden" name="id" value={course.id} />

        {course.coverImageUrl ? (
          <div
            style={{
              aspectRatio: "16/10",
              marginBottom: 14,
              borderRadius: 10,
              overflow: "hidden",
              background: "var(--paper-3)",
              backgroundImage: `url(${course.coverImageUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ) : (
          <div
            className="bg-pink-grad"
            style={{
              aspectRatio: "16/10",
              marginBottom: 14,
              borderRadius: 10,
              display: "grid",
              placeItems: "center",
              fontFamily: "var(--serif)",
              fontStyle: "italic",
              fontSize: 70,
              color: "oklch(1 0 0 / 0.2)",
              position: "relative",
            }}
          >
            {course.title.charAt(0).toUpperCase()}
          </div>
        )}

        <div className="field">
          <label>TITLE</label>
          <input type="text" name="title" defaultValue={course.title} required />
        </div>
        <div className="field">
          <label>SLUG</label>
          <input type="text" name="slug" defaultValue={course.slug} required />
        </div>
        <div className="field">
          <label>SUBTITLE</label>
          <input
            type="text"
            name="subtitle"
            defaultValue={course.subtitle ?? ""}
          />
        </div>
        <div className="field">
          <label>COVER IMAGE URL</label>
          <input
            type="url"
            name="coverImageUrl"
            defaultValue={course.coverImageUrl ?? ""}
            placeholder="https://…/cover.jpg"
          />
        </div>
        <div className="field-row">
          <div className="field">
            <label>PRICE (CENTS)</label>
            <input
              type="number"
              name="priceCents"
              defaultValue={String(course.priceCents)}
              min={0}
            />
          </div>
          <div className="field">
            <label>CURRENCY</label>
            <input
              type="text"
              name="currency"
              defaultValue={course.currency}
              required
            />
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            padding: "10px 0",
            borderTop: "1px dotted var(--hair-2)",
            marginBottom: 14,
          }}
        >
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "var(--ink)",
            }}
          >
            <input
              type="checkbox"
              name="isFree"
              defaultChecked={course.isFree}
            />
            <span>Free course</span>
          </label>
          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              fontSize: 13,
              color: "var(--ink)",
            }}
          >
            <input
              type="checkbox"
              name="published"
              defaultChecked={course.published}
            />
            <span>Published · visible in storefront</span>
          </label>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            type="submit"
            disabled={pending}
            className="btn btn-primary"
          >
            {pending ? "Saving…" : "Save details"}
          </button>
          {message ? (
            <span className="mono-label" style={{ fontSize: 11 }}>
              {message}
            </span>
          ) : null}
        </div>
      </form>

      <section
        className="card"
        style={{
          background: "var(--paper-2)",
          border: "1px solid var(--hair)",
          borderRadius: "var(--radius-lg)",
          padding: 22,
        }}
      >
        <div className="mono-label" style={{ marginBottom: 6 }}>
          — Sales page description
        </div>
        <p
          style={{
            fontSize: 12.5,
            color: "var(--ink-3)",
            margin: "0 0 12px",
          }}
        >
          Rich text rendered on the public course page.
        </p>
        <TiptapEditor value={description} onChange={setDescription} />
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            marginTop: 12,
          }}
        >
          <button
            type="button"
            onClick={saveDescription}
            disabled={descSaving}
            className="btn btn-ink"
          >
            {descSaving ? "Saving…" : "Save description"}
          </button>
          {descMessage ? (
            <span className="mono-label" style={{ fontSize: 11 }}>
              {descMessage}
            </span>
          ) : null}
        </div>
      </section>
    </>
  );
}
