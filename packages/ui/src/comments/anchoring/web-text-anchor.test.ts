import { beforeEach, describe, expect, it } from "vitest";
import { captureWebText, resolveWebText, type WebTextAnchor } from "./web-text-anchor";

const PAGE = `
  <main id="page">
    <section>
      <h2>Pricing</h2>
      <p id="pro">The <b>Pro</b> plan costs 20 dollars per month, billed yearly.</p>
      <p id="team">The Team plan costs 20 dollars per month, billed monthly.</p>
    </section>
    <section>
      <h2>Support</h2>
      <p id="sla">Answers within one business day.</p>
    </section>
  </main>`;

let root: HTMLElement;

beforeEach(() => {
  document.body.innerHTML = PAGE;
  root = document.getElementById("page")!;
});

/** A range over the first occurrence of `text` in `el`'s text, which may span text nodes. */
function select(el: Element, text: string): Range {
  const nodes: Text[] = [];
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) nodes.push(node);
  const whole = nodes.map((node) => node.data).join("");
  const from = whole.indexOf(text);
  if (from < 0) throw new Error(`"${text}" is not in ${el.id}`);
  const locate = (offset: number) => {
    let seen = 0;
    for (const node of nodes) {
      if (offset <= seen + node.length) return [node, offset - seen] as const;
      seen += node.length;
    }
    throw new Error("offset outside the element");
  };
  const range = document.createRange();
  range.setStart(...locate(from));
  range.setEnd(...locate(from + text.length));
  return range;
}

function capture(el: Element, text: string): WebTextAnchor {
  const anchor = captureWebText(select(el, text), root);
  if (!anchor) throw new Error("no anchor captured");
  return anchor;
}

describe("captureWebText", () => {
  it("stores the exact words with the text around them, plus locators of the element holding them", () => {
    const anchor = capture(root.querySelector("#pro")!, "plan costs 20 dollars");
    expect({
      quote: anchor.quote,
      locatorKinds: [...new Set(anchor.locators.map((locator) => locator.kind))].sort(),
    }).toEqual({
      quote: { prefix: "The Pro ", exact: "plan costs 20 dollars", suffix: " per month, billed yearly." },
      locatorKinds: ["css", "text"],
    });
  });

  it("holds a selection that spans several elements in the nearest element containing all of it", () => {
    const anchor = capture(root.querySelector("#pro")!, "Pro plan");
    expect(anchor.quote.exact).toBe("Pro plan");
    expect(resolveWebText(root, anchor)).toMatchObject({ state: "matched" });
  });

  it("captures nothing for a collapsed selection or one outside the root", () => {
    const collapsed = select(root.querySelector("#pro")!, "plan");
    collapsed.collapse(true);
    const outside = document.createElement("p");
    outside.textContent = "elsewhere";
    document.body.append(outside);
    const range = document.createRange();
    range.selectNodeContents(outside);
    expect([captureWebText(collapsed, root), captureWebText(range, root)]).toEqual([null, null]);
  });
});

describe("resolveWebText", () => {
  it("finds the quote again after unrelated DOM changes: new siblings, a banner, rewrapped markup", () => {
    const anchor = capture(root.querySelector("#team")!, "Team plan costs 20 dollars");
    const banner = document.createElement("div");
    banner.textContent = "Sale ends soon";
    root.prepend(banner);
    const extra = document.createElement("p");
    extra.textContent = "A new paragraph before the plans.";
    root.querySelector("h2")!.after(extra);
    root.querySelector("#team")!.className = "highlighted";
    const match = resolveWebText(root, anchor);
    expect(match.state).toBe("matched");
    if (match.state !== "matched") return;
    expect({ text: match.range.toString(), element: match.element.id }).toEqual({ text: "Team plan costs 20 dollars", element: "team" });
  });

  it("tells repeated words apart by the text around them", () => {
    const anchor = capture(root.querySelector("#team")!, "costs 20 dollars");
    const match = resolveWebText(root, anchor);
    expect(match.state === "matched" && match.element.id).toBe("team");
  });

  it("finds the quote across a text node boundary and through collapsed whitespace", () => {
    const anchor = capture(root.querySelector("#pro")!, "The Pro plan");
    root.querySelector("#pro")!.innerHTML = "The\n   <b>Pro</b>   plan costs 20 dollars per month, billed yearly.";
    const match = resolveWebText(root, anchor);
    expect(match.state === "matched" && match.range.toString().replace(/\s+/g, " ")).toBe("The Pro plan");
  });

  it("reports orphaned when the text is gone, even though its element is still there", () => {
    const anchor = capture(root.querySelector("#sla")!, "within one business day");
    root.querySelector("#sla")!.textContent = "Answers on request.";
    expect(resolveWebText(root, anchor)).toEqual({ state: "orphaned" });
  });

  it("reports orphaned when the element is gone", () => {
    const anchor = capture(root.querySelector("#sla")!, "within one business day");
    root.querySelector("#sla")!.remove();
    expect(resolveWebText(root, anchor)).toEqual({ state: "orphaned" });
  });

  it("reports moved when the locators disagree about which element holds the quote", () => {
    const anchor = capture(root.querySelector("#sla")!, "within one business day");
    // The stored `#sla` selector now hits another paragraph; the text locators still vote for the original.
    root.querySelector("#sla")!.id = "support-sla";
    root.querySelector("#team")!.id = "sla";
    const match = resolveWebText(root, anchor);
    expect(match.state === "moved" && match.element.id).toBe("support-sla");
  });

  it("reports ambiguous when the quote still occurs more than once and its context is gone", () => {
    root.querySelector("#pro")!.textContent = "plan plan";
    const anchor: WebTextAnchor = {
      quote: { prefix: "gone before", exact: "plan", suffix: "gone after" },
      locators: [{ kind: "css", selector: "#pro" }],
    };
    expect(resolveWebText(root, anchor)).toMatchObject({ state: "ambiguous" });
  });
});
