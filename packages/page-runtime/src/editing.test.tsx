// @vitest-environment jsdom
import { act, createElement, useState } from "react";
import { createRoot } from "react-dom/client";
import { expect, it } from "vitest";
import { editableElement, EditingScope, setRemoved } from "./editing";

it("removes only the selected boundary and can restore it after a failed write", async () => {
  const container = document.createElement("div");
  document.body.append(container);
  const root = createRoot(container);
  function Counter() { const [count, setCount] = useState(0); return createElement("button", { onClick: () => setCount(count + 1) }, count); }
  await act(() => root.render(createElement("main", null, editableElement(createElement("article", { "data-review-id": "delete-me" }, "Target")), createElement(Counter))));
  await act(() => container.querySelector("button")!.click());
  await act(() => setRemoved("review:delete-me", true));
  expect(container.textContent).toBe("1");
  await act(() => setRemoved("review:delete-me", false));
  expect(container.textContent).toBe("Target1");
  await act(() => root.unmount());
  container.remove();
});

it("keeps review deletion scoped to the owning page when IDs are reused", async () => {
  const container = document.createElement("div");
  const root = createRoot(container);
  const pages = ["first", "second"].map(scope => createElement(EditingScope, { scope, key: scope, children: editableElement(createElement("article", { "data-review-id": "summary" }, scope)) }));
  await act(() => root.render(pages));
  await act(() => setRemoved("review:first:summary", true));
  expect(container.textContent).toBe("second");
  await act(() => setRemoved("review:first:summary", false));
  await act(() => root.unmount());
});
