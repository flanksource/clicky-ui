import { expect, it } from "vitest";
import { bookmarkletFrame, bookmarkletParentOrigin, bookmarkletPeerOrigin, matchesBookmarkletParent } from "./origin";

const extension = "chrome-extension://abcdefghijklmnopabcdefghijklmnop";
const runtime = { spec: { model: "example-model" }, presets: ["fast"] };
const frame = { playground: "http://localhost:5274/__playground/bookmarklet.js", documentUrl: "https://example.com/docs?a=1", session: "s-1" };

it("frames the playground panel directly for bookmarklets", () => {
  expect(bookmarkletFrame(frame)).toEqual({
    src: "http://localhost:5274/?bookmarklet=1&parentOrigin=https%3A%2F%2Fexample.com&session=s-1",
    origin: "http://localhost:5274",
  });
});

it("frames the panel through the extension relay and tells the panel the relay origin", () => {
  const result = bookmarkletFrame({ ...frame, relay: `${extension}/relay.html` });
  expect(result.origin).toBe(extension);
  const target = new URL(new URL(result.src).searchParams.get("target") ?? "");
  expect(Object.fromEntries(target.searchParams)).toEqual({ bookmarklet: "1", parentOrigin: "https://example.com", session: "s-1", relayOrigin: extension });
  expect(() => bookmarkletFrame({ ...frame, relay: "https://example.com/relay.html" })).toThrow(/chrome-extension/);
});

it("frames the extension's bundled gavel panel directly, naming the bridge session apart from the agent session", () => {
  const result = bookmarkletFrame({
    documentUrl: "https://example.com/docs?a=1",
    session: "bridge-1",
    panel: { url: `${extension}/panel.html`, todoRelay: `${extension}/todo-relay.html`, server: "http://localhost:9092", project: "my site", runtime, grouping: "shared", agentSession: "agent-7" },
  });
  expect(result.origin).toBe(extension);
  const url = new URL(result.src);
  expect(`${url.protocol}//${url.host}${url.pathname}`).toBe(`${extension}/panel.html`);
  expect(Object.fromEntries(url.searchParams)).toEqual({
    server: "http://localhost:9092",
    project: "my site",
    runtime: JSON.stringify(runtime),
    grouping: "shared",
    session: "agent-7",
    parentOrigin: "https://example.com",
    bridgeSession: "bridge-1",
  });
});

it("omits the optional runtime, grouping and session from the gavel panel URL and refuses a non-extension panel", () => {
  const panel = { url: `${extension}/panel.html`, todoRelay: `${extension}/todo-relay.html`, server: "http://localhost:9092", project: "site" };
  const url = new URL(bookmarkletFrame({ documentUrl: "file:///docs/a.html", session: "b", panel }).src);
  expect([...url.searchParams.keys()].sort()).toEqual(["bridgeSession", "parentOrigin", "project", "server"]);
  expect(url.searchParams.get("parentOrigin")).toBe("null");
  expect(() => bookmarkletFrame({ documentUrl: "https://example.com/", session: "b", panel: { ...panel, url: "https://example.com/panel.html" } })).toThrow(/chrome-extension/);
});

it("exchanges panel messages with the relay only when it is an extension origin", () => {
  expect(bookmarkletPeerOrigin({ parentOrigin: "https://example.com", relayOrigin: null })).toBe("https://example.com");
  expect(bookmarkletPeerOrigin({ parentOrigin: "https://example.com", relayOrigin: extension })).toBe(extension);
  expect(() => bookmarkletPeerOrigin({ parentOrigin: "https://example.com", relayOrigin: "https://evil.example" })).toThrow(/relay origin/);
});

it("normalizes file documents and accepts only their opaque origin representations", () => {
  expect(bookmarkletParentOrigin("file:///documents/report.html")).toBe("null");
  expect(bookmarkletParentOrigin("https://example.com/report")).toBe("https://example.com");
  expect(matchesBookmarkletParent({ expected: "null", received: "file://" })).toBe(true);
  expect(matchesBookmarkletParent({ expected: "null", received: "null" })).toBe(true);
  expect(matchesBookmarkletParent({ expected: "null", received: "https://example.com" })).toBe(false);
  expect(matchesBookmarkletParent({ expected: "https://example.com", received: "null" })).toBe(false);
});
