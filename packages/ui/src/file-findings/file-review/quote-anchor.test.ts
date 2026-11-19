import { beforeEach, describe, expect, it } from "vitest";
import {
  captureTextQuote,
  locateSelection,
  locateSourceSelection,
  markdownOutline,
  parseQuoteAnchor,
  quoteAnchor,
  quoteLiesInLines,
  resolveQuote,
  resolveQuoteInLines,
  sourceSpans,
} from "./quote-anchor";

// The rendered form of LINES, as `Markdown sourceBlocks` tags each top-level block.
const LINES = [
  "# Runbook", // 1
  "", // 2
  "## Deploy", // 3
  "", // 4
  "Check the **error** rate, then roll back.", // 5
  "", // 6
  "## Rollback", // 7
  "", // 8
  "Check the error rate again.", // 9
];

const HTML = `
  <h1 data-source-start="1" data-source-end="1">Runbook</h1>
  <h2 data-source-start="3" data-source-end="3">Deploy</h2>
  <p data-source-start="5" data-source-end="5">Check the <strong>error</strong> rate, then roll back.</p>
  <h2 data-source-start="7" data-source-end="7">Rollback</h2>
  <p data-source-start="9" data-source-end="9">Check the error rate again.</p>`;

let root: HTMLElement;

beforeEach(() => {
  document.body.innerHTML = `<div id="doc">${HTML}</div>`;
  root = document.getElementById("doc")!;
});

const paragraph = (line: number) => root.querySelector<HTMLElement>(`[data-source-start="${line}"]`)!;

/** A range over the first occurrence of `text` within one text node of `el`. */
function rangeOver(el: Element, text: string): Range {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    const at = node.data.indexOf(text);
    if (at < 0) continue;
    const range = document.createRange();
    range.setStart(node, at);
    range.setEnd(node, at + text.length);
    return range;
  }
  throw new Error(`"${text}" is not inside one text node`);
}

describe("markdownOutline", () => {
  it("gives every top-level block the heading trail above it and its first source line", () => {
    expect(markdownOutline(root).map(({ path, line }) => ({ path, line }))).toEqual([
      { path: ["Runbook"], line: 1 },
      { path: ["Runbook", "Deploy"], line: 3 },
      { path: ["Runbook", "Deploy"], line: 5 },
      { path: ["Runbook", "Rollback"], line: 7 },
      { path: ["Runbook", "Rollback"], line: 9 },
    ]);
  });
});

describe("quote anchors", () => {
  it("round-trips a locator through its anchor string", () => {
    const locator = { path: ["Runbook", "Deploy"], prefix: "Check the", quote: "error rate", suffix: "then roll" };
    expect(parseQuoteAnchor(quoteAnchor(locator))).toEqual(locator);
  });

  it("locates a selection with its section and two words of context on each side", () => {
    expect(locateSelection(root, rangeOver(paragraph(9), "error rate"))).toEqual({
      path: ["Runbook", "Rollback"],
      prefix: "Check the",
      quote: "error rate",
      suffix: "again.",
    });
  });

  it("resolves the same words to the section the locator names, not their first occurrence", () => {
    const range = resolveQuote(root, { path: ["Runbook", "Rollback"], prefix: "Check the", quote: "error rate", suffix: "again." });
    expect(paragraph(9).contains(range!.startContainer)).toBe(true);
  });

  it("still resolves after the heading is renamed, by the full context", () => {
    paragraph(7).textContent = "Undo";
    const range = resolveQuote(root, { path: ["Runbook", "Rollback"], prefix: "Check the", quote: "error rate", suffix: "again." });
    expect(range?.toString()).toBe("error rate");
  });

  it("returns null once the quoted words are gone", () => {
    paragraph(9).textContent = "Check the latency.";
    expect(resolveQuote(root, { path: ["Runbook", "Rollback"], prefix: "Check the", quote: "error rate", suffix: "again." })).toBeNull();
  });
});

