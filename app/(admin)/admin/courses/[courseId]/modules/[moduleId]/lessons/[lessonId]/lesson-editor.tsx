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

const CARD_STYLE: React.CSSProperties = {
  background: "var(--paper-2)",
  border: "1px solid var(--hair)",
  borderRadius: "var(--radius-lg)",
  padding: 22,
};

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
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <form onSubmit={onMetaSubmit} className="card" style={CARD_STYLE}>
        <div className="mono-label" style={{ marginBottom: 12 }}>
          — Lesson details
        </div>
        <input type="hidden" name="courseId" value={courseId} />
        <input type="hidden" name="id" value={lesson.id} />
        <div className="field-row">
          <div className="field">
            <label>TITLE</label>
            <input
              type="text"
              name="title"
              defaultValue={lesson.title}
              required
            />
          </div>
          <div className="field">
            <label>SLUG</label>
            <input
              type="text"
              name="slug"
              defaultValue={lesson.slug}
              required
              style={{ fontFamily: "var(--mono)" }}
            />
          </div>
        </div>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            fontSize: 13,
            color: "var(--ink)",
            padding: "10px 0",
            borderTop: "1px dotted var(--hair-2)",
            marginBottom: 12,
          }}
        >
          <input
            type="checkbox"
            name="isFreePreview"
            defaultChecked={lesson.isFreePreview}
          />
          <span>Free preview · visible to non-enrolled visitors</span>
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="submit" disabled={pending} className="btn btn-primary">
            {pending ? "Saving…" : "Save details"}
          </button>
          {metaMessage ? (
            <span className="mono-label" style={{ fontSize: 11 }}>
              {metaMessage}
            </span>
          ) : null}
        </div>
      </form>

      <section className="card" style={CARD_STYLE}>
        <div className="mono-label" style={{ marginBottom: 6 }}>
          — Video · Bunny Stream
        </div>
        <p
          style={{
            fontSize: 12.5,
            color: "var(--ink-3)",
            margin: "0 0 14px",
          }}
        >
          Upload to Bunny Stream. Embeds server-signed per session.
        </p>
        <VideoUpload
          lessonId={lesson.id}
          currentVideoId={videoId}
          currentDurationSec={duration}
          onComplete={onVideoComplete}
          onRemove={onVideoRemove}
        />
      </section>

      <section className="card" style={CARD_STYLE}>
        <div className="mono-label" style={{ marginBottom: 6 }}>
          — Notes
        </div>
        <p
          style={{
            fontSize: 12.5,
            color: "var(--ink-3)",
            margin: "0 0 12px",
          }}
        >
          Text shown beneath the video.
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
            {descSaving ? "Saving…" : "Save notes"}
          </button>
          {descMessage ? (
            <span className="mono-label" style={{ fontSize: 11 }}>
              {descMessage}
            </span>
          ) : null}
        </div>
      </section>
    </div>
  );
}
