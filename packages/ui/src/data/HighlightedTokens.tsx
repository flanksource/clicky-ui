import type { CSSProperties } from "react";
import type { HighlightedLine, HighlightedToken } from "./code-highlight";

// HighlightedTokens paints one `highlightToLines` line as themed spans, falling
// back to the raw text when tokenization was unavailable (unsupported language,
// highlighter failure, or the tokens simply not loaded yet). Shared by every
// surface that paints its own gutter — CodeDiff's diff rows and the stack-frame
// source window — none of which can embed Shiki's own `<pre>` because their line
// numbers are not a contiguous 1..N run.
export function HighlightedTokens({
  tokens,
  content,
}: {
  tokens: HighlightedLine | undefined;
  content: string;
}) {
  if (!tokens || tokens.length === 0) return <>{content}</>;
  return (
    <>
      {tokens.map((token, index) => (
        <span key={index} style={tokenStyle(token)}>
          {token.content}
        </span>
      ))}
    </>
  );
}

// Shiki's `fontStyle` is a bitmask: 1=italic, 2=bold, 4=underline.
function tokenStyle(token: HighlightedToken): CSSProperties {
  const style: CSSProperties = {};
  if (token.color) style.color = token.color;
  const fontStyle = token.fontStyle ?? 0;
  if (fontStyle & 1) style.fontStyle = "italic";
  if (fontStyle & 2) style.fontWeight = 700;
  if (fontStyle & 4) style.textDecorationLine = "underline";
  return style;
}
