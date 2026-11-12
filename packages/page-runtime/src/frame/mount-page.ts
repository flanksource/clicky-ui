import type { ComponentType, ReactNode } from "react";
import type { JsonValue } from "../schema.ts";
import { RuntimeFailure, runtimeError } from "../sw/errors.ts";

export type PageModule = { default: ComponentType<{ data: JsonValue }>; ready?: (() => Promise<void>) | Promise<void>; meta?: unknown };
export type PageLayout = { default: ComponentType<{ data: JsonValue; children: ReactNode }>; meta?: unknown };
export type ReactRuntime = [typeof import("react"), typeof import("react-dom/client"), typeof import("react-dom")];

export function mountPage(options: { module: PageModule; layout?: PageLayout; runtime: ReactRuntime; data: JsonValue; file: string; root: HTMLElement; wrap: (children: ReactNode) => ReactNode }) {
  const [React, { createRoot }, { flushSync }] = options.runtime;
  const renderer = createRoot(options.root);
  let revision = 0;
  const failures: unknown[] = [];
  class Boundary extends React.Component<{ revision: number; children: ReactNode }, { revision: number; failed: boolean }> {
    override state = { revision: 0, failed: false };
    static getDerivedStateFromProps(props: { revision: number }, state: { revision: number }) { return props.revision !== state.revision ? { revision: props.revision, failed: false } : null; }
    static getDerivedStateFromError() { return { failed: true }; }
    override componentDidCatch(error: Error) { failures.push(error); }
    override render() { return this.state.failed ? null : this.props.children; }
  }
  async function update(data: JsonValue) {
    failures.length = 0;
    const page = React.createElement(options.module.default, { data });
    const content = options.layout ? React.createElement(options.layout.default, { data, children: page }) : page;
    flushSync(() => renderer.render(options.wrap(React.createElement(Boundary, { revision: ++revision, children: content }))));
    if (failures.length) throw new RuntimeFailure(runtimeError({ error: failures[0], phase: "render", file: options.file }));
  }
  return { mounted: update(options.data), update, replace: async (next: { module: PageModule; layout?: PageLayout; data: JsonValue }) => {
    options.module = next.module;
    if (next.layout) options.layout = next.layout;
    else delete options.layout;
    await update(next.data);
  }, unmount: () => renderer.unmount() };
}
