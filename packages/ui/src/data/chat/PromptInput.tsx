import { useState, type FormEvent, type KeyboardEvent } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/button";
import { Icon } from "../Icon";
import { UiArrowUp, UiStop } from "../../icons";
import type { ChatStatus } from "./types";

export type PromptInputProps = {
  /** Called with the trimmed text when the user submits a non-empty message. */
  onSubmit: (text: string) => void;
  /** Called when the user stops an in-flight generation. */
  onStop?: () => void;
  /** Current chat status; drives the submit/stop button affordance. */
  status?: ChatStatus | undefined;
  placeholder?: string | undefined;
  className?: string | undefined;
};

/** Auto-growing prompt textarea with a submit/stop button. Enter (or Cmd/Ctrl+
 *  Enter) submits; Shift+Enter inserts a newline. While streaming, the button
 *  becomes a stop control. */
export function PromptInput({
  onSubmit,
  onStop,
  status,
  placeholder = "What would you like to know?",
  className,
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const isGenerating = status === "submitted" || status === "streaming";

  const submit = () => {
    const text = value.trim();
    if (!text || isGenerating) return;
    onSubmit(text);
    setValue("");
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submit();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
      e.preventDefault();
      submit();
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-end gap-2 rounded-lg border border-input bg-background p-2",
        className,
      )}
    >
      <textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="max-h-48 min-h-9 flex-1 resize-none bg-transparent px-1 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
      />
      {isGenerating && onStop ? (
        <Button type="button" size="icon" variant="secondary" aria-label="Stop" onClick={onStop}>
          <Icon icon={UiStop} className="size-4" />
        </Button>
      ) : (
        <Button type="submit" size="icon" aria-label="Send" disabled={!value.trim()}>
          <Icon icon={UiArrowUp} className="size-4" />
        </Button>
      )}
    </form>
  );
}
