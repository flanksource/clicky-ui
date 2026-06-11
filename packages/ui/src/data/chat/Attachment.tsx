import { useRef } from "react";
import { convertFileListToFileUIParts } from "ai";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { Button } from "../../components/button";
import { UiAdd, UiClose, UiFile } from "../../icons";
import type { FileUIPart } from "./types";

/** Files larger than this are rejected client-side: attachments are inlined as
 *  data URLs in the request body, so large files would bloat every turn. */
const MAX_ATTACHMENT_BYTES = 5 * 1024 * 1024;

export type AttachmentButtonProps = {
  /** Called with newly selected files converted to FileUIParts. */
  onAdd: (parts: FileUIPart[]) => void;
  disabled?: boolean;
  className?: string;
};

/** A paperclip-style button that opens the file picker and emits the chosen
 *  files as FileUIParts (data-URL encoded). */
export function AttachmentButton({ onAdd, disabled, className }: AttachmentButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const tooBig = Array.from(list).filter((f) => f.size > MAX_ATTACHMENT_BYTES);
    if (tooBig.length > 0) {
      console.warn(`clicky-ui: ${tooBig.length} attachment(s) exceed ${MAX_ATTACHMENT_BYTES} bytes and were skipped`);
    }
    const ok = Array.from(list).filter((f) => f.size <= MAX_ATTACHMENT_BYTES);
    if (ok.length > 0) {
      const dt = new DataTransfer();
      ok.forEach((f) => dt.items.add(f));
      onAdd(await convertFileListToFileUIParts(dt.files));
    }
    e.target.value = "";
  };

  return (
    <>
      <input ref={inputRef} type="file" multiple hidden onChange={onChange} />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Attach files"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        className={className}
      >
        <Icon icon={UiAdd} className="size-4" />
      </Button>
    </>
  );
}

export type AttachmentListProps = {
  files: FileUIPart[];
  onRemove: (index: number) => void;
  className?: string;
};

/** Chips/thumbnails for the pending attachments, each removable. */
export function AttachmentList({ files, onRemove, className }: AttachmentListProps) {
  if (files.length === 0) return null;
  return (
    <div className={cn("flex flex-wrap gap-2 px-1", className)}>
      {files.map((file, i) => (
        <div
          key={`${file.filename ?? "file"}-${i}`}
          className="flex items-center gap-1.5 rounded-md border border-border bg-background py-1 pl-2 pr-1 text-xs"
        >
          {file.mediaType?.startsWith("image/") && file.url ? (
            <img src={file.url} alt={file.filename ?? ""} className="size-6 rounded object-cover" />
          ) : (
            <Icon icon={UiFile} className="size-3.5 text-muted-foreground" />
          )}
          <span className="max-w-32 truncate">{file.filename ?? file.mediaType ?? "file"}</span>
          <button
            type="button"
            aria-label="Remove attachment"
            onClick={() => onRemove(i)}
            className="rounded p-0.5 text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <Icon icon={UiClose} className="size-3" />
          </button>
        </div>
      ))}
    </div>
  );
}
