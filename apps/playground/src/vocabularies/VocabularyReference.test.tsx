import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ThemeProvider } from "@flanksource/clicky-ui";
import { VocabularyProvider } from "./config";
import { VocabularyReference } from "./VocabularyReference";

afterEach(() => { cleanup(); localStorage.clear(); vi.unstubAllGlobals(); });
it("shows the image, label, id, description, Markdown instructions, references and marked page link", async () => {
  const item = { catalog: "shapes", type: "shape", id: "shape/decision", label: "Decision", description: "A branching decision", references: ["shapes/index.tsx"] };
  const catalog = { alias: "shapes", slug: "vocabularies/shapes", file: "shapes/index.tsx", page: "/shapes/index.tsx", instructions: "Read **shapes** as geometry.", previewRevision: "one" };
  localStorage.setItem("clicky-playground.vocabulary-previews.shapes", JSON.stringify({ previewRevision: "one", images: { [item.id]: { image: "data:image/webp;base64,YQ==", width: 180, height: 90 } } }));
  vi.stubGlobal("fetch", vi.fn(async (url: string) => Response.json(url === "/__playground/connections" ? { connections: [] } : { revision: "one", items: [item], catalogs: [catalog] })));
  render(<ThemeProvider><VocabularyProvider><VocabularyReference id="shapes:shape/decision" /></VocabularyProvider></ThemeProvider>);
  await screen.findByRole("img", { name: "Decision" });
  expect(screen.getByRole("heading", { name: "Decision" })).toBeTruthy();
  expect(screen.getByText("shapes:shape/decision")).toBeTruthy();
  expect(screen.getByText(item.description)).toBeTruthy();
  expect(await screen.findByText("shapes", { selector: '[data-streamdown="strong"]' })).toBeTruthy();
  expect(screen.getByText("shapes/index.tsx")).toBeTruthy();
  expect(screen.getByRole("link", { name: "Open in vocabulary page" }).getAttribute("href")).toBe("?page=vocabularies%2Fshapes&anchor=vocabulary%3Ashape%2Fdecision");
});
