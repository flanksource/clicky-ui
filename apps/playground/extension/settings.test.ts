import { expect, it } from "vitest";
import { bookmarkletFrame } from "../src/bookmarklet/origin";
import {
  assertActivated,
  effectiveSettings,
  hostLaunch,
  panelTarget,
  parseGlobalDefaults,
  relayTarget,
  sameJson,
  serverOrigin,
  siteOverrides,
  type GlobalDefaults,
} from "./settings";

const relayOrigin = "chrome-extension://abcdefghijklmnopabcdefghijklmnop";
const playground = "http://localhost:5274";
const gavel = "http://localhost:9092";

function panelFor(documentUrl: string, options: { playground?: string } = {}) {
  const { src } = bookmarkletFrame({ playground: options.playground ?? playground, documentUrl, session: "s-1", relay: `${relayOrigin}/relay.html` });
  return new URL(src).searchParams.get("target");
}

it("normalizes server addresses to their origin and rejects non-HTTP ones", () => {
  expect(serverOrigin(" http://localhost:5274/some/page?x=1 ")).toBe(playground);
  expect(() => serverOrigin("file:///tmp/playground")).toThrow(/HTTP\(S\)/);
  expect(() => serverOrigin("http://user:pw@localhost:5274")).toThrow(/credentials/);
  expect(() => serverOrigin("localhost:5274")).toThrow();
});

it("relays the panel a host built for the page that frames the relay", () => {
  const result = relayTarget({ target: panelFor("https://example.com/docs"), ancestorOrigin: "https://example.com", playground, relayOrigin });
  expect(result.parentOrigin).toBe("https://example.com");
  expect(result.url.origin).toBe(playground);
});

it("relays file documents whose framing origin is reported as file://", () => {
  expect(relayTarget({ target: panelFor("file:///docs/report.html"), ancestorOrigin: "file://", playground, relayOrigin }).parentOrigin).toBe("null");
});

it.each([
  { name: "another page's panel", target: () => panelFor("https://bank.example/"), ancestorOrigin: "https://example.com", error: /not the framing page/ },
  { name: "an unconfigured playground", target: () => panelFor("https://example.com/", { playground: "http://localhost:9999" }), ancestorOrigin: "https://example.com", error: /not the configured playground/ },
  { name: "a non-panel playground page", target: () => "http://localhost:5274/__playground/comments?bookmarklet=1", ancestorOrigin: "https://example.com", error: /not the playground grabber panel/ },
  { name: "an unframed relay", target: () => panelFor("https://example.com/"), ancestorOrigin: undefined, error: /framed by a page/ },
  { name: "a missing target", target: () => null, ancestorOrigin: "https://example.com", error: /target panel URL/ },
])("refuses to relay $name", ({ target, ancestorOrigin, error }) => {
  expect(() => relayTarget({ target: target(), ancestorOrigin, playground, relayOrigin })).toThrow(error);
});

it("refuses a panel addressed to another extension's relay", () => {
  expect(() => relayTarget({ target: panelFor("https://example.com/"), ancestorOrigin: "https://example.com", playground, relayOrigin: "chrome-extension://ponmlkjihgfedcbaponmlkjihgfedcba" })).toThrow(/another relay/);
});

const claude = { spec: { model: "claude-example", effort: "high" }, presets: ["fast"] };
const codex = { spec: { model: "codex-example" } };
const global: GlobalDefaults = { backend: "gavel", server: gavel, project: "acme", runtime: claude };

it("lays a site's overrides over the global defaults and keeps the session per site", () => {
  expect(effectiveSettings(global, {})).toEqual({ backend: "gavel", server: gavel, project: "acme", runtime: claude });
  expect(effectiveSettings(global, { project: "docs", session: "s-4" })).toEqual({ backend: "gavel", server: gavel, project: "docs", runtime: claude, session: "s-4" });
  expect(effectiveSettings({ ...global, grouping: "shared" }, { runtime: codex })).toEqual({ backend: "gavel", server: gavel, project: "acme", runtime: codex, grouping: "shared" });
  expect(effectiveSettings(global, { grouping: "shared" })).toMatchObject({ grouping: "shared" });
  expect(effectiveSettings({ backend: "playground", server: `${playground}/x` }, { server: "http://localhost:5275" })).toEqual({ backend: "playground", server: "http://localhost:5275" });
});

it.each([
  { name: "gavel without a project", global: { backend: "gavel", server: gavel }, site: {}, error: /gavel backend needs a project/i },
  { name: "an invalid site server", global, site: { server: "not a url" }, error: /./ },
  { name: "a site that switches to gavel without any project", global: { backend: "playground", server: playground }, site: { backend: "gavel", server: gavel }, error: /gavel backend needs a project/i },
])("refuses effective settings with $name", ({ global: defaults, site, error }) => {
  expect(() => effectiveSettings(defaults as GlobalDefaults, site as never)).toThrow(error);
});

