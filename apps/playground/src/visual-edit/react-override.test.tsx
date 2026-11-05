import { act, useState, type ReactElement } from "react";
import { afterEach, expect, it } from "vitest";

const MARKER = "flanksource/_facet-diagrams/cells.tsx:12:7#0@aaaaaaaaaaaa";
const OTHER_MARKER = "flanksource/_facet-diagrams/cells.tsx:40:7#1@aaaaaaaaaaaa";

type Hooked = Window & { __REACT_DEVTOOLS_GLOBAL_HOOK__?: unknown; IS_REACT_ACT_ENVIRONMENT?: boolean };
const hooked = window as Hooked;

afterEach(() => {
  document.body.innerHTML = "";
});

/** react-dom registers with the DevTools hook while it evaluates, so the hook must exist before its first import. */
async function renderWithHook(build: (facet: typeof import("@flanksource/facet")) => ReactElement) {
  await import("bippy/install-hook-only");
  const { createRoot } = await import("react-dom/client");
  const facet = await import("@flanksource/facet");
  hooked.IS_REACT_ACT_ENVIRONMENT = true;
  const container = document.body.appendChild(document.createElement("div"));
  await act(async () => createRoot(container).render(build(facet)));
  return container;
}

it("overrides the call-site component's props and re-renders every instance", async () => {
  const { overrideCallSite, liveOverrideSupport } = await import("./react-override");
  const container = await renderWithHook(({ BoxNode }) => {
    const Callout = (props: { tone: "outlined" | "card"; title: string; "data-editable-source": string }) => (
      <BoxNode id={props.title} variant={props.tone} title={props.title} data-editable-source={props["data-editable-source"]} />
    );
    return (
      <>
        <Callout tone="outlined" title="Run API" data-editable-source={MARKER} />
        <Callout tone="outlined" title="Run UI" data-editable-source={MARKER} />
        <Callout tone="outlined" title="Other" data-editable-source={OTHER_MARKER} />
      </>
    );
  });
  expect(liveOverrideSupport()).toEqual({ supported: true });
  const nodes = Array.from(container.querySelectorAll(`[data-editable-source="${MARKER}"]`));

  await act(async () => overrideCallSite(nodes, MARKER, "tone", "card"));
  await act(async () => overrideCallSite(nodes, MARKER, "title", "Run Gateway"));

  expect(
    Array.from(container.querySelectorAll("[data-box-style]"), (box) => [
      box.getAttribute("data-box-style"),
      box.querySelector("[data-editable-text='title']")?.textContent ?? box.textContent,
    ]),
  ).toEqual([
    ["card", "Run Gateway"],
    ["card", "Run Gateway"],
    ["outlined", "Other"],
  ]);
});

it("keeps a reverted prop reverted when a different prop is overridden next", async () => {
  const { overrideCallSite } = await import("./react-override");
  let tick: () => void = () => {
    throw new Error("Ticker is not mounted");
  };
  const container = await renderWithHook(({ BoxNode }) => {
    const Ticker = () => {
      const [count, setCount] = useState(0);
      tick = () => setCount((value) => value + 1);
      return <span>{count}</span>;
    };
    const Callout = (props: { tone: "outlined" | "card"; title: string; "data-editable-source": string }) => (
      <BoxNode id="callout" variant={props.tone} title={props.title} data-editable-source={props["data-editable-source"]} />
    );
    return (
      <>
        <Ticker />
        <section><div><Callout tone="outlined" title="Run API" data-editable-source={MARKER} /></div></section>
      </>
    );
  });
  const nodes = Array.from(container.querySelectorAll(`[data-editable-source="${MARKER}"]`));
  // A refused style edit is reverted, then a text edit follows. Commits elsewhere in the tree (the
  // shell's polling) flip the root buffers while the diagram's .return pointers stay stale.
  const steps: Array<[string, string]> = [
    ["tone", "card"], ["tone", "outlined"], ["title", "Run Gateway"],
    ["tone", "card"], ["tone", "outlined"], ["title", "Run Edge"],
    ["tone", "card"], ["tone", "outlined"], ["title", "Run Core"],
  ];
  for (const [prop, value] of steps) {
    await act(async () => overrideCallSite(nodes, MARKER, prop, value));
    await act(async () => tick());
  }

  const box = container.querySelector("[data-box-style]");
  expect([box?.getAttribute("data-box-style"), box?.querySelector("[data-editable-text='title']")?.textContent]).toEqual(["outlined", "Run Core"]);
});

it("throws with context when the node has no component carrying the marker", async () => {
  const { overrideCallSite } = await import("./react-override");
  const container = await renderWithHook(({ BoxNode }) => <BoxNode id="a" title="A" variant="card" />);
  expect(() => overrideCallSite([container.firstElementChild!], MARKER, "variant", "ghost")).toThrow(
    /no component with data-editable-source/,
  );
});

it("reports live preview unsupported without a hook or a renderer", async () => {
  const { liveOverrideSupport, overrideCallSite } = await import("./react-override");
  const original = hooked.__REACT_DEVTOOLS_GLOBAL_HOOK__;
  try {
    delete hooked.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    expect(liveOverrideSupport()).toEqual({ supported: false, reason: expect.stringMatching(/no React DevTools hook/) });
    hooked.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { renderers: new Map() };
    expect(liveOverrideSupport()).toEqual({ supported: false, reason: expect.stringMatching(/no registered renderer/) });
    hooked.__REACT_DEVTOOLS_GLOBAL_HOOK__ = { renderers: new Map([[1, {}]]) };
    expect(liveOverrideSupport()).toEqual({ supported: false, reason: expect.stringMatching(/production build/) });
    expect(() => overrideCallSite([document.body], MARKER, "variant", "ghost")).toThrow(/cannot override variant live/);
  } finally {
    hooked.__REACT_DEVTOOLS_GLOBAL_HOOK__ = original;
  }
});
