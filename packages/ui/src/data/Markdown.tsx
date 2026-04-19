import { useEffect, useState } from "react";
import { cn } from "../lib/utils";

export type MarkdownProps = {
  text: string;
  className?: string;
};

type MarkedLike = {
  parse: (md: string) => string | Promise<string>;
};

let loadPromise: Promise<MarkedLike> | null = null;

function loadMarked(): Promise<MarkedLike> {
  if (loadPromise) return loadPromise;
  loadPromise = import("marked").then(({ Marked, Renderer }) => {
    const renderer = new Renderer();

    renderer.code = ({ text, lang }) =>
      `<pre class="bg-muted rounded p-2 text-xs overflow-x-auto border border-border my-1.5"><code${lang ? ` class="language-${lang}"` : ""}>${text}</code></pre>`;

    renderer.codespan = ({ text }) => `<code class="bg-muted rounded px-1 text-xs">${text}</code>`;

    renderer.heading = ({ text, depth }) => {
      const cls =
        depth <= 1
          ? "font-bold text-base mt-2 mb-1"
          : depth === 2
            ? "font-semibold text-sm mt-2 mb-1"
            : "font-semibold text-sm mt-2 mb-1";
      return `<h${depth} class="${cls}">${text}</h${depth}>`;
    };

    renderer.link = ({ href, text }) =>
      `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-primary hover:underline">${text}</a>`;

    renderer.blockquote = ({ text }) =>
      `<blockquote class="border-l-2 border-border pl-2 text-muted-foreground italic my-1">${text}</blockquote>`;

    renderer.tablerow = ({ text }) => `<tr class="border-b border-border">${text}</tr>`;

    renderer.list = function (token) {
      const tag = token.ordered ? "ol" : "ul";
      const cls = token.ordered ? "list-decimal ml-4 my-1" : "list-disc ml-4 my-1";
      const body = token.items.map((item) => this.listitem(item)).join("");
      return `<${tag} class="${cls}">${body}</${tag}>`;
    };

    renderer.listitem = ({ text }) => `<li class="my-0.5">${text}</li>`;

    renderer.image = ({ href, text }) =>
      `<img src="${href}" alt="${text}" class="max-w-full rounded my-1" />`;

    renderer.hr = () => '<hr class="border-border my-2" />';

    renderer.paragraph = ({ text }) => `<p class="mt-1.5">${text}</p>`;

    return new Marked({ renderer, gfm: true, breaks: true }) as unknown as MarkedLike;
  });
  return loadPromise;
}

export function Markdown({ text, className }: MarkdownProps) {
  const [html, setHtml] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadMarked()
      .then((m) => Promise.resolve(m.parse(text)))
      .then((out) => {
        if (!cancelled) setHtml(out);
      })
      .catch(() => {
        if (!cancelled) setHtml(text);
      });
    return () => {
      cancelled = true;
    };
  }, [text]);

  if (html === null) {
    return <pre className={cn("text-sm whitespace-pre-wrap", className)}>{text}</pre>;
  }

  return (
    <div
      className={cn("prose prose-sm max-w-none dark:prose-invert", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