it("stores only the fields that differ from the global defaults, always keeping the session", () => {
  const same = { backend: "gavel", server: gavel, project: "acme", runtime: claude } as const;
  expect(siteOverrides(global, same)).toBeNull();
  expect(siteOverrides(global, { ...same, server: `${gavel}/`, project: "docs" })).toEqual({ project: "docs" });
  expect(siteOverrides(global, { ...same, runtime: codex, session: "s-4" })).toEqual({ runtime: codex, session: "s-4" });
  expect(siteOverrides(global, { backend: "playground", server: playground })).toEqual({ backend: "playground", server: playground });
});

it("compares runtimes by value, so an equal runtime in another key order is not an override", () => {
  const reordered = { presets: ["fast"], spec: { effort: "high", model: "claude-example" } };
  expect(siteOverrides(global, { backend: "gavel", server: gavel, project: "acme", runtime: reordered })).toBeNull();
  expect(siteOverrides(global, { backend: "gavel", server: gavel, project: "acme", runtime: { ...reordered, presets: ["slow"] } })).toEqual({ runtime: { ...reordered, presets: ["slow"] } });
});

it("treats an unset grouping as per page, so only a different grouping is an override", () => {
  const chosen = { backend: "gavel", server: gavel, project: "acme", runtime: claude } as const;
  expect(siteOverrides(global, { ...chosen, grouping: "page" })).toBeNull();
  expect(siteOverrides(global, { ...chosen, grouping: "shared" })).toEqual({ grouping: "shared" });
  expect(siteOverrides({ ...global, grouping: "shared" }, { ...chosen, grouping: "shared" })).toBeNull();
  expect(siteOverrides({ ...global, grouping: "shared" }, { ...chosen, grouping: "page" })).toEqual({ grouping: "page" });
});

it("keeps enabled per site: never from global defaults, always stored while set, and alone it is still a site entry", () => {
  const chosen = { backend: "gavel", server: gavel, project: "acme", runtime: claude, enabled: true } as const;
  expect(effectiveSettings(global, { enabled: true })).toEqual({ backend: "gavel", server: gavel, project: "acme", runtime: claude, enabled: true });
  expect(effectiveSettings(global, {})).not.toHaveProperty("enabled");
  expect(siteOverrides(global, chosen)).toEqual({ enabled: true });
  expect(siteOverrides(global, { ...chosen, project: "docs" })).toEqual({ project: "docs", enabled: true });
});

it("drops a field again once the global value is chosen, and the whole entry once nothing is left", () => {
  const overridden = effectiveSettings(global, { project: "docs", runtime: codex });
  const back = { ...overridden, project: "acme" };
  expect(siteOverrides(global, back)).toEqual({ runtime: codex });
  expect(siteOverrides(global, { ...back, runtime: claude })).toBeNull();
});

it("rejects saving gavel settings without a project or with an invalid server", () => {
  expect(() => siteOverrides(global, { backend: "gavel", server: gavel })).toThrow(/gavel backend needs a project/i);
  expect(() => siteOverrides(global, { backend: "gavel", server: "nope", project: "acme" })).toThrow();
});

it("reads stored global defaults strictly", () => {
  expect(parseGlobalDefaults({ backend: "gavel", server: `${gavel}/x`, project: "acme", runtime: codex, grouping: "shared" })).toEqual({ backend: "gavel", server: gavel, project: "acme", runtime: codex, grouping: "shared" });
  expect(parseGlobalDefaults({ backend: "playground", server: playground })).toEqual({ backend: "playground", server: playground });
  expect(() => parseGlobalDefaults({ backend: "gavel", server: gavel })).toThrow(/gavel backend needs a project/i);
  expect(() => parseGlobalDefaults("nope")).toThrow(/object/);
  expect(() => parseGlobalDefaults({ backend: "x", server: gavel })).toThrow(/backend must be/);
  expect(() => parseGlobalDefaults({ backend: "playground", server: playground, session: "s" })).toThrow(/unknown field "session"/);
  expect(() => parseGlobalDefaults({ backend: "playground", server: playground, grouping: "all" })).toThrow(/grouping must be shared or page/);
  expect(() => parseGlobalDefaults({ backend: "playground", server: playground, runtime: { spec: {} } })).toThrow(/runtime spec.model/);
});

it("refuses the removed agent setting with a message to re-pick the model, in global defaults too", () => {
  expect(() => parseGlobalDefaults({ backend: "gavel", server: gavel, project: "acme", agent: "codex" })).toThrow(/"agent" setting was replaced.*re-pick the model/s);
});

