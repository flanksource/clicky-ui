// @vitest-environment jsdom

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { App } from "./App";

vi.mock("./comments/useComments", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("./comments/useComments")>();
  return {
    ...actual,
    useComments: () => ({
      comments: [],
      allComments: [],
      error: null,
      create: vi.fn(),
      reply: vi.fn(),
      updateStatus: vi.fn(),
      updateRating: vi.fn(),
      remove: vi.fn(),
    }),
  };
});

vi.mock("./registry", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./registry")>();
  return { ...actual, preloadMeta: vi.fn() };
});

vi.mock("./PlaygroundShell", () => ({
  PlaygroundShell: ({
    onNavigate,
    onViewChange,
    onAnnotationsChange,
    view,
    annotations,
  }: {
    onNavigate?: (slug?: string) => void;
    onViewChange: (view: "preview" | "markdown") => void;
    onAnnotationsChange: (annotations: "visible" | "hidden") => void;
    view: "preview" | "markdown";
    annotations: "visible" | "hidden";
  }) => (
    <>
      <span>{`${view}:${annotations}`}</span>
      <button
        type="button"
        onClick={() => onNavigate?.("flanksource/foundations/colors")}
      >
        Complete move
      </button>
      <button type="button" onClick={() => onViewChange("markdown")}>
        Markdown
      </button>
      <button type="button" onClick={() => onAnnotationsChange("hidden")}>
        Hide
      </button>
    </>
  ),
}));

describe("playground page navigation", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    window.history.replaceState(null, "", "/?page=welcome");
  });
  afterEach(cleanup);

  it("updates history after a move without assigning a new document location", () => {
    const pushState = vi.spyOn(window.history, "pushState");
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Complete move" }));

    expect(pushState).toHaveBeenCalledWith(
      null,
      "",
      "?page=flanksource%2Ffoundations%2Fcolors",
    );
    expect(window.location.search).toBe(
      "?page=flanksource%2Ffoundations%2Fcolors",
    );
  });

  it("persists view and annotation state through page-management navigation", () => {
    window.history.replaceState(
      null,
      "",
      "/?page=welcome&view=markdown&annotations=hidden",
    );
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Complete move" }));

    expect(window.location.search).toBe(
      "?page=flanksource%2Ffoundations%2Fcolors&view=markdown&annotations=hidden",
    );
  });

  it("writes non-default view state and keeps defaults canonical", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Markdown" }));
    expect(window.location.search).toBe("?page=welcome&view=markdown");

    fireEvent.click(screen.getByRole("button", { name: "Hide" }));
    expect(window.location.search).toBe(
      "?page=welcome&view=markdown&annotations=hidden",
    );
  });
});
