// @vitest-environment jsdom
import { describe, expect, it } from "vitest";
import { resolvePageOwner } from "./owner.ts";

describe("agent page owner", () => {
  it("resolves a library child to its nearest page marker and keeps the library name", () => {
    document.body.innerHTML = '<main data-source="report.tsx:8:3"><h2>Revenue</h2></main>';
    const element = document.querySelector("h2")!;
    expect(resolvePageOwner({ element, root: document.body, componentName: "StatCard", fiber: null })).toEqual({
      element: element.parentElement, source: "report.tsx:8:3", componentName: "StatCard",
    });
  });

  it("uses the library fiber's page call site when there is no marked ancestor", () => {
    document.body.innerHTML = "<h2>Revenue</h2>";
    const element = document.querySelector("h2")!;
    const library = { _debugSource: { fileName: "report.tsx", lineNumber: 12, columnNumber: 7 }, _debugOwner: null };
    expect(resolvePageOwner({ element, root: document.body, componentName: "StatCard", fiber: {
      _debugSource: { fileName: "/node_modules/facet/Card.tsx", lineNumber: 4, columnNumber: 2 }, _debugOwner: library,
    } })).toEqual({ element, source: "report.tsx:12:7", componentName: "StatCard" });
  });

  it.each(["/entry/generated.tsx:1:1", "/node_modules/facet/Card.tsx:2:3", "https://runtime.example/npm/@acme/library@1.0.0/Card.js:2:3", "report.tsx:0:1"])("rejects non-page marker %s", (source) => {
    document.body.innerHTML = `<main data-source="${source}"><h2>Revenue</h2></main>`;
    expect(() => resolvePageOwner({ element: document.querySelector("h2")!, root: document.body, componentName: "StatCard", fiber: null })).toThrow(/page source/);
  });

  it("rejects picks outside the page root", () => {
    document.body.innerHTML = "<main></main><aside>outside</aside>";
    expect(() => resolvePageOwner({ element: document.querySelector("aside")!, root: document.querySelector("main")!, componentName: null, fiber: null })).toThrow(/outside/);
  });

  it("resolves a portal through its page fiber while rejecting a different React root", () => {
    document.body.innerHTML = '<main></main><aside data-source="report.tsx:12:7">Portal</aside>';
    const root = document.querySelector("main")!;
    const element = document.querySelector("aside")!;
    const page = { _debugSource: { fileName: "report.tsx", lineNumber: 12, columnNumber: 7 }, return: { stateNode: { containerInfo: root } } };
    expect(resolvePageOwner({ element, root, componentName: "Modal", fiber: { return: page } })).toEqual({ element, source: "report.tsx:12:7", componentName: "Modal" });
    expect(() => resolvePageOwner({ element, root, componentName: "Modal", fiber: { ...page, return: { stateNode: { containerInfo: document.body } } } })).toThrow(/outside/);
  });

  it.each(["data-page-agent", "data-react-grab", "data-react-grab-ignore"])("rejects %s DOM even with page fiber metadata", (attribute) => {
    document.body.innerHTML = `<main><aside ${attribute}><h2 data-source="report.tsx:12:7">Overlay</h2></aside></main>`;
    const root = document.querySelector("main")!;
    const host = document.querySelector("aside")!;
    const fiber = { _debugSource: { fileName: "report.tsx", lineNumber: 12, columnNumber: 7 }, return: { stateNode: { containerInfo: root } } };
    expect(() => resolvePageOwner({ element: document.querySelector("h2")!, root, componentName: "Modal", fiber })).toThrow(/outside/);
    const shadowChild = document.createElement("h2");
    host.attachShadow({ mode: "open" }).append(shadowChild);
    expect(() => resolvePageOwner({ element: shadowChild, root, componentName: "Modal", fiber })).toThrow(/outside/);
  });

  it("rejects an owner call site without a column instead of inventing a source position", () => {
    document.body.innerHTML = "<h2>Revenue</h2>";
    expect(() => resolvePageOwner({ element: document.querySelector("h2")!, root: document.body, componentName: "StatCard", fiber: {
      _debugSource: { fileName: "report.tsx", lineNumber: 12 },
    } })).toThrow(/page source/);
  });

  it("uses an explicitly declared document URL for ordinary HTML and keeps runtime resolution strict", () => {
    document.body.innerHTML = "<h2>Report</h2>";
    const options = { element: document.querySelector("h2")!, root: document.body, componentName: null, fiber: null };
    const sourceContext = { mode: "external-document" as const, url: "https://example.com/report" };
    expect(resolvePageOwner({ ...options, sourceContext })).toMatchObject({ source: sourceContext.url, element: options.element });
    expect(() => resolvePageOwner(options)).toThrow(/page source/);
    expect(() => resolvePageOwner({ ...options, sourceContext: { ...sourceContext, url: "javascript:alert(1)" } })).toThrow();
  });

  it("resolves React 19 owner creation stacks and ignores library frames", () => {
    document.body.innerHTML = "<h2>Revenue</h2>";
    const element = document.querySelector("h2")!;
    const stack = new Error("react-stack-top-frame");
    stack.stack = "Error: react-stack-top-frame\n    at StatCard (http://runtime.test/node_modules/facet/Card.js:4:2)\n    at Report (http://runtime.test/pages/report.tsx:12:7)";
    expect(resolvePageOwner({ element, root: document.body, componentName: "StatCard", fiber: { _debugStack: stack } })).toEqual({
      element, source: "http://runtime.test/pages/report.tsx:12:7", componentName: "StatCard",
    });
  });
});
