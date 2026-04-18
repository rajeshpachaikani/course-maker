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
    <div className="flex flex-col gap-6">
      <form
        onSubmit={onSubmit}
        className="flex flex-col gap-4 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6"
      >
        <h2 className="text-lg font-semibold">Details</h2>
        <input type="hidden" name="id" value={course.id} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Field
            label="Title"
            name="title"
            defaultValue={course.title}
            required
          />
          <Field
            label="Slug"
            name="slug"
            defaultValue={course.slug}
            required
          />
        </div>
        <Field
          label="Subtitle"
          name="subtitle"
          defaultValue={course.subtitle ?? ""}
        />
        <Field
          label="Cover image URL"
          name="coverImageUrl"
          defaultValue={course.coverImageUrl ?? ""}
          placeholder="https://…/cover.jpg"
        />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Field
            label="Price (cents)"
            name="priceCents"
            type="number"
            defaultValue={String(course.priceCents)}
            min={0}
          />
          <Field
            label="Currency"
            name="currency"
            defaultValue={course.currency}
            required
          />
          <div className="flex flex-col gap-2 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="isFree"
                defaultChecked={course.isFree}
              />
              <span>Free course</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="published"
                defaultChecked={course.published}
              />
              <span>Published</span>
            </label>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="cf-btn-primary">
            {pending ? "Saving…" : "Save details"}
          </button>
          {message ? (
            <span className="text-sm text-[var(--cf-muted-fg)]">{message}</span>
          ) : null}
        </div>
      </form>

      <section className="flex flex-col gap-3 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6">
        <div>
          <h2 className="text-lg font-semibold">Description</h2>
          <p className="text-sm text-[var(--cf-muted-fg)]">
            Rich text rendered on the course sales page.
          </p>
        </div>
        <TiptapEditor value={description} onChange={setDescription} />
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={saveDescription}
            disabled={descSaving}
            className="cf-btn-primary"
          >
            {descSaving ? "Saving…" : "Save description"}
          </button>
          {descMessage ? (
            <span className="text-sm text-[var(--cf-muted-fg)]">
              {descMessage}
            </span>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  type = "text",
  min,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "number";
  min?: number;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium">{label}</span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        min={min}
        className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm"
      />
    </label>
  );
}
