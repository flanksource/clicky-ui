import { afterEach, describe, expect, it, vi } from "vitest";
import { cursorKeyOf, localStorageCursor, watchCommentEvents, type CursorStore } from "./comment-events";

afterEach(() => {
  vi.restoreAllMocks();
  window.localStorage.clear();
});

describe("cursorKeyOf", () => {
  it("keys a cursor by server and scope, so two gavels serving the same project never share a position", () => {
    const scope = "gavel://project/site";
    expect(cursorKeyOf({ baseUrl: "http://localhost:9092", scope })).not.toBe(cursorKeyOf({ baseUrl: "http://localhost:9093", scope }));
    expect(cursorKeyOf({ baseUrl: "http://localhost:9092", scope })).toBe("gavel.events.http://localhost:9092.gavel://project/site");
  });
});

describe("localStorageCursor", () => {
  it("starts from the beginning when nothing is stored, and reads back what it wrote", () => {
    expect(localStorageCursor.get("k")).toBe(0);
    localStorageCursor.set("k", 42);
    expect(localStorageCursor.get("k")).toBe(42);
  });

  it.each(["abc", "-3", "4.5", "", "1e3", "9007199254740993"])("fails loudly on a stored value that is not a sequence number (%j), naming the key", (stored) => {
    window.localStorage.setItem("k", stored);
    expect(() => localStorageCursor.get("k")).toThrow(/stored event cursor k.*not a sequence number/);
  });

  it("starts from the beginning, and stops remembering, when storage is blocked by the browser", () => {
    const blocked = () => {
      throw new DOMException("blocked", "SecurityError");
    };
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(blocked);
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(blocked);
    expect(localStorageCursor.get("k")).toBe(0);
    expect(() => localStorageCursor.set("k", 1)).not.toThrow();
  });

  it("does not hide a storage failure that is not the browser refusing storage", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new TypeError("storage is broken");
    });
    expect(() => localStorageCursor.get("k")).toThrow("storage is broken");
  });
});

describe("watchCommentEvents", () => {
  const idle = ({ signal }: { signal: AbortSignal }) => new Promise<void>((resolve) => signal.addEventListener("abort", () => resolve()));
  const client = (streamEvents: (stream: never) => Promise<void>) => ({ baseUrl: "http://localhost:9092", scope: "gavel://project/site", streamEvents: vi.fn(streamEvents) as never });

  it("reports a corrupt stored cursor as live updates that did not start, instead of starting from a wrong position", () => {
    const cursor: CursorStore = { get: () => localStorageCursor.get("corrupt"), set: vi.fn() };
    window.localStorage.setItem("corrupt", "oops");
    const statuses: (string | null)[] = [];
    const watched = client(idle);
    const stop = watchCommentEvents({ client: watched, cursor, onChange: vi.fn(), onStatus: (stopped) => statuses.push(stopped) });
    expect(statuses).toEqual([expect.stringMatching(/Live updates did not start: .*oops.*not a sequence number/)]);
    expect(watched.streamEvents).not.toHaveBeenCalled();
    stop();
  });
});
