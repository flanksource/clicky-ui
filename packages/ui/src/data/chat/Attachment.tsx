import { useRef, useState } from "react";
import { cn } from "../../lib/utils";
import { Icon } from "../Icon";
import { Button } from "../../components/button";
import { UiAdd, UiClose, UiFile } from "../../icons";
import type { FileUIPart } from "./types";

export const DEFAULT_ATTACHMENT_LIMITS = {
  maxFileBytes: 20 * 1024 * 1024,
  maxRequestBytes: 50 * 1024 * 1024,
  maxFiles: 10,
} as const;

export type AttachmentLimits = {
  maxFileBytes?: number;
  maxRequestBytes?: number;
  maxFiles?: number;
};

export type AttachmentFilePart = FileUIPart & {
  attachmentId: string;
  size: number;
};

export type AttachmentUploadAdapter = (file: File) => Promise<AttachmentFilePart>;

type AttachmentDescriptor = {
  id: string;
  filename: string;
  mediaType: string;
  size: number;
};

export function createAttachmentUploadAdapter(
  options: {
    endpoint?: string;
    fetch?: typeof fetch;
  } = {},
): AttachmentUploadAdapter {
  const endpoint = options.endpoint ?? "/api/attachments";
  const fetcher = options.fetch ?? globalThis.fetch;
  return async (file) => {
    const body = new FormData();
    body.append("file", file, file.name);
    const response = await fetcher(endpoint, { method: "POST", body });
    const payload = (await response.json()) as AttachmentDescriptor & {
      error?: string;
    };
    if (!response.ok) {
      throw new Error(
        payload.error ?? `attachment upload failed (${response.status})`,
      );
    }
    return {
      type: "file",
      filename: payload.filename,
      mediaType: payload.mediaType,
      url: `${endpoint.replace(/\/$/, "")}/${payload.id}`,
      attachmentId: payload.id,
      size: payload.size,
    };
  };
}

export type AttachmentButtonProps = {
  /** Called with newly selected files converted to FileUIParts. */
  onAdd: (parts: FileUIPart[]) => void;
  disabled?: boolean;
  className?: string;
  upload?: AttachmentUploadAdapter;
  files?: FileUIPart[];
  acceptedMediaTypes?: string[];
  limits?: AttachmentLimits;
  onError?: (message: string) => void;
};

/** A paperclip-style button that uploads selected files and emits durable file
 * descriptors. Binary content never enters the chat message body. */
export function AttachmentButton({
  onAdd,
  disabled,
  className,
  upload = createAttachmentUploadAdapter(),
  files = [],
  acceptedMediaTypes,
  limits,
  onError,
}: AttachmentButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const resolvedLimits = { ...DEFAULT_ATTACHMENT_LIMITS, ...limits };

  const onChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const list = e.target.files;
    if (!list || list.length === 0) return;
    const selected = Array.from(list);
    const currentBytes = files.reduce(
      (total, file) =>
        total + Number((file as Partial<AttachmentFilePart>).size ?? 0),
      0,
    );
    let validationError = "";
    if (files.length + selected.length > resolvedLimits.maxFiles) {
      validationError = `Attachments are limited to ${resolvedLimits.maxFiles} files.`;
    } else if (
      selected.some((file) => file.size > resolvedLimits.maxFileBytes)
    ) {
      validationError = `Each attachment must be ${resolvedLimits.maxFileBytes} bytes or smaller.`;
    } else if (
      currentBytes + selected.reduce((total, file) => total + file.size, 0) >
      resolvedLimits.maxRequestBytes
    ) {
      validationError = `Attachments are limited to ${resolvedLimits.maxRequestBytes} bytes per request.`;
    }
    if (validationError) {
      onError?.(validationError);
      e.target.value = "";
      return;
    }
    setUploading(true);
    try {
      onAdd(await Promise.all(selected.map((file) => upload(file))));
      onError?.("");
    } catch (error) {
      onError?.(error instanceof Error ? error.message : String(error));
    } finally {
      setUploading(false);
    }
    e.target.value = "";
  };

  const accept = acceptedMediaTypes?.join(",");
  const capabilityDisabled =
    acceptedMediaTypes != null && acceptedMediaTypes.length === 0;

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        multiple
        hidden
        onChange={onChange}
        {...(accept ? { accept } : {})}
      />
      <Button
        type="button"
        size="icon"
        variant="ghost"
        aria-label="Attach files"
        disabled={disabled || uploading || capabilityDisabled}
        title={
          capabilityDisabled
            ? "The selected model does not support attachments"
            : undefined
        }
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
