import { useState, type FormEvent, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/button";
import { Icon } from "../Icon";
import { UiArrowUp, UiStop } from "../../icons";
import { AttachmentButton, AttachmentList } from "./Attachment";
import type { ChatStatus, FileUIPart } from "./types";

export type PromptInputProps = {
  /** Called with the trimmed text and any attachments when the user submits. */
  onSubmit: (text: string, files: FileUIPart[]) => void;
  /** Called when the user stops an in-flight generation. */
  onStop?: (() => void) | undefined;
  /** Current chat status; drives the submit/stop button affordance. */
  status?: ChatStatus | undefined;
  placeholder?: string | undefined;
  /** Enables the attachment button and chips. */
  enableAttachments?: boolean | undefined;
  /** Toolbar content (e.g. model/effort selectors) rendered in the footer. */
  toolbar?: ReactNode;
  className?: string | undefined;
};

/** Auto-growing prompt textarea with a submit/stop button, optional attachment
 *  controls, and a toolbar slot (model/effort selectors). Enter submits;
 *  Shift+Enter inserts a newline; while streaming the button becomes a stop
 *  control. */
export function PromptInput({
  onSubmit,
  onStop,
  status,
  placeholder = "What would you like to know?",
  enableAttachments = false,
  toolbar,
  className,
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<FileUIPart[]>([]);
  const isGenerating = status === "submitted" || status === "streaming";

  const submit = () => {
    const text = value.trim();
    if ((!text && files.length === 0) || isGenerating) return;
    onSubmit(text, files);
    setValue("");
    setFiles([]);
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

  const canSubmit = value.trim().length > 0 || files.length > 0;

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-input bg-background p-2",
        className,
      )}
    >
      {enableAttachments && (
        <AttachmentList files={files} onRemove={(i) => setFiles((f) => f.filter((_, j) => j !== i))} />
      )}

      <div className="flex items-end gap-2">
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
          <Button type="submit" size="icon" aria-label="Send" disabled={!canSubmit}>
            <Icon icon={UiArrowUp} className="size-4" />
          </Button>
        )}
      </div>

      {(toolbar || enableAttachments) && (
        <div className="flex items-center gap-2">
          {enableAttachments && (
            <AttachmentButton onAdd={(p) => setFiles((f) => [...f, ...p])} disabled={isGenerating} />
          )}
          {toolbar}
        </div>
      )}
    </form>
  );
}
