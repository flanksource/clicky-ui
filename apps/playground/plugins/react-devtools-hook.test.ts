import { resolve } from "node:path";
import type { HtmlTagDescriptor } from "vite";
import { expect, it } from "vitest";
import { playgroundReactDevtoolsHook } from "./react-devtools-hook";

type Hooked = typeof globalThis & {
  __REACT_DEVTOOLS_GLOBAL_HOOK__?: { renderers: Map<number, Record<string, unknown>> };
};

it("prepends a classic head script whose hook receives react-dom's renderer with overrideProps", async () => {
  const transform = playgroundReactDevtoolsHook({ root: resolve(".") }).transformIndexHtml as () => HtmlTagDescriptor[];
  const tags = transform();
  expect(tags.map(({ tag, attrs, injectTo }) => ({ tag, attrs, injectTo }))).toEqual([
    { tag: "script", attrs: undefined, injectTo: "head-prepend" },
  ]);

  // A classic script evaluates in global scope before any module, so react-dom loads after it.
  new Function(String(tags[0]?.children))();
  await import("react-dom/client");

  const renderers = (globalThis as Hooked).__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers;
  expect([...(renderers?.values() ?? [])].map((renderer) => typeof renderer["overrideProps"])).toEqual(["function"]);
});
