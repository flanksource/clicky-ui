import { describe, expect, it, vi } from "vitest";
import { createAttachmentUploadAdapter } from "./Attachment";
import { compactAISpecRuntime } from "../ai/SpecRuntimeEditor.model";

describe("createAttachmentUploadAdapter", () => {
  it("uploads binary content once and returns a durable file part", async () => {
    const fetcher = vi.fn(
      async (_input: RequestInfo | URL, init?: RequestInit) => {
        expect(init?.method).toBe("POST");
        expect(init?.body).toBeInstanceOf(FormData);
        return new Response(
          JSON.stringify({
            id: `sha256:${"a".repeat(64)}`,
            filename: "diagram.png",
            mediaType: "image/png",
            size: 5,
            sha256: "a".repeat(64),
          }),
          { status: 201, headers: { "Content-Type": "application/json" } },
        );
      },
    );
    const upload = createAttachmentUploadAdapter({ fetch: fetcher });

    const part = await upload(
      new File(["image"], "diagram.png", { type: "image/png" }),
    );

    expect(part).toMatchObject({
      type: "file",
      filename: "diagram.png",
      mediaType: "image/png",
      attachmentId: `sha256:${"a".repeat(64)}`,
      url: `/api/attachments/sha256:${"a".repeat(64)}`,
      size: 5,
    });
    expect(part.url).not.toContain("base64");
  });

  it("surfaces a server rejection", async () => {
    const upload = createAttachmentUploadAdapter({
      fetch: vi.fn(
        async () =>
          ({
            ok: false,
            status: 413,
            json: async () => ({ error: "file too large" }),
          }) as Response,
      ),
    });
    let message = "";
    try {
      await upload(new File(["x"], "large.png", { type: "image/png" }));
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).toBe("file too large");
  });
});

describe("attachment runtime spec", () => {
  it("preserves an attachment-only prompt payload", () => {
    expect(
      compactAISpecRuntime({
        prompt: {
          attachments: [
            {
              id: `sha256:${"a".repeat(64)}`,
              filename: "diagram.png",
              mediaType: "image/png",
              size: 5,
            },
          ],
        },
      }),
    ).toEqual({
      prompt: {
        attachments: [
          {
            id: `sha256:${"a".repeat(64)}`,
            filename: "diagram.png",
            mediaType: "image/png",
            size: 5,
          },
        ],
      },
    });
  });
});
