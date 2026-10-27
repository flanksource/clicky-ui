import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";
import { copyPendingText, copyRich, useCopyFlash, type RichClipboardPayload } from "./clipboard";

// jsdom implements neither ClipboardItem nor navigator.clipboard, so both are
// defined here. The stub ClipboardItem keeps the Promise<Blob> it was given and
// write() settles each one, as a browser does when it reads the item.
class StubClipboardItem {
  readonly items: Record<string, Promise<Blob>>;
  constructor(items: Record<string, Promise<Blob>>) {
    this.items = items;
  }
  get types(): string[] {
    return Object.keys(this.items);
  }
  getType(type: string): Promise<Blob> {
    const blob = this.items[type];
    if (!blob) throw new Error(`no ${type} on the stub ClipboardItem`);
    return blob;
  }
}

const written: StubClipboardItem[][] = [];
const write = vi.fn(async (items: StubClipboardItem[]) => {
  written.push(items);
  for (const item of items) {
    for (const type of item.types) await item.getType(type);
  }
});
const writeText = vi.fn(async (_text: string) => {});

function stubClipboard(clipboard: Partial<Clipboard> | undefined) {
  Object.defineProperty(navigator, "clipboard", { value: clipboard, configurable: true });
}

function stubClipboardItem(ctor: typeof StubClipboardItem | undefined) {
  Object.defineProperty(globalThis, "ClipboardItem", {
    value: ctor,
    configurable: true,
    writable: true,
  });
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

// jsdom's Blob has no text(); FileReader is the jsdom-supported way to read one.
function blobText(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsText(blob);
  });
}

async function writtenBlobs(): Promise<Record<string, { type: string; text: string }>> {
  expect(written).toHaveLength(1);
  const [items] = written;
  expect(items).toHaveLength(1);
  const item = items![0]!;
  const entries = await Promise.all(
    item.types.map(async (type) => {
      const blob = await item.getType(type);
      return [type, { type: blob.type, text: await blobText(blob) }] as const;
    }),
  );
  return Object.fromEntries(entries);
}

const report: RichClipboardPayload = {
  text: "Activity AddRider failed: 1042",
  html: '<p><span style="color:#dc2626">Activity AddRider failed</span>: 1042</p>',
};

describe("copyRich", () => {
  beforeEach(() => {
    written.length = 0;
    write.mockClear();
    writeText.mockClear();
    stubClipboard({ write, writeText } as unknown as Partial<Clipboard>);
    stubClipboardItem(StubClipboardItem);
  });

  afterEach(() => {
    stubClipboardItem(undefined);
  });

  it("writes one ClipboardItem whose text/html and text/plain blobs resolve to the payload", async () => {
    await copyRich(report);

    expect(await writtenBlobs()).toEqual({
      "text/html": { type: "text/html", text: report.html },
      "text/plain": { type: "text/plain", text: report.text },
    });
  });

  it("starts the clipboard write before an async payload resolves, inside the user gesture", async () => {
    const pending = deferred<RichClipboardPayload>();

    const copied = copyRich(pending.promise);
    expect(write).toHaveBeenCalledTimes(1);

    pending.resolve(report);
    await copied;
    expect(await writtenBlobs()).toEqual({
      "text/html": { type: "text/html", text: report.html },
      "text/plain": { type: "text/plain", text: report.text },
    });
  });

  it("rejects when the payload promise rejects", async () => {
    await expect(copyRich(Promise.reject(new Error("render failed: 500")))).rejects.toThrow(
      "render failed: 500",
    );
  });

  it("rejects when the payload is not a {text, html} pair of strings", async () => {
    const malformed = Promise.resolve({ text: "only text" } as unknown as RichClipboardPayload);
    await expect(copyRich(malformed)).rejects.toThrow(/html/);
  });

  it("rejects instead of falling back to text-only when ClipboardItem is unavailable", async () => {
    stubClipboardItem(undefined);

    await expect(copyRich(report)).rejects.toThrow(/ClipboardItem/);
    expect(writeText).not.toHaveBeenCalled();
  });

  it("rejects when navigator.clipboard.write is unavailable", async () => {
    stubClipboard({ writeText } as unknown as Partial<Clipboard>);

    await expect(copyRich(report)).rejects.toThrow(/clipboard\.write/);
    expect(writeText).not.toHaveBeenCalled();
  });
});

