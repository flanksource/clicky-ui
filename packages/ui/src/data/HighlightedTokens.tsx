import { tokenStyle } from "./token-style";
import type { HighlightedLine } from "./code-highlight";

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

