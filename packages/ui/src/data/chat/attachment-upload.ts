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
