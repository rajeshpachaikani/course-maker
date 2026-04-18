"use client";

import { useState, useTransition } from "react";
import { TiptapEditor, type JSONContent } from "@/components/tiptap-editor";
import { VideoUpload } from "./video-upload";
import {
  updateLessonAction,
  updateLessonDescriptionAction,
  updateLessonVideoAction,
} from "../../../../../actions";

interface LessonData {
  id: string;
  title: string;
  slug: string;
  isFreePreview: boolean;
  bunnyVideoId: string | null;
  durationSec: number | null;
  descriptionTiptap: unknown;
}

export function LessonEditor({
  courseId,
  moduleId: _moduleId,
  lesson,
}: {
  courseId: string;
  moduleId: string;
  lesson: LessonData;
}) {
  const [pending, start] = useTransition();
  const [metaMessage, setMetaMessage] = useState<string | null>(null);
  const [description, setDescription] = useState<JSONContent | null>(
    (lesson.descriptionTiptap as JSONContent) ?? null,
  );
  const [descSaving, setDescSaving] = useState(false);
  const [descMessage, setDescMessage] = useState<string | null>(null);
  const [videoId, setVideoId] = useState<string | null>(lesson.bunnyVideoId);
  const [duration, setDuration] = useState<number | null>(lesson.durationSec);

  function onMetaSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    start(async () => {
      setMetaMessage(null);
      try {
        await updateLessonAction(fd);
        setMetaMessage("Saved.");
      } catch (err) {
        setMetaMessage(err instanceof Error ? err.message : "Save failed");
      }
    });
  }

  async function saveDescription() {
    setDescSaving(true);
    setDescMessage(null);
    try {
      await updateLessonDescriptionAction(courseId, lesson.id, description);
      setDescMessage("Saved.");
    } catch (err) {
      setDescMessage(err instanceof Error ? err.message : "Save failed");
    } finally {
      setDescSaving(false);
    }
  }

  async function onVideoComplete(
    newVideoId: string,
    newDuration: number | null,
  ) {
    setVideoId(newVideoId);
    setDuration(newDuration);
    await updateLessonVideoAction(
      courseId,
      lesson.id,
      newVideoId,
      newDuration,
    );
  }

  async function onVideoRemove() {
    setVideoId(null);
    setDuration(null);
    await updateLessonVideoAction(courseId, lesson.id, null, null);
  }

  return (
    <div className="flex flex-col gap-6">
      <form
        onSubmit={onMetaSubmit}
        className="flex flex-col gap-4 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6"
      >
        <h2 className="text-lg font-semibold">Lesson details</h2>
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="id" value={lesson.id} />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Title</span>
            <input
              type="text"
              name="title"
              defaultValue={lesson.title}
              required
              className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium">Slug</span>
            <input
              type="text"
              name="slug"
              defaultValue={lesson.slug}
              required
              className="rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-bg)] px-3 py-2 text-sm font-mono"
            />
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="isFreePreview"
            defaultChecked={lesson.isFreePreview}
          />
          <span>Free preview (visible to non-enrolled visitors)</span>
        </label>
        <div className="flex items-center gap-3">
          <button type="submit" disabled={pending} className="cf-btn-primary">
            {pending ? "Saving…" : "Save details"}
          </button>
          {metaMessage ? (
            <span className="text-sm text-[var(--cf-muted-fg)]">{metaMessage}</span>
          ) : null}
        </div>
      </form>

      <section className="flex flex-col gap-3 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6">
        <div>
          <h2 className="text-lg font-semibold">Video</h2>
          <p className="text-sm text-[var(--cf-muted-fg)]">
            Upload to Bunny Stream. Embeds are server-signed per session.
          </p>
        </div>
        <VideoUpload
          lessonId={lesson.id}
          currentVideoId={videoId}
          currentDurationSec={duration}
          onComplete={onVideoComplete}
          onRemove={onVideoRemove}
        />
      </section>

      <section className="flex flex-col gap-3 rounded-[var(--cf-radius)] border border-[var(--cf-border)] bg-[var(--cf-surface)] p-6">
        <div>
          <h2 className="text-lg font-semibold">Notes</h2>
          <p className="text-sm text-[var(--cf-muted-fg)]">
            Text shown beneath the video.
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
            {descSaving ? "Saving…" : "Save notes"}
          </button>
          {descMessage ? (
            <span className="text-sm text-[var(--cf-muted-fg)]">{descMessage}</span>
          ) : null}
        </div>
      </section>
    </div>
  );
}