it("compares by value regardless of key order, ignoring undefined", () => {
  expect(sameJson({ spec: { a: 1, b: [1, { c: 2 }] } }, { spec: { b: [1, { c: 2 }], a: 1 }, presets: undefined })).toBe(true);
  expect(sameJson({ a: [1, 2] }, { a: [2, 1] })).toBe(false);
  expect(sameJson(undefined, undefined)).toBe(true);
  expect(sameJson(undefined, { a: 1 })).toBe(false);
});

const frameParams = { server: gavel, project: "acme", runtime: JSON.stringify(codex), grouping: "shared", session: "s-4", parentOrigin: "https://example.com", bridgeSession: "b-1" };
const page = "https://example.com";
const framed = (params: Record<string, string>, ancestorOrigin: string | undefined) => ({ search: `?${new URLSearchParams(params)}`, ancestorOrigin });
const without = (key: string) => Object.fromEntries(Object.entries(frameParams).filter(([name]) => name !== key));

it("accepts the panel a host framed for the page that frames it", () => {
  expect(panelTarget(framed(frameParams, page))).toEqual({ server: gavel, project: "acme", runtime: codex, grouping: "shared", agentSession: "s-4", parentOrigin: "https://example.com", bridgeSession: "b-1" });
  const file = framed({ server: gavel, project: "acme", parentOrigin: "null", bridgeSession: "b-1" }, "file://");
  expect(panelTarget(file)).toEqual({ server: gavel, project: "acme", grouping: "page", parentOrigin: "null", bridgeSession: "b-1" });
});

it.each([
  { name: "an unframed panel", options: framed(frameParams, undefined), error: /framed by a page/ },
  { name: "a panel built for another page", options: framed(frameParams, "https://bank.example"), error: /not the framing page/ },
  { name: "a missing project", options: framed(without("project"), page), error: /project/ },
  { name: "a missing bridge session", options: framed(without("bridgeSession"), page), error: /bridge session/ },
  { name: "an invalid server", options: framed({ ...frameParams, server: "nope" }, page), error: /./ },
  { name: "an invalid parent origin", options: framed({ ...frameParams, parentOrigin: "https://example.com/x" }, "https://example.com/x"), error: /Invalid parent origin/ },
  { name: "a runtime that is not JSON", options: framed({ ...frameParams, runtime: "{nope" }, page), error: /runtime is not valid JSON/ },
  { name: "a runtime without a model", options: framed({ ...frameParams, runtime: JSON.stringify({ spec: {} }) }, page), error: /runtime spec.model/ },
  { name: "an unknown grouping", options: framed({ ...frameParams, grouping: "all" }, page), error: /grouping must be shared or page/ },
])("refuses $name", ({ options, error }) => {
  expect(() => panelTarget(options)).toThrow(error);
});

it("tells the host to frame the playground through the relay, or the bundled panel with this site's session", () => {
  const urls = { panel: `${relayOrigin}/panel.html`, relay: `${relayOrigin}/relay.html`, todoRelay: `${relayOrigin}/todo-relay.html` };
  expect(hostLaunch({ backend: "playground", server: playground, project: "ignored" }, urls)).toEqual({ playground, relay: urls.relay });
  expect(hostLaunch({ backend: "gavel", server: gavel, project: "acme", runtime: codex, grouping: "shared", session: "s-4" }, urls)).toEqual({ gavel: { url: urls.panel, todoRelay: urls.todoRelay, server: gavel, project: "acme", runtime: codex, grouping: "shared", agentSession: "s-4" } });
  expect(hostLaunch({ backend: "gavel", server: gavel, project: "acme" }, urls)).toEqual({ gavel: { url: urls.panel, todoRelay: urls.todoRelay, server: gavel, project: "acme" } });
  expect(() => hostLaunch({ backend: "gavel", server: gavel }, urls)).toThrow(/needs a project/);
});

it("authorizes a frame only for the backend, server and project the user activated the grabber with", () => {
  const record = { backend: "gavel", server: gavel, project: "acme" } as const;
  expect(() => assertActivated({ record, request: { backend: "gavel", server: gavel, project: "acme" } })).not.toThrow();
  expect(() => assertActivated({ record: { backend: "playground", server: playground }, request: { backend: "playground", server: playground } })).not.toThrow();
  expect(() => assertActivated({ record: undefined, request: { backend: "gavel", server: gavel, project: "acme" } })).toThrow(/not activated/);
  expect(() => assertActivated({ record, request: { backend: "gavel", server: gavel, project: "other" } })).toThrow(/activated with different settings/);
  expect(() => assertActivated({ record, request: { backend: "gavel", server: "http://localhost:1", project: "acme" } })).toThrow(/activated with different settings/);
  expect(() => assertActivated({ record, request: { backend: "playground", server: gavel } })).toThrow(/activated with different settings/);
});
