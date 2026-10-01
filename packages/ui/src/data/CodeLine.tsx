import { useEffect, useState } from "react";
import { highlightToLines, type HighlightedLine } from "./code-highlight";
import { HighlightedTokens } from "./HighlightedTokens";

export interface CodeLineProps {
  code: string;
  /** Shiki language id; without one the line renders as plain text. */
  language?: string;
  className?: string;
}

// CodeLine paints a single source line, syntax-highlighted, inline — the line a
// stack frame or trace node ran, shown without the gutter and frame of a block.
export function CodeLine({ code, language, className }: CodeLineProps) {
  const [tokens, setTokens] = useState<HighlightedLine | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    setTokens(undefined);
    highlightToLines(code, { lang: language }).then((out) => {
      if (!cancelled) setTokens(out?.[0]);
    });
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  return (
    <code className={["whitespace-pre font-mono", className].filter(Boolean).join(" ")}>
      <HighlightedTokens tokens={tokens} content={code} />
    </code>
  );
}
