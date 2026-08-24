/** @vitest-environment jsdom */

import { afterEach, describe, expect, it, vi } from "vitest";

import { writeClipboard } from "./clipboard";

const clipboardDescriptor = Object.getOwnPropertyDescriptor(
  navigator,
  "clipboard",
);
const clipboardItemDescriptor = Object.getOwnPropertyDescriptor(
  globalThis,
  "ClipboardItem",
);

afterEach(() => {
  if (clipboardDescriptor)
    Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
  else Reflect.deleteProperty(navigator, "clipboard");
  if (clipboardItemDescriptor) {
    Object.defineProperty(globalThis, "ClipboardItem", clipboardItemDescriptor);
  } else {
    Reflect.deleteProperty(globalThis, "ClipboardItem");
  }
});

describe("writeClipboard", () => {
  it("claims the clipboard with a pending text blob before the text resolves", async () => {
    let resolveText: (text: string) => void = () => undefined;
    const text = new Promise<string>((resolve) => {
      resolveText = resolve;
    });
    let plainText: Promise<Blob> | undefined;
    class TestClipboardItem {
      constructor(items: Record<string, Promise<Blob>>) {
        plainText = items["text/plain"];
      }
    }
    const write = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { write },
    });
    Object.defineProperty(globalThis, "ClipboardItem", {
      configurable: true,
      value: TestClipboardItem,
    });

    const copying = writeClipboard(text);

    expect(write).toHaveBeenCalledOnce();
    resolveText("folder feedback");
    await copying;
    expect((await plainText)?.type).toBe("text/plain");
    expect((await plainText)?.size).toBe("folder feedback".length);
  });

  it("reports an unavailable clipboard API without a reference error", async () => {
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: undefined,
    });

    await expect(writeClipboard(Promise.resolve("feedback"))).rejects.toThrow(
      "Clipboard API is unavailable",
    );
  });
});
