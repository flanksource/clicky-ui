import { beforeEach, describe, expect, it } from "vitest";

import {
  COMMENT_ELEMENT_HTML_TRUNCATION,
  type CommentLocator,
} from "./model";
import {
  ELEMENT_PREFIX,
  captureLocators,
  commentAnchor,
  cssPath,
  elementAnchor,
  isElementAnchor,
  isGeneratedId,
  legacyLocators,
  nearestHeading,
  overlayLabel,
  parseElementAnchor,
  resolveAnchor,
  resolveComment,
  resolveElementAnchor,
} from "./dom-anchor";

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

  it("keys elements inside the artifact on a selector resolved from the artifact", () => {
    const paragraph = content.querySelector("p")!;
    const anchor = commentAnchor(paragraph, content)!;
    expect([overlayLabel(anchor), resolveAnchor(content, anchor)]).toEqual([
      null,
      paragraph,
    ]);
  });

  it("keys SVG elements inside the artifact on a selector that resolves back to them", () => {
    content.innerHTML = `<svg viewBox="0 0 10 10"><g><rect width="4" height="4"></rect><text>zone</text></g></svg>`;
    const text = content.querySelector("text")!;
    const anchor = commentAnchor(text, content)!;
    expect([overlayLabel(anchor), resolveAnchor(content, anchor)]).toEqual([
      null,
      text,
    ]);
  });

  it("keys elements in a portaled titled dialog on the dialog label", () => {
    const step = document.querySelector('[data-step="9"]')!;
    const anchor = commentAnchor(step, content)!;
    expect([overlayLabel(anchor), resolveAnchor(content, anchor)]).toEqual([
      DIALOG_TITLE,
      step,
    ]);
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

describe("resolveAnchor with named anchors", () => {
  it("resolves a raw data-comment-anchor value that is not a valid selector", () => {
    const content = document.createElement("div");
    content.innerHTML = '<div data-comment-anchor="vocabulary:oipa-symbol/badge">badge</div>';
    document.body.append(content);
    expect([resolveAnchor(content, "vocabulary:oipa-symbol/badge")?.textContent, resolveAnchor(content, "vocabulary:missing")]).toEqual(["badge", null]);
    content.remove();
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

const GENERATED_PREFIX = "r1n7";
const SHIFTED_PREFIX = "r2a4";
const SHARED_TEXT = "Primary";

/** A brand page in miniature: a diagram keyed on a React useId prefix, specimen sections and a card that repeat the same text, an opt-in anchor, and a labelled control. */
function mountPage() {
  document.body.innerHTML = `
    <main id="artifact">
      <section id="how-it-works">
        <figure>
          <div id="${GENERATED_PREFIX}-serve"><span>uir  serve</span></div>
          <figcaption>Into UIR</figcaption>
        </figure>
      </section>
      <section id="lockups">
        <div><h2>Lockups</h2><p>Every layout</p></div>
        <p>${SHARED_TEXT}</p>
        <article><h3>Serve</h3><div><p>${SHARED_TEXT}</p></div></article>
      </section>
      <section id="colour">
        <div><h2>Colour</h2></div>
        <p>${SHARED_TEXT}</p>
      </section>
      <div id="hero" data-comment-anchor="hero-card"><span>hero</span></div>
      <button aria-label="Save draft">Save</button>
    </main>`;
  const content = document.querySelector<HTMLElement>("#artifact");
  if (!content) throw new Error("artifact missing");
  const pick = (selector: string) => {
    const element = content.querySelector(selector);
    if (!element) throw new Error(`fixture is missing ${selector}`);
    return element;
  };
  return {
    content,
    serve: pick(`#${GENERATED_PREFIX}-serve > span`),
    cardText: pick("article p"),
    colourText: pick("#colour > p"),
    hero: pick("#hero"),
    save: pick("button"),
  };
}

describe("isGeneratedId", () => {
  it("flags React useId output and library ids but keeps authored ids", () => {
    const ids = [
      ":r1n7:",
      "«r1»",
      "_r_1n7_",
      `${GENERATED_PREFIX}-serve`,
      "rmr-store",
      "radix-r4",
      "headlessui-menu-3",
      "mui-12",
      "how-it-works",
      "jsf-makerprint_2d_scad-width",
      "lockups",
      "results",
    ];
    expect(Object.fromEntries(ids.map((id) => [id, isGeneratedId(id)]))).toEqual({
      ":r1n7:": true,
      "«r1»": true,
      "_r_1n7_": true,
      [`${GENERATED_PREFIX}-serve`]: true,
      "rmr-store": true,
      "radix-r4": true,
      "headlessui-menu-3": true,
      "mui-12": true,
      "how-it-works": false,
      "jsf-makerprint_2d_scad-width": false,
      lockups: false,
      results: false,
    });
  });
});

describe("cssPath", () => {
  it("never keys on a generated id and still resolves to the element", () => {
    const { content, serve } = mountPage();
    const path = cssPath(serve, content);
    expect([path.includes(GENERATED_PREFIX), resolveAnchor(content, path)]).toEqual([
      false,
      serve,
    ]);
  });

  it("prefers the data-comment-anchor opt-in over the element's id", () => {
    const { content, hero } = mountPage();
    expect(cssPath(hero, content)).toBe('[data-comment-anchor="hero-card"]');
  });

  it("keys a region on its empty data-* marker, so a banner inserted above it does not orphan it", () => {
    document.body.innerHTML = `
      <main id="artifact"><div><div class="tabs">tabs</div><div><div><div>title</div><div data-filter-bar="">pills</div></div></div></div></main>`;
    const content = document.querySelector<HTMLElement>("#artifact")!;
    const bar = content.querySelector("[data-filter-bar]")!;
    const anchor = cssPath(bar, content);
    content.insertAdjacentHTML("afterbegin", "<div>2 open comments no longer match</div>");
    expect({ anchor, resolved: resolveAnchor(content, anchor) }).toEqual({ anchor: '[data-filter-bar=""]', resolved: bar });
  });

  it("never keys on tooling markers or valued data-* attributes", () => {
    document.body.innerHTML = `
      <main id="artifact"><div><span>a</span><span data-react-grab-frozen="" data-review-target="" data-state="open">b</span></div></main>`;
    const content = document.querySelector<HTMLElement>("#artifact")!;
    expect(cssPath(content.querySelector("[data-state]")!, content)).not.toMatch(/data-/);
  });
});

describe("nearestHeading", () => {
  it("finds a card heading, a wrapped section heading and a figure caption, and nothing outside a block", () => {
    const { content, serve, cardText, colourText, save } = mountPage();
    expect(
      [serve, cardText, colourText, save].map((target) => nearestHeading(target, content)),
    ).toEqual([
      { selector: "figcaption", text: "Into UIR" },
      { selector: "h3", text: "Serve" },
      { selector: "h2", text: "Colour" },
      null,
    ]);
  });
});

describe("captureLocators", () => {
  it("keeps every locator that singles out the element and drops the ambiguous ones", () => {
    const { content, serve, cardText, save } = mountPage();
    expect({
      serve: captureLocators(serve, content),
      cardText: captureLocators(cardText, content),
      save: captureLocators(save, content),
    }).toEqual({
      serve: [
        { kind: "css", selector: expect.any(String) },
        { kind: "text", tag: "span", text: "uir serve", heading: { selector: "figcaption", text: "Into UIR" } },
        { kind: "text", tag: "span", text: "uir serve", scope: "#how-it-works" },
        { kind: "text", tag: "span", text: "uir serve" },
      ],
      // "Primary" appears three times on the page and twice inside #lockups,
      // so only the card heading narrows it to one element.
      cardText: [
        { kind: "css", selector: expect.any(String) },
        { kind: "text", tag: "p", text: SHARED_TEXT, heading: { selector: "h3", text: "Serve" } },
      ],
      save: [
        { kind: "css", selector: expect.any(String) },
        { kind: "role", tag: "button", role: "button", name: "Save draft" },
        { kind: "text", tag: "button", text: "Save" },
      ],
    });
  });
});

describe("resolveComment", () => {
  const underColour: CommentLocator = {
    kind: "text",
    tag: "p",
    text: SHARED_TEXT,
    heading: { selector: "h2", text: "Colour" },
  };
  const underServe: CommentLocator = {
    kind: "text",
    tag: "p",
    text: SHARED_TEXT,
    heading: { selector: "h3", text: "Serve" },
  };

  it("re-finds a diagram node after its generated id prefix shifts", () => {
    const { content, serve } = mountPage();
    const anchor = `#${GENERATED_PREFIX}-serve > span:nth-child(1)`;
    const locators = captureLocators(serve, content);
    serve.parentElement!.id = `${SHIFTED_PREFIX}-serve`;

    const match = resolveComment(content, anchor, locators);
    expect({
      element: match?.element,
      moved: match?.matchedBy !== "anchor",
      conflict: match?.conflict,
    }).toEqual({ element: serve, moved: true, conflict: false });
  });

  it("falls through a broken selector to the heading block that tells repeated text apart", () => {
    const { content, colourText } = mountPage();
    expect(
      resolveComment(content, "#gone", [{ kind: "css", selector: "#also-gone" }, underColour]),
    ).toEqual({ element: colourText, matchedBy: underColour, conflict: false });
  });

  it("flags a conflict and lets agreeing locators outvote a stale anchor", () => {
    const { content, colourText, cardText } = mountPage();
    const cardSelector: CommentLocator = { kind: "css", selector: "article p" };
    expect([
      resolveComment(content, "#colour > p", [underServe]),
      resolveComment(content, "#colour > p", [underServe, cardSelector]),
    ]).toEqual([
      { element: colourText, matchedBy: "anchor", conflict: true },
      { element: cardText, matchedBy: underServe, conflict: true },
    ]);
  });

  it("returns null when every locator is missing or ambiguous", () => {
    const { content } = mountPage();
    expect(
      resolveComment(content, "#gone", [{ kind: "text", tag: "p", text: SHARED_TEXT }]),
    ).toBeNull();
  });

  it("resolves a legacy comment from the HTML it stored, but not from truncated HTML", () => {
    const { content, serve } = mountPage();
    serve.parentElement!.id = `${SHIFTED_PREFIX}-serve`;
    const legacy = legacyLocators('<span class="node">uir serve</span>');
    expect({
      legacy,
      match: resolveComment(content, `#${GENERATED_PREFIX}-serve > span`, legacy)?.element,
      truncated: legacyLocators(`<span>uir serve${COMMENT_ELEMENT_HTML_TRUNCATION}`),
    }).toEqual({
      legacy: [{ kind: "text", tag: "span", text: "uir serve" }],
      match: serve,
      truncated: [],
    });
  });
});

describe("element anchors", () => {
  const locators: CommentLocator[] = [
    { kind: "css", selector: "#also-gone" },
    { kind: "text", tag: "p", text: SHARED_TEXT, heading: { selector: "h2", text: "Colour" } },
  ];

  it("hold the locators behind the e: prefix and round-trip", () => {
    const anchor = elementAnchor(locators);
    expect({ prefix: anchor.startsWith(ELEMENT_PREFIX), is: isElementAnchor(anchor), parsed: parseElementAnchor(anchor) }).toEqual({
      prefix: true,
      is: true,
      parsed: locators,
    });
  });

  it("resolve to the element the locators agree on, without a stored anchor", () => {
    const { content, colourText } = mountPage();
    expect(resolveElementAnchor(content, elementAnchor(locators))).toEqual({ element: colourText, matchedBy: locators[1], conflict: false });
  });

  it("resolve to null when every locator is gone", () => {
    const { content } = mountPage();
    expect(resolveElementAnchor(content, elementAnchor([{ kind: "css", selector: "#gone" }]))).toBeNull();
  });

  it("reject an empty locator list, another anchor kind and malformed JSON", () => {
    expect(() => elementAnchor([])).toThrow(/at least one locator/);
    expect(() => parseElementAnchor("r:{}")).toThrow(/expected an "e:" element anchor/);
    expect(() => parseElementAnchor("e:{oops")).toThrow(/not valid JSON/);
    expect(() => parseElementAnchor('e:[{"selector":"p"}]')).toThrow(/non-empty list of locators/);
  });
});
