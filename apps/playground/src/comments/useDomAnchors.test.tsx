import { cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { cssPath } from "./dom-anchor";
import { useDomAnchors } from "./useDomAnchors";
import type { PlaygroundComment } from "./useComments";

const SVG_LABEL = "Kubernetes cluster";

function mountSvg() {
  document.body.innerHTML = `
    <div id="scroll">
      <main id="artifact">
        <figure><svg viewBox="0 0 100 40"><g><text x="4" y="20">${SVG_LABEL}</text></g></svg></figure>
      </main>
    </div>`;
  const scroll = document.querySelector<HTMLElement>("#scroll")!;
  const content = document.querySelector<HTMLElement>("#artifact")!;
  const text = content.querySelector("text")!;
  return { scroll, content, text };
}

afterEach(() => {
  cleanup();
  document.body.innerHTML = "";
});

describe("useDomAnchors", () => {
  it("registers a comment anchored on an SVG element instead of orphaning it", async () => {
    const { scroll, content, text } = mountSvg();
    const anchor = cssPath(text, content);
    const comments: PlaygroundComment[] = [
      { id: "c1", body: "rename this zone", createdAt: "2026-11-04T15:00:00Z", author: null, status: "open", anchor },
    ];
    const registerAnchor = vi.fn();

    const { result } = renderHook(() =>
      useDomAnchors({ scrollRef: { current: scroll }, contentRef: { current: content } }, comments, registerAnchor),
    );

    await waitFor(() => expect(registerAnchor).toHaveBeenCalledWith(anchor, text));
    expect({ orphans: result.current.orphans, label: result.current.labels[anchor] }).toEqual({
      orphans: [],
      label: `text "${SVG_LABEL}"`,
    });
  });
});
