"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { JSONContent } from "@tiptap/core";
import { useEffect } from "react";

export type { JSONContent };

export function TiptapEditor({
  value,
  onChange,
  placeholder,
}: {
  value: JSONContent | null;
  onChange: (doc: JSONContent) => void;
  placeholder?: string;
}) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
    ],
    content: value ?? undefined,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm max-w-none min-h-[160px] px-3 py-2 focus:outline-none",
        "data-placeholder": placeholder ?? "Write something…",
      },
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getJSON() as JSONContent);
    },
  });

  useEffect(() => {
    return () => {
      editor?.destroy();
    };
  }, [editor]);

  if (!editor) {
    return (
      <div className="rounded-[var(--cm-radius)] border border-[var(--cm-border)] bg-[var(--cm-surface)] min-h-[200px]" />
    );
  }

  return (
    <div className="rounded-[var(--cm-radius)] border border-[var(--cm-border)] bg-[var(--cm-surface)]">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const btn = (active: boolean) =>
    `px-2 py-1 text-xs rounded border ${
      active
        ? "bg-[var(--cm-primary)] text-[var(--cm-primary-fg)] border-[var(--cm-primary)]"
        : "border-[var(--cm-border)] text-[var(--cm-fg)] hover:bg-[var(--cm-bg)]"
    }`;
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-[var(--cm-border)] p-2">
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={btn(editor.isActive("bold"))}
      >
        Bold
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={btn(editor.isActive("italic"))}
      >
        Italic
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={btn(editor.isActive("strike"))}
      >
        Strike
      </button>
      <span className="mx-1 h-4 w-px bg-[var(--cm-border)]" />
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 1 }).run()
        }
        className={btn(editor.isActive("heading", { level: 1 }))}
      >
        H1
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        className={btn(editor.isActive("heading", { level: 2 }))}
      >
        H2
      </button>
      <button
        type="button"
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        className={btn(editor.isActive("heading", { level: 3 }))}
      >
        H3
      </button>
      <span className="mx-1 h-4 w-px bg-[var(--cm-border)]" />
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={btn(editor.isActive("bulletList"))}
      >
        • List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={btn(editor.isActive("orderedList"))}
      >
        1. List
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={btn(editor.isActive("blockquote"))}
      >
        Quote
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
        className={btn(editor.isActive("codeBlock"))}
      >
        Code
      </button>
      <span className="mx-1 h-4 w-px bg-[var(--cm-border)]" />
      <button
        type="button"
        onClick={() => {
          const prev = editor.getAttributes("link").href as string | undefined;
          const url = window.prompt("URL", prev ?? "https://");
          if (url === null) return;
          if (url === "") {
            editor.chain().focus().extendMarkRange("link").unsetLink().run();
            return;
          }
          editor
            .chain()
            .focus()
            .extendMarkRange("link")
            .setLink({ href: url })
            .run();
        }}
        className={btn(editor.isActive("link"))}
      >
        Link
      </button>
      <span className="flex-1" />
      <button
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className={btn(false)}
      >
        Undo
      </button>
      <button
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className={btn(false)}
      >
        Redo
      </button>
    </div>
  );
}
