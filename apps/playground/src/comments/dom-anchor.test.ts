import { beforeEach, describe, expect, it } from "vitest";

import { commentAnchor, overlayLabel, resolveAnchor } from "./dom-anchor";

const DIALOG_TITLE = 'Gross "net" = 12';
const DIALOG_ANCHOR = `[role="dialog"][aria-label="Gross \\"net\\" = 12"] >> :scope > ol:nth-child(1) > li:nth-child(2)`;

function mount() {
  document.body.innerHTML = `
    <main id="artifact"><p>page</p></main>
    <div role="presentation">
      <div role="dialog" aria-label=${JSON.stringify(DIALOG_TITLE).replace(/\\"/g, "&quot;")}>
        <ol><li data-step="8">eight</li><li data-step="9">nine</li></ol>
      </div>
    </div>
    <div role="dialog"><span id="untitled">untitled</span></div>
    <aside><span id="outside">outside</span></aside>`;
  const content = document.querySelector<HTMLElement>("#artifact");
  if (!content) throw new Error("artifact missing");
  return content;
}

describe("commentAnchor", () => {
  let content: HTMLElement;
  beforeEach(() => {
    content = mount();
  });

  it("keys elements inside the artifact on a path from the artifact", () => {
    expect(commentAnchor(content.querySelector("p")!, content)).toBe(
      ":scope > p:nth-child(1)",
    );
  });

  it("keys elements in a portaled titled dialog on the dialog label", () => {
    expect(
      commentAnchor(document.querySelector('[data-step="9"]')!, content),
    ).toBe(DIALOG_ANCHOR);
  });

  it("rejects untitled dialogs and elements outside the artifact", () => {
    expect([
      commentAnchor(document.querySelector("#untitled")!, content),
      commentAnchor(document.querySelector("#outside")!, content),
    ]).toEqual([null, null]);
  });
});

describe("resolveAnchor with dialog anchors", () => {
  it("finds the element while the dialog is open and null once it closes", () => {
    const content = mount();
    const open = resolveAnchor(content, DIALOG_ANCHOR);
    document.querySelector('[role="presentation"]')!.remove();
    expect([open?.textContent, resolveAnchor(content, DIALOG_ANCHOR)]).toEqual(
      ["nine", null],
    );
  });
});

describe("overlayLabel", () => {
  it("returns the dialog title for dialog anchors and null for artifact anchors", () => {
    expect([
      overlayLabel(DIALOG_ANCHOR),
      overlayLabel(":scope > p:nth-child(1)"),
    ]).toEqual([DIALOG_TITLE, null]);
  });
});
