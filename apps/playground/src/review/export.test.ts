import { afterEach, describe, expect, it } from "vitest";

import { contentBounds, reviewContent, standaloneHtml } from "./export";

describe("contentBounds", () => {
  const WHITE = [255, 255, 255, 255] as const;
  const INK = [20, 20, 20, 255] as const;
  // Antialiasing noise within tolerance still counts as background.
  const NEAR_WHITE = [250, 250, 250, 255] as const;

  function image(width: number, height: number, ink: Array<[number, number]>) {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let index = 0; index < width * height; index++)
      data.set(index === 0 ? NEAR_WHITE : WHITE, index * 4);
    for (const [x, y] of ink) data.set(INK, (y * width + x) * 4);
    return { data, width, height };
  }

  it("crops to the outermost non-background pixels", () => {
    expect(
      contentBounds(
        image(10, 8, [
          [2, 3],
          [6, 5],
        ]),
        WHITE,
      ),
    ).toEqual({ x: 2, y: 3, width: 5, height: 3 });
  });

  it("returns null when every pixel is background", () => {
    expect(contentBounds(image(4, 4, []), WHITE)).toBeNull();
  });
});

describe("reviewContent", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  function render(html: string): HTMLElement {
    document.body.innerHTML = html;
    return document.querySelector<HTMLElement>('[data-review-id="outer"]')!;
  }

  it("captures the review panel content, not the header", () => {
    const outer = render(`
      <section data-review-id="outer">
        <h3>Detail card</h3>
        <div class="panel"><div data-review-content id="panel">Body</div></div>
      </section>`);
    expect(reviewContent(outer).id).toBe("panel");
  });

  it("skips panels that belong to a nested reviewable", () => {
    const outer = render(`
      <section data-review-id="outer">
        <section data-review-id="inner">
          <div data-review-content id="inner-panel">Inner</div>
        </section>
      </section>`);
    expect(reviewContent(outer)).toBe(outer);
  });
});

describe("standaloneHtml", () => {
  afterEach(() => {
    document.head.innerHTML = "";
    document.body.innerHTML = "";
    document.documentElement.removeAttribute("data-theme");
  });

  it("keeps the element, page styles and root theme attributes", () => {
    document.documentElement.setAttribute("data-theme", "dark");
    document.body.className = "bg-background";
    const style = document.createElement("style");
    style.textContent = ".card { color: red; }";
    document.head.append(style);
    const card = document.createElement("section");
    card.className = "card";
    card.dataset.reviewId = "card";
    card.textContent = "Quarterly <summary>";
    document.body.append(card);

    const parsed = new DOMParser().parseFromString(
      standaloneHtml(card, "page-card", { x: 6, y: 4, width: 120, height: 30 }),
      "text/html",
    );

    expect({
      theme: parsed.documentElement.dataset.theme,
      bodyClass: parsed.body.className,
      title: parsed.title,
      css: parsed.querySelector("style")?.textContent,
      clip: (parsed.body.firstElementChild as HTMLElement).style.cssText,
      offset: (parsed.body.firstElementChild?.firstElementChild as HTMLElement)
        .style.margin,
      element: parsed.querySelector("section")?.outerHTML,
    }).toEqual({
      theme: "dark",
      bodyClass: "bg-background",
      title: "page-card",
      css: ".card {color: red;}",
      clip: "overflow: hidden; width: 120px; height: 30px;",
      offset: "-4px 0px 0px -6px",
      element: card.outerHTML,
    });
  });
});