describe("quotes held by a patch", () => {
  const quote = { prefix: "Check the", exact: "error rate", suffix: "again." };

  it("captures a selection as the words with the words around them", () => {
    expect(captureTextQuote(root, rangeOver(paragraph(9), "error rate"))).toEqual(quote);
  });

  it("captures nothing for a selection spanning blocks", () => {
    const range = rangeOver(paragraph(5), "rate, then");
    range.setEnd(paragraph(9).firstChild!, 3);
    expect(captureTextQuote(root, range)).toBeNull();
  });

  it("finds the quote again inside the lines the patch matches now, and only there", () => {
    expect({
      inside: resolveQuoteInLines(root, { start: 9, end: 9 }, quote)?.toString(),
      // "again" is only on line 9: a patch that matches line 5 does not search line 9's block.
      elsewhere: resolveQuoteInLines(root, { start: 5, end: 5 }, { prefix: "rate", exact: "again", suffix: "." }),
    }).toEqual({ inside: "error rate", elsewhere: null });
  });

  it("searches only a table's rows on the patch lines, so words repeated in another row stay unambiguous", () => {
    // Header on line 11, delimiter on 12, body rows on 13 and 14.
    root.insertAdjacentHTML(
      "beforeend",
      `<div data-source-start="11" data-source-end="14"><table>
        <thead><tr><th>Check</th><th>State</th></tr></thead>
        <tbody><tr><td>disk</td><td>ok</td></tr><tr><td>cpu</td><td>ok</td></tr></tbody>
      </table></div>`,
    );
    const range = resolveQuoteInLines(root, { start: 14, end: 14 }, { prefix: "", exact: "ok", suffix: "" });
    expect(range?.startContainer.parentElement?.closest("tr")?.textContent).toBe("cpuok");
  });

  it("returns null once the quoted words are gone from the patch lines, so the highlight falls back to the lines", () => {
    paragraph(9).textContent = "Check the latency again.";
    expect(resolveQuoteInLines(root, { start: 9, end: 9 }, quote)).toBeNull();
  });

  it("still finds it when the words around it were edited, as long as it occurs once in the lines", () => {
    paragraph(9).textContent = "Please check the error rate once more.";
    expect(resolveQuoteInLines(root, { start: 9, end: 9 }, quote)?.toString()).toBe("error rate");
  });

  it("requires the quote's exact text verbatim in the patch's source lines, so inline markdown formatting disqualifies it", () => {
    // LINES[4] is "Check the **error** rate, then roll back.": rendered text "error rate" is not in the source.
    expect({
      verbatim: quoteLiesInLines({ prefix: "", exact: "rate, then roll back", suffix: "" }, [LINES[4]!]),
      acrossFormatting: quoteLiesInLines({ prefix: "", exact: "error rate, then", suffix: "" }, [LINES[4]!]),
      acrossLines: quoteLiesInLines({ prefix: "", exact: "roll back", suffix: "" }, [LINES[4]!, LINES[8]!]),
      elsewhere: quoteLiesInLines({ prefix: "", exact: "latency", suffix: "" }, [LINES[4]!, LINES[8]!]),
      empty: quoteLiesInLines({ prefix: "", exact: "", suffix: "" }, [LINES[4]!]),
    }).toEqual({ verbatim: true, acrossFormatting: false, acrossLines: true, elsewhere: false, empty: false });
  });

  it("captures a selection across inline formatting as rendered text, which then fails the source check", () => {
    const range = rangeOver(paragraph(5), "rate, then");
    range.setStart(paragraph(5).firstChild!, "Check ".length);
    const captured = captureTextQuote(root, range)!;
    expect({ exact: captured.exact, inSource: quoteLiesInLines(captured, [LINES[4]!]) }).toEqual({ exact: "the error rate, then", inSource: false });
  });
});

describe("source mapping", () => {
  it("places a quote across rendered markup on its source line and columns", () => {
    const locator = locateSelection(root, rangeOver(paragraph(5), "rate, then"))!;
    const line = LINES[4]!;
    const start = line.indexOf("rate, then");
    expect(sourceSpans(root, LINES, locator)).toEqual([{ line: 5, start, end: start + "rate, then".length }]);
  });

  it("maps a selection in the raw source onto the rendered quote", () => {
    const line = LINES[8]!;
    const start = line.indexOf("error rate");
    expect(locateSourceSelection(root, LINES, { line: 9, start, end: start + "error rate".length })).toEqual({
      path: ["Runbook", "Rollback"],
      prefix: "Check the",
      quote: "error rate",
      suffix: "again.",
    });
  });
});
