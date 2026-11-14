// @vitest-environment jsdom
import * as React from "react";
import * as jsxRuntime from "react/jsx-runtime";
import { createRoot, type Root } from "react-dom/client";
import { transform } from "sucrase";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { JsonValue, PageHost } from "../schema.ts";
import { formEntrySource } from "./entry-source.ts";

type FormProps = { schema: unknown; value: JsonValue; extensions: unknown[]; extensionLoader: (source: unknown, index: number) => Promise<unknown>; onChange: (next: JsonValue) => void; [prop: string]: unknown };
type EntryData = { schema?: unknown; value?: JsonValue; props?: Record<string, unknown> };
type Entry = React.ComponentType<{ data: EntryData; host: PageHost }>;

const schema = { type: "object", properties: { name: { type: "string" } } };
let renders: FormProps[];
let container: HTMLElement;
let root: Root;
const emit = vi.fn<PageHost["emit"]>();

/** Compiles the generated entry the way the worker would (TypeScript + JSX to CommonJS) and runs it against stub modules. */
function loadEntry(modules: Record<string, unknown>, { declared = [], host = Object.keys(modules).filter((specifier) => !declared.includes(specifier)) }: { declared?: string[]; host?: string[] } = {}): Entry {
  const entryOf = (specifier: string) => ({ specifier, label: specifier });
  const source = formEntrySource({ host: host.map(entryOf), declared: declared.map(entryOf) });
  const { code } = transform(source, { transforms: ["typescript", "jsx", "imports"], jsxRuntime: "automatic", production: true });
  const stubs: Record<string, unknown> = {
    react: React, "react/jsx-runtime": jsxRuntime,
    "@flanksource/clicky-ui/components": { JsonSchemaForm: (props: FormProps) => { renders.push(props); return null; } },
    ...Object.fromEntries(Object.entries(modules).map(([specifier, value]) => [specifier, { __esModule: true, default: value }])),
  };
  const exports: { default?: Entry } = {};
  new Function("require", "exports", code)((specifier: string) => {
    if (!(specifier in stubs)) throw new Error(`unexpected import ${specifier}`);
    return stubs[specifier];
  }, exports);
  return exports.default!;
}

function render(Entry: Entry, data: EntryData) {
  React.act(() => root.render(React.createElement(Entry, { data, host: { emit } })));
}
const lastProps = () => renders.at(-1)!;

