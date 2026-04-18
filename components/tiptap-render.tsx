import type { JSX } from "react";

type Mark = { type: string; attrs?: Record<string, unknown> };

interface Node {
  type: string;
  attrs?: Record<string, unknown>;
  content?: Node[];
  text?: string;
  marks?: Mark[];
}

export function TiptapRender({ doc }: { doc: Node | null | undefined }) {
  if (!doc || typeof doc !== "object") return null;
  return <>{renderNode(doc, "root")}</>;
}

function renderNode(node: Node, key: React.Key): JSX.Element | string | null {
  switch (node.type) {
    case "doc":
      return <div key={key}>{renderChildren(node)}</div>;
    case "paragraph":
      return <p key={key}>{renderChildren(node)}</p>;
    case "heading": {
      const level = Number((node.attrs?.level as number) ?? 2);
      const Tag = (`h${Math.min(Math.max(level, 1), 6)}` as keyof JSX.IntrinsicElements);
      return <Tag key={key}>{renderChildren(node)}</Tag>;
    }
    case "bulletList":
      return <ul key={key}>{renderChildren(node)}</ul>;
    case "orderedList":
      return <ol key={key}>{renderChildren(node)}</ol>;
    case "listItem":
      return <li key={key}>{renderChildren(node)}</li>;
    case "blockquote":
      return <blockquote key={key}>{renderChildren(node)}</blockquote>;
    case "codeBlock":
      return (
        <pre key={key}>
          <code>{renderChildren(node)}</code>
        </pre>
      );
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    case "text":
      return renderText(node, key);
    default:
      return <div key={key}>{renderChildren(node)}</div>;
  }
}

function renderChildren(node: Node): (JSX.Element | string | null)[] {
  return (node.content ?? []).map((c, i) => renderNode(c, i));
}

function renderText(node: Node, key: React.Key): JSX.Element | string {
  let element: JSX.Element | string = node.text ?? "";
  const marks = node.marks ?? [];
  for (const mark of marks) {
    element = wrapMark(mark, element, key);
  }
  return typeof element === "string" ? (
    <span key={key}>{element}</span>
  ) : (
    element
  );
}

function wrapMark(
  mark: Mark,
  inner: JSX.Element | string,
  key: React.Key,
): JSX.Element {
  switch (mark.type) {
    case "bold":
      return <strong key={key}>{inner}</strong>;
    case "italic":
      return <em key={key}>{inner}</em>;
    case "strike":
      return <s key={key}>{inner}</s>;
    case "code":
      return <code key={key}>{inner}</code>;
    case "underline":
      return <u key={key}>{inner}</u>;
    case "link": {
      const href = String((mark.attrs?.href as string) ?? "#");
      return (
        <a key={key} href={href} rel="noreferrer noopener">
          {inner}
        </a>
      );
    }
    default:
      return <span key={key}>{inner}</span>;
  }
}