describe("copyPendingText", () => {
  const markdown = "# Exception\n\n- **Class:** java.lang.IllegalStateException";

  beforeEach(() => {
    written.length = 0;
    write.mockClear();
    writeText.mockClear();
    stubClipboard({ write, writeText } as unknown as Partial<Clipboard>);
    stubClipboardItem(StubClipboardItem);
  });

  afterEach(() => {
    stubClipboardItem(undefined);
  });

  it("writes a text/plain-only ClipboardItem before the text resolves", async () => {
    const pending = deferred<string>();

    const copied = copyPendingText(pending.promise);
    expect(write).toHaveBeenCalledTimes(1);

    pending.resolve(markdown);
    await copied;
    expect(await writtenBlobs()).toEqual({ "text/plain": { type: "text/plain", text: markdown } });
    expect(writeText).not.toHaveBeenCalled();
  });

  it("rejects when the text promise rejects", async () => {
    await expect(copyPendingText(Promise.reject(new Error("render failed: 500")))).rejects.toThrow(
      "render failed: 500",
    );
  });

  it("rejects when the text resolves to something other than a string", async () => {
    const malformed = Promise.resolve({ text: markdown } as unknown as string);
    await expect(copyPendingText(malformed)).rejects.toThrow(/string/);
  });

  it("rejects when ClipboardItem is unavailable", async () => {
    stubClipboardItem(undefined);

    await expect(copyPendingText(Promise.resolve(markdown))).rejects.toThrow(/ClipboardItem/);
  });
});

describe("useCopyFlash", () => {
  beforeEach(() => {
    written.length = 0;
    write.mockClear();
    writeText.mockClear();
    stubClipboard({ write, writeText } as unknown as Partial<Clipboard>);
    stubClipboardItem(StubClipboardItem);
  });

  afterEach(() => {
    stubClipboardItem(undefined);
    vi.useRealTimers();
  });

  it("copies a string through writeText and flips to copied", async () => {
    const { result } = renderHook(() => useCopyFlash());

    act(() => result.current.copy("timeout: 300"));

    await waitFor(() => expect(result.current.state).toBe("copied"));
    expect(writeText).toHaveBeenCalledWith("timeout: 300");
    expect(write).not.toHaveBeenCalled();
  });

  it("is pending while an async payload is in flight, then copied, then idle after resetMs", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const resetMs = 1500;
    const pending = deferred<RichClipboardPayload>();
    const { result } = renderHook(() => useCopyFlash(resetMs));

    act(() => result.current.copy(pending.promise));
    expect(result.current.state).toBe("pending");
    expect(write).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve(report);
      await pending.promise;
    });
    await waitFor(() => expect(result.current.state).toBe("copied"));

    await act(() => vi.advanceTimersByTimeAsync(resetMs));
    expect(result.current.state).toBe("idle");
  });

  it("goes pending then error when the payload promise rejects", async () => {
    const pending = deferred<RichClipboardPayload>();
    const { result } = renderHook(() => useCopyFlash());

    act(() => result.current.copy(pending.promise));
    expect(result.current.state).toBe("pending");

    act(() => pending.reject(new Error("render failed: 500")));
    await waitFor(() => expect(result.current.state).toBe("error"));
  });

  it("copies pending plain text through a text/plain ClipboardItem: pending, then copied", async () => {
    const pending = deferred<string>();
    const { result } = renderHook(() => useCopyFlash());

    act(() => result.current.copy({ plain: pending.promise }));
    expect(result.current.state).toBe("pending");
    expect(write).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve("# Exception");
      await pending.promise;
    });
    await waitFor(() => expect(result.current.state).toBe("copied"));
    expect(await writtenBlobs()).toEqual({ "text/plain": { type: "text/plain", text: "# Exception" } });
  });

  it("ignores a slower rich copy that settles after a newer copy", async () => {
    const slow = deferred<RichClipboardPayload>();
    const { result } = renderHook(() => useCopyFlash());

    act(() => result.current.copy(slow.promise));
    act(() => result.current.copy("newer"));
    await waitFor(() => expect(result.current.state).toBe("copied"));

    act(() => slow.reject(new Error("too late")));
    await act(async () => {
      await slow.promise.catch(() => {});
    });
    expect(result.current.state).toBe("copied");
  });
});
