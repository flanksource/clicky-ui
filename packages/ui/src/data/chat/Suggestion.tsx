import { cn } from "../../lib/utils";
import { type Suggestion, suggestionLabel, suggestionPrompt } from "./types";

export type SuggestionsProps = {
  suggestions: Suggestion[];
  /** Called with the suggestion's prompt text when a pill is clicked. */
  onSelect: (prompt: string) => void;
  className?: string;
};

/** A wrap of suggested-prompt pills, shown on the empty state. */
export function Suggestions({ suggestions, onSelect, className }: SuggestionsProps) {
  if (suggestions.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap justify-center gap-2", className)}>
      {suggestions.map((s, i) => (
        <button
          key={`${suggestionLabel(s)}-${i}`}
          type="button"
          onClick={() => onSelect(suggestionPrompt(s))}
          className="rounded-full border border-border bg-background px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          {suggestionLabel(s)}
        </button>
      ))}
    </div>
  );
}
