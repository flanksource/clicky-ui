import { Fragment, type ReactNode } from "react";
import { cn } from "../lib/utils";

export type CommentMarkdownProps = {
  /** Raw comment body in lightweight markdown. */
  text: string;
  /** Classes applied to the rendered wrapper. */
  className?: string;
};

type InlineToken =
  | { type: "text"; text: string }
  | { type: "strong"; text: string }
  | { type: "em"; text: string }
  | { type: "code"; text: string }
  | { type: "link"; text: string; href: string };

function safeHref(href: string): string | null {
  const trimmed = href.trim();
  if (!trimmed) return null;
  if (/^(https?:|mailto:)/i.test(trimmed)) return trimmed;
  if (trimmed.startsWith("/") && !trimmed.startsWith("//")) return trimmed;
  return null;
}

const INLINE_PATTERN =
  /(\*\*[^*\n]+\*\*|`[^`\n]+`|\[[^\]\n]+\]\(([^)\s]+)\)|https?:\/\/[^\s<)]+|\*[^*\n]+\*)/g;

function tokenizeInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = [];
  let last = 0;
  for (const match of text.matchAll(INLINE_PATTERN)) {
    const index = match.index ?? 0;
    if (index > last)
      tokens.push({ type: "text", text: text.slice(last, index) });
    const value = match[0];
    if (value.startsWith("**") && value.endsWith("**")) {
      tokens.push({ type: "strong", text: value.slice(2, -2) });
    } else if (value.startsWith("`") && value.endsWith("`")) {
      tokens.push({ type: "code", text: value.slice(1, -1) });
    } else if (value.startsWith("[")) {
      const labelEnd = value.indexOf("](");
      const href = safeHref(value.slice(labelEnd + 2, -1));
      tokens.push(
        href
          ? { type: "link", text: value.slice(1, labelEnd), href }
          : { type: "text", text: value },
      );
    } else if (/^https?:\/\//i.test(value)) {
      const href = safeHref(value);
      tokens.push(
        href
          ? { type: "link", text: value, href }
          : { type: "text", text: value },
      );
    } else if (value.startsWith("*") && value.endsWith("*")) {
      tokens.push({ type: "em", text: value.slice(1, -1) });
    } else {
      tokens.push({ type: "text", text: value });
    }
    last = index + value.length;
  }
  if (last < text.length) tokens.push({ type: "text", text: text.slice(last) });
  return tokens;
}

function InlineText({ text }: { text: string }) {
  return (
    <>
      {tokenizeInline(text).map((token, index) => {
        const key = `${token.type}-${index}`;
        switch (token.type) {
          case "strong":
            return (
              <strong key={key} className="font-semibold">
                {token.text}
              </strong>
            );
          case "em":
            return <em key={key}>{token.text}</em>;
          case "code":
            return (
              <code
                key={key}
                className="rounded bg-muted px-1 py-0.5 font-mono text-[0.9em]"
              >
                {token.text}
              </code>
            );
          case "link":
            return (
              <a
                key={key}
                href={token.href}
                target="_blank"
                rel="noreferrer"
                className="text-primary underline underline-offset-2"
              >
                {token.text}
              </a>
            );
          default:
            return <Fragment key={key}>{token.text}</Fragment>;
        }
      })}
    </>
  );
}

function renderParagraph(lines: string[], key: string): ReactNode {
  return (
    <p key={key}>
      {lines.map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          <InlineText text={line} />
        </Fragment>
      ))}
    </p>
  );
}

function renderCode(lines: string[], key: string): ReactNode {
  return (
    <pre key={key} className="overflow-auto rounded bg-muted p-2 text-xs">
      <code>{lines.join("\n")}</code>
    </pre>
  );
}

/**
 * Lightweight, dependency-free markdown for comment bodies: bold, italics,
 * inline code, safe links, bullet lists, and fenced code blocks. For richer
 * rendering pass a `renderBody` to the card instead.
 */
export function CommentMarkdown({ text, className }: CommentMarkdownProps) {
  const rawLines = String(text ?? "")
    .replace(/\r\n?/g, "\n")
    .split("\n");
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let list: string[] = [];
  let code: string[] | null = null;

  function flushParagraph() {
    if (paragraph.length > 0) {
      blocks.push(renderParagraph(paragraph, `p-${blocks.length}`));
      paragraph = [];
    }
  }

  function flushList() {
    if (list.length > 0) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc space-y-0.5 pl-4">
          {list.map((item, index) => (
            <li key={index}>
              <InlineText text={item} />
            </li>
          ))}
        </ul>,
      );
      list = [];
    }
  }

  for (const line of rawLines) {
    if (line.trim().startsWith("```")) {
      flushParagraph();
      flushList();
      if (code) {
        blocks.push(renderCode(code, `code-${blocks.length}`));
        code = null;
      } else {
        code = [];
      }
      continue;
    }
    if (code) {
      code.push(line);
      continue;
    }

    const trimmed = line.trim();
    if (!trimmed) {
      flushParagraph();
      flushList();
      continue;
    }

    const bullet = trimmed.match(/^[-*]\s+(.+)$/);
    if (bullet?.[1]) {
      flushParagraph();
      list.push(bullet[1]);
      continue;
    }

    flushList();
    paragraph.push(trimmed.replace(/^#{1,6}\s+/, ""));
  }

  flushParagraph();
  flushList();
  if (code) blocks.push(renderCode(code, `code-${blocks.length}`));

  return (
    <div
      className={cn(
        "space-y-2 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0",
        className,
      )}
    >
      {blocks.length > 0 ? blocks : null}
    </div>
  );
}
