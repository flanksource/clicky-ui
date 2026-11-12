// @vitest-environment jsdom
import * as React from "react";
import * as client from "react-dom/client";
import * as dom from "react-dom";
import { expect, it } from "vitest";
import { mountPage } from "./mount-page.ts";
import type { JsonValue } from "../schema.ts";

it("commits data updates inside the same layout and preserves page component state", async () => {
  const root = document.createElement("div"); document.body.append(root);
  let mounts = 0;
  function Page({ data }: { data: JsonValue }) {
    const [state] = React.useState(() => ++mounts);
    return React.createElement("p", null, `${String(data)}:${state}`);
  }
  const renderer = mountPage({ module: { default: Page }, layout: { default: ({ children }) => React.createElement("section", null, children) }, runtime: [React, client, dom], data: "first", file: "report.tsx", root, wrap: child => child });
  try {
    await renderer.mounted;
    const section = root.querySelector("section");
    await renderer.update("second");
    expect({ text: root.textContent, sameLayout: root.querySelector("section") === section, mounts }).toEqual({ text: "second:1", sameLayout: true, mounts: 1 });
  } finally { renderer.unmount(); root.remove(); }
});

it("reports falsy render exceptions and recovers on corrected data", async () => {
  const root = document.createElement("div"); document.body.append(root);
  function Page({ data }: { data: JsonValue }) {
    if (data === "broken") throw 0;
    return React.createElement("p", null, String(data));
  }
  const renderer = mountPage({ module: { default: Page }, runtime: [React, client, dom], data: "first", file: "report.tsx", root, wrap: child => child });
  try {
    await renderer.mounted;
    await expect(renderer.update("broken")).rejects.toMatchObject({ detail: { phase: "render", file: "report.tsx" } });
    await renderer.update("corrected");
    expect(root.textContent).toBe("corrected");
  } finally { renderer.unmount(); root.remove(); }
});

it("reconciles a replacement page inside the existing layout without clearing its DOM", async () => {
  const root = document.createElement("div"); document.body.append(root);
  const layout = { default: ({ children }: { children: React.ReactNode }) => React.createElement("section", null, React.createElement("header", null, "Stable header"), children) };
  const renderer = mountPage({ module: { default: () => React.createElement("p", null, "Original") }, layout, runtime: [React, client, dom], data: null, file: "report.tsx", root, wrap: child => child });
  try {
    await renderer.mounted;
    const header = root.querySelector("header");
    await renderer.replace({ module: { default: () => React.createElement("p", null, "Updated") }, layout, data: null });
    expect({ text: root.textContent, sameHeader: root.querySelector("header") === header }).toEqual({ text: "Stable headerUpdated", sameHeader: true });
  } finally { renderer.unmount(); root.remove(); }
});
