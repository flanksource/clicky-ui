import { afterEach, describe, expect, it, vi } from "vitest";
import { downloadJson } from "./download";
import type { CacheKeyDetail } from "./types";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("downloadJson", () => {
  const stubBlobUrls = () => {
    const createObjectURL = vi.fn(() => "blob:stub");
    const revokeObjectURL = vi.fn();
    // jsdom doesn't implement object URLs.
    Object.assign(URL, { createObjectURL, revokeObjectURL });
    return { createObjectURL, revokeObjectURL };
  };

  it("serializes the detail as pretty JSON and triggers an anchor download", () => {
    const { createObjectURL, revokeObjectURL } = stubBlobUrls();
    const click = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
    const parts: BlobPart[] = [];
    let blobType = "";
    vi.spyOn(globalThis, "Blob").mockImplementation((p, opts) => {
      parts.push(...(p ?? []));
      blobType = opts?.type ?? "";
      return {} as Blob;
    });

    const detail: CacheKeyDetail = {
      key: "tx:abc",
      type: "string",
      ttlSeconds: -1,
      length: 5,
      value: "hello",
    };
    downloadJson(detail.key, detail);

    expect(blobType).toBe("application/json");
    expect(parts).toEqual([JSON.stringify(detail, null, 2)]);
    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(click).toHaveBeenCalledOnce();
    expect(revokeObjectURL).toHaveBeenCalledWith("blob:stub");
  });

  it("sanitizes the key into a safe filename, preserving dots and dashes", () => {
    const { createObjectURL } = stubBlobUrls();
    const anchors: HTMLAnchorElement[] = [];
    const realCreate = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation((tag: string) => {
      const el = realCreate(tag);
      if (tag === "a") {
        anchors.push(el as HTMLAnchorElement);
        (el as HTMLAnchorElement).click = () => {};
      }
      return el;
    });

    downloadJson("schema:product/plan-v2", { ok: true });

    expect(createObjectURL).toHaveBeenCalledOnce();
    expect(anchors[0]!.download).toBe("schema_product_plan-v2.json");
  });
});
