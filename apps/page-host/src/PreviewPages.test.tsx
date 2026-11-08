// @vitest-environment jsdom
import { act, createElement } from "react";
import { createRoot } from "react-dom/client";
import { expect, it, vi } from "vitest";
import { PreviewPages } from "./PreviewPages";
import { STARTER } from "./starter";

const mounted = vi.hoisted(() => vi.fn());
vi.mock("./comments/CommentPreview", () => ({ CommentPreview: ({ project }: { project: { entry: string; files: Record<string, string> } }) => {
  mounted(project.entry);
  return createElement("textarea", { "aria-label": project.entry, defaultValue: project.files[project.entry] });
} }));

it("keeps visited previews mounted at their layout size while switching pages", async () => {
  const props = { project: STARTER, provider: { id: "host", label: "Host", saveLabel: "Save", read: vi.fn(), save: vi.fn(), saveLocks: vi.fn() }, runtimeOrigin: "https://runtime.example", theme: { theme: "light", density: "compact" } as const, onLock: vi.fn(), onError: vi.fn() };
  const element = document.createElement("div"); document.body.append(element);
  const root = createRoot(element);
  try {
    await act(() => root.render(createElement(PreviewPages, props)));
    const diagram = element.querySelector('textarea[aria-label="diagram.tsx"]')!;
    await act(() => root.render(createElement(PreviewPages, { ...props, project: { ...STARTER, entry: "notes.tsx" } })));
    expect({ retained: diagram === element.querySelector('textarea[aria-label="diagram.tsx"]'), visibility: diagram.parentElement!.style.visibility, removedFromLayout: diagram.parentElement!.hasAttribute("hidden") }).toEqual({ retained: true, visibility: "hidden", removedFromLayout: false });
    await act(() => root.render(createElement(PreviewPages, props)));
    expect({ retained: diagram === element.querySelector('textarea[aria-label="diagram.tsx"]'), visibility: diagram.parentElement!.style.visibility }).toEqual({ retained: true, visibility: "visible" });
  } finally { await act(() => root.unmount()); element.remove(); }
});
