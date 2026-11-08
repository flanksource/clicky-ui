import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { cssPath, resolveAnchor } from "./anchoring/dom-anchor";
import { VocabularyPreview } from "./VocabularyPreview";

describe("VocabularyPreview", () => {
  it("marks the preview and comment anchor without adding visual chrome", () => {
    render(<VocabularyPreview id="box/header"><span>Header specimen</span></VocabularyPreview>);
    const marker = screen.getByText("Header specimen").parentElement!;
    expect({
      tag: marker.tagName,
      preview: marker.getAttribute("data-vocabulary-preview"),
      anchor: marker.getAttribute("data-comment-anchor"),
      className: marker.className,
    }).toEqual({ tag: "DIV", preview: "box/header", anchor: "vocabulary:box/header", className: "inline-block max-w-full" });
  });

  it("merges the caller's classes", () => {
    render(<VocabularyPreview id="box/outlined" className="block p-2">Outlined specimen</VocabularyPreview>);
    expect(screen.getByText("Outlined specimen")).toHaveClass("block", "max-w-full", "p-2");
    expect(screen.getByText("Outlined specimen")).not.toHaveClass("inline-block");
  });

  it("round-trips a picked marker through the existing DOM comment anchor", () => {
    const { container } = render(<VocabularyPreview id="box/header">Header specimen</VocabularyPreview>);
    const marker = screen.getByText("Header specimen");
    const anchor = cssPath(marker, container);
    expect(anchor).toContain("data-comment-anchor");
    expect(resolveAnchor(container, anchor)).toBe(marker);
  });
});
