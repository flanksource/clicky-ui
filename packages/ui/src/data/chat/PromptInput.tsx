import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/button";
import { Icon } from "../Icon";
import { UiArrowUp, UiStop } from "../../icons";
import {
  AttachmentButton,
  AttachmentList,
} from "./Attachment";
import type {
  AttachmentLimits,
  AttachmentUploadAdapter,
} from "./attachment-upload";
import type { ChatStatus, FileUIPart } from "./types";

export type PromptInputProps = {
  /** Called with the trimmed text and any attachments when the user submits. */
  onSubmit: (text: string, files: FileUIPart[]) => void;
  /** Called when the user stops an in-flight generation. */
  onStop?: (() => void) | undefined;
  /** Current chat status; drives the submit/stop button affordance. */
  status?: ChatStatus | undefined;
  allowSubmitWhileStreaming?: boolean | undefined;
  disabled?: boolean | undefined;
  stopLabel?: string | undefined;
  placeholder?: string | undefined;
  /** Enables the attachment button and chips. */
  enableAttachments?: boolean | undefined;
  attachmentUpload?: AttachmentUploadAdapter | undefined;
  acceptedMediaTypes?: string[] | undefined;
  attachmentLimits?: AttachmentLimits | undefined;
  /** Text to seed the composer with, without submitting it. A new `id` re-seeds
   *  even when the text repeats, so picking the same suggestion twice works. */
  draft?: { id: number; text: string } | null | undefined;
  /** Toolbar content (e.g. model/effort selectors) rendered in the footer. */
  toolbar?: ReactNode;
  /** Compact host control rendered beside the textarea and submit button. */
  inputAccessory?: ReactNode;
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
  allowSubmitWhileStreaming = false,
  disabled = false,
  stopLabel = "Stop",
  placeholder = "What would you like to know?",
  enableAttachments = false,
  attachmentUpload,
  acceptedMediaTypes,
  attachmentLimits,
  draft,
  toolbar,
  inputAccessory,
  className,
}: PromptInputProps) {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<FileUIPart[]>([]);
  const [attachmentError, setAttachmentError] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const seededDraftId = useRef<number | null>(null);
  const isGenerating = status === "submitted" || status === "streaming";

  // A draft replaces whatever is in the box and puts the caret at the end, so
  // the user can edit before sending. Keyed on `id` rather than `text` so the
  // same suggestion picked twice re-seeds instead of doing nothing.
  useEffect(() => {
    if (!draft || seededDraftId.current === draft.id) return;
    seededDraftId.current = draft.id;
    setValue(draft.text);
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.focus();
    textarea.setSelectionRange(draft.text.length, draft.text.length);
  }, [draft]);

  const submit = () => {
    const text = value.trim();
    if (
      (!text && files.length === 0) ||
      disabled ||
      (isGenerating && !allowSubmitWhileStreaming)
    )
      return;
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

  const canSubmit =
    !disabled &&
    (!isGenerating || allowSubmitWhileStreaming) &&
    (value.trim().length > 0 || files.length > 0);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex flex-col gap-2 rounded-lg border border-input bg-background p-2",
        className,
      )}
    >
      {enableAttachments && (
        <>
          <AttachmentList
            files={files}
            onRemove={(i) => setFiles((f) => f.filter((_, j) => j !== i))}
          />
          {attachmentError && (
            <p className="px-1 text-xs text-destructive">{attachmentError}</p>
          )}
        </>
      )}

      <div className="flex items-end gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          className="max-h-48 min-h-9 flex-1 resize-none bg-transparent px-1 py-1.5 text-sm outline-none placeholder:text-placeholder"
        />
        {inputAccessory}
        {isGenerating && onStop && (
          <Button
            type="button"
            size="icon"
            variant="secondary"
            aria-label={stopLabel}
            onClick={onStop}
          >
            <Icon icon={UiStop} className="size-4" />
          </Button>
        )}
        {(!isGenerating || allowSubmitWhileStreaming) && (
          <Button
            type="submit"
            size="icon"
            aria-label="Send"
            disabled={!canSubmit}
          >
            <Icon icon={UiArrowUp} className="size-4" />
          </Button>
        )}
      </div>

      {(toolbar || enableAttachments) && (
        <div className="flex items-center gap-2">
          {enableAttachments && (
            <AttachmentButton
              onAdd={(p) => setFiles((f) => [...f, ...p])}
              disabled={disabled || isGenerating}
              files={files}
              onError={setAttachmentError}
              {...(attachmentUpload ? { upload: attachmentUpload } : {})}
              {...(acceptedMediaTypes ? { acceptedMediaTypes } : {})}
              {...(attachmentLimits ? { limits: attachmentLimits } : {})}
            />
          )}
          {toolbar}
        </div>
      )}
    </form>
  );
}