beforeEach(() => {
  (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
  renders = []; emit.mockReset();
  container = document.createElement("div"); document.body.append(container);
  root = createRoot(container);
});
afterEach(() => { React.act(() => root.unmount()); container.remove(); });

describe("generated form entry", () => {
  it("renders JsonSchemaForm with the host's props, the data schema and value, and every extension in order", () => {
    const first = { name: "first" };
    const second = { name: "second", formats: { color: () => null } };
    const Entry = loadEntry({ "./ext-0.tsx": first, "../extension.tsx": second });
    render(Entry, { schema, value: { name: "api" }, props: { layout: { mode: "cards" }, readOnly: false } });
    expect(lastProps()).toMatchObject({ schema, value: { name: "api" }, layout: { mode: "cards" }, readOnly: false });
    expect(lastProps().extensions).toEqual([first, second]);
  });

  it("passes host sources through extensions and schema-declared sources only through extensionLoader, by declared index", async () => {
    const hostExtension = { name: "host" };
    const first = { name: "declared-first" };
    const second = { name: "declared-second" };
    const Entry = loadEntry({ "./ext-0.tsx": hostExtension, "../one.tsx": first, "./ext-2.tsx": second }, { host: ["./ext-0.tsx"], declared: ["../one.tsx", "./ext-2.tsx"] });
    render(Entry, { schema, value: {} });
    expect(lastProps().extensions).toEqual([hostExtension]);
    expect(await Promise.all([lastProps().extensionLoader({ ref: "one.tsx" }, 0), lastProps().extensionLoader({ tsx: "x" }, 1)])).toEqual([first, second]);
  });

  it("gives the form a loader even when no schema source is declared, and the loader rejects an index it has no module for", async () => {
    const Entry = loadEntry({ "./ext-0.tsx": { name: "host" } });
    render(Entry, { schema, value: {} });
    expect(lastProps().extensions).toEqual([{ name: "host" }]);
    await expect(lastProps().extensionLoader({ ref: "missing.tsx" }, 0)).rejects.toThrow(/schema-declared form extension 0/);
  });

  it("validates schema-declared modules at load, naming the module", () => {
    expect(() => loadEntry({ "../bad.tsx": { pre: [] } }, { host: [], declared: ["../bad.tsx"] })).toThrow(/\.\.\/bad\.tsx: .*name must be a non-empty string/);
  });

  it("does not let host props override the schema, value, extensions or change handler", () => {
    const Entry = loadEntry({ "./ext-0.tsx": { name: "only" } });
    render(Entry, { schema, value: { name: "api" }, props: { schema: "bad", value: "bad", extensions: "bad", extensionLoader: "bad", onChange: "bad" } });
    expect(lastProps()).toMatchObject({ schema, value: { name: "api" } });
    expect(lastProps().extensions).toEqual([{ name: "only" }]);
    expect([typeof lastProps().onChange, typeof lastProps().extensionLoader]).toEqual(["function", "function"]);
  });

  it.each([
    [undefined, /default export must be a FormExtension/],
    [[{ name: "list" }], /default export must be a FormExtension/],
    [{ pre: [] }, /name must be a non-empty string/],
    [{ name: "x", pre: [() => 1, "nope"] }, /pre must be an array of functions/],
    [{ name: "x", post: () => 1 }, /post must be an array of functions/],
    [{ name: "x", formats: [] }, /formats must be an object/],
    [{ name: "x", slots: "Title" }, /slots must be an object/],
  ])("fails loudly, naming the module, for the invalid default export %j", (value, reason) => {
    expect(() => loadEntry({ "../bad.tsx": value })).toThrow(new RegExp(`../bad\\.tsx: .*${reason.source}`));
  });

  it.each([
    [{ value: {} }, "schema"],
    [{ schema }, "value"],
  ])("throws when the page data is incomplete: %j", (data, _missing) => {
    const Entry = loadEntry({ "./ext-0.tsx": { name: "x" } });
    const silence = vi.spyOn(console, "error").mockImplementation(() => {});
    try { expect(() => render(Entry, data as EntryData)).toThrow(/form page data must be/); }
    finally { silence.mockRestore(); }
  });

  it("emits each change to the host and shows it immediately without waiting for the host", () => {
    const Entry = loadEntry({ "./ext-0.tsx": { name: "x" } });
    render(Entry, { schema, value: { name: "a" } });
    React.act(() => lastProps().onChange({ name: "ab" }));
    expect(emit.mock.calls).toEqual([["change", { name: "ab" }]]);
    expect(lastProps().value).toEqual({ name: "ab" });
  });

  it("does not reseed when the host echoes a value this page emitted, even when echoes arrive late", () => {
    const Entry = loadEntry({ "./ext-0.tsx": { name: "x" } });
    render(Entry, { schema, value: { name: "" } });
    React.act(() => lastProps().onChange({ name: "a" }));
    React.act(() => lastProps().onChange({ name: "ab" }));
    render(Entry, { schema, value: { name: "a" } });
    expect(lastProps().value).toEqual({ name: "ab" });
    render(Entry, { schema, value: { name: "ab" } });
    expect(lastProps().value).toEqual({ name: "ab" });
  });

  it("reseeds from the host when it sends a value this page did not emit, and forgets the older echoes", () => {
    const Entry = loadEntry({ "./ext-0.tsx": { name: "x" } });
    render(Entry, { schema, value: { name: "" } });
    React.act(() => lastProps().onChange({ name: "typed" }));
    render(Entry, { schema, value: { name: "from-host" } });
    expect(lastProps().value).toEqual({ name: "from-host" });
    render(Entry, { schema, value: { name: "typed" } });
    expect(lastProps().value).toEqual({ name: "typed" });
  });

  it("keeps the typed value when only the schema or props change", () => {
    const Entry = loadEntry({ "./ext-0.tsx": { name: "x" } });
    render(Entry, { schema, value: { name: "" }, props: { readOnly: false } });
    React.act(() => lastProps().onChange({ name: "typed" }));
    render(Entry, { schema: { ...schema, title: "Renamed" }, value: { name: "" }, props: { readOnly: true } });
    expect(lastProps()).toMatchObject({ value: { name: "typed" }, readOnly: true, schema: { title: "Renamed" } });
  });
});
