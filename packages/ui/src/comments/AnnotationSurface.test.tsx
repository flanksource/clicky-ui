import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { setCommentDraft } from "../test/comment-editor";
import { parseElementAnchor } from "./anchoring/dom-anchor";
import { driftNote } from "./anchoring/drift";
import { AnnotationSurface } from "./AnnotationSurface";
import type { AnnotationCapture } from "./annotation-types";
import type { Comment } from "./comment-types";
afterEach(() => {
  sessionStorage.clear();
  vi.restoreAllMocks();
});
it("opens an empty file composer and restores the rail after closing", async () => {
  vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1200);
  render(
    <AnnotationSurface
      documentKey="file-test"
      comments={[]}
      captures={{}}
      view="source"
      onCreate={vi.fn()}
    >
      <p>File</p>
    </AnnotationSurface>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Comment on file" }));
  await waitFor(() =>
    expect(screen.getByTestId("comment-compose-input")).toBeVisible(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Close", exact: true }));
  fireEvent.click(
    screen.getByRole("button", { name: "Open comments", exact: true }),
  );
  expect(screen.getByTestId("comment-compose-input")).toBeVisible();
});
it("captures a selected element without triggering its action or exposing agent controls", async () => {
  const action = vi.fn(),
    prepare = vi.fn(async (capture: AnnotationCapture) => capture);
  render(
    <AnnotationSurface
      documentKey="selection-test"
      comments={[]}
      captures={{}}
      view="form"
      onCreate={vi.fn()}
      onPrepareCapture={prepare}
    >
      <button onClick={action}>Example field</button>
    </AnnotationSurface>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Comment on element" }));
  fireEvent.click(screen.getByRole("button", { name: "Example field" }));
  await waitFor(() =>
    expect(prepare).toHaveBeenCalledWith(
      expect.objectContaining({
        kind: "dom",
        view: "form",
        html: expect.stringContaining("Example field"),
      }),
    ),
  );
  expect(action).not.toHaveBeenCalled();
  expect(screen.queryByText(/Send to agent|Run agent|Prompt…/)).toBeNull();
});
describe("drift", () => {
  const comment = (id: string): Comment => ({ id, anchor: id, body: `Thread ${id}`, createdAt: "2026-01-01T00:00:00.000Z", author: { name: "Ada" } });
  const dom = (anchor: string, locators: AnnotationCapture["locators"]): AnnotationCapture => ({ kind: "dom", version: 1, view: "form", anchor, locators: locators ?? [], label: anchor });
  const captures: Record<string, AnnotationCapture> = {
    fine: dom("#a", [{ kind: "css", selector: "#a" }]),
    // The stored selector hits #a, but both locators single out #b: found, yet not where it was written.
    moved: dom("#a", [
      { kind: "css", selector: "#b" },
      { kind: "text", tag: "p", text: "B" },
    ]),
    gone: dom("#removed", []),
    lines: { kind: "code-range", version: 1, view: "form", location: { state: "outdated" } },
  };

  function surface(props: Partial<React.ComponentProps<typeof AnnotationSurface>> = {}) {
    render(
      <AnnotationSurface
        documentKey="drift-test"
        comments={["fine", "moved", "gone", "lines"].map(comment)}
        captures={captures}
        view="form"
        onCreate={vi.fn()}
        {...props}
      >
        <p id="a">A</p>
        <p id="b">B</p>
        <button type="button">Elsewhere</button>
      </AnnotationSurface>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Comments" }));
  }

  it("lists orphaned and moved dom threads with outdated patch threads in one drift list, and not the healthy one", async () => {
    surface();
    const rows = await waitFor(() => {
      const found = [...document.querySelectorAll<HTMLElement>("[data-drift-item]")];
      if (found.length < 3) throw new Error("drift not computed yet");
      return found;
    });
    expect(rows.map((row) => [row.dataset.driftItem, row.dataset.driftState])).toEqual([
      ["moved", "moved"],
      ["gone", "orphaned"],
      ["lines", "outdated"],
    ]);
  });

  it("offers Re-anchor on the dom threads only when the host retargets, calling onRetarget(id, anchor) with the element picked next", async () => {
    const onRetarget = vi.fn();
    surface({ onRetarget });
    await waitFor(() => expect(document.querySelector('[data-drift-item="gone"]')).not.toBeNull());
    const buttons = (id: string) => document.querySelectorAll(`[data-drift-item="${id}"] button`);
    const offered = { moved: [...buttons("moved")].some((b) => b.textContent === "Re-anchor"), lines: [...buttons("lines")].some((b) => b.textContent === "Re-anchor") };
    fireEvent.click(within(document.querySelector<HTMLElement>('[data-drift-item="gone"]')!).getByRole("button", { name: "Re-anchor" }));
    fireEvent.click(screen.getByRole("button", { name: "Elsewhere" }));
    await waitFor(() => expect(onRetarget).toHaveBeenCalledTimes(1));
    const [id, anchor] = onRetarget.mock.calls[0]!;
    expect({ offered, id, locators: parseElementAnchor(anchor).map((locator) => locator.kind).includes("css") }).toEqual({ offered: { moved: true, lines: false }, id: "gone", locators: true });
  });
});

describe("a text selection on a page with no source", () => {
  const PRICE = "The Pro plan costs 20 dollars per month, billed yearly.";

  /** Selects the first occurrence of `words` in the paragraph `id`, as a reader dragging over it does. */
  function selectWords(id: string, words: string): Range {
    const node = document.getElementById(id)!.firstChild as Text;
    const from = node.data.indexOf(words);
    if (from < 0) throw new Error(`"${words}" is not in #${id}`);
    const range = document.createRange();
    range.setStart(node, from);
    range.setEnd(node, from + words.length);
    window.getSelection()!.removeAllRanges();
    window.getSelection()!.addRange(range);
    return range;
  }

  function surface(props: Partial<React.ComponentProps<typeof AnnotationSurface>> = {}) {
    const prepare = vi.fn(async (capture: AnnotationCapture) => capture);
    const onCreate = vi.fn(async () => undefined);
    render(
      <AnnotationSurface documentKey="text-test" comments={[]} captures={{}} view="form" onCreate={onCreate} onPrepareCapture={prepare} {...props}>
        <p id="price">{PRICE}</p>
        <p id="other">Billed on the first of the month.</p>
        <button type="button">Elsewhere</button>
      </AnnotationSurface>,
    );
    return { prepare, onCreate };
  }

  it("captures a dom selection anchored on the containing element's locators, with the words as a sibling quote", async () => {
    const { prepare } = surface();
    selectWords("price", "plan costs 20 dollars");
    fireEvent.mouseUp(document.getElementById("price")!);
    await waitFor(() => expect(prepare).toHaveBeenCalledTimes(1));
    const capture = prepare.mock.calls[0]![0];
    expect({
      kind: capture.kind,
      view: capture.view,
      quote: capture.quote,
      anchorIsLocators: capture.anchor !== undefined && JSON.stringify(parseElementAnchor(capture.anchor)) === JSON.stringify(capture.locators),
      hasLocators: (capture.locators?.length ?? 0) > 0,
      hasPatch: "patch" in capture,
    }).toEqual({
      kind: "dom",
      view: "form",
      quote: { prefix: "The Pro ", exact: "plan costs 20 dollars", suffix: " per month, billed yearly." },
      anchorIsLocators: true,
      hasLocators: true,
      hasPatch: false,
    });
  });

  it("opens the draft for the selection, labelled with the selected words", async () => {
    surface();
    selectWords("price", "plan costs 20 dollars");
    fireEvent.mouseUp(document.getElementById("price")!);
    expect(await screen.findByText("“plan costs 20 dollars”")).toBeVisible();
  });

  it("hands the capture, quote included, to onCreate with the comment", async () => {
    const { onCreate } = surface();
    selectWords("price", "billed yearly");
    fireEvent.mouseUp(document.getElementById("price")!);
    const input = await screen.findByTestId("comment-compose-input");
    setCommentDraft(input, "Is this VAT inclusive?");
    fireEvent.click(screen.getByRole("button", { name: "Post comment" }));
    await waitFor(() => expect(onCreate).toHaveBeenCalledTimes(1));
    const [created, capture] = onCreate.mock.calls[0] as unknown as [{ body: string }, AnnotationCapture];
    expect({ body: created.body, kind: capture.kind, exact: capture.quote?.exact }).toEqual({ body: "Is this VAT inclusive?", kind: "dom", exact: "billed yearly" });
  });

  it.each([
    { name: "a collapsed selection", select: () => selectWords("price", "plan").collapse(true) },
    { name: "a selection outside the page", select: () => { const outside = document.createElement("p"); outside.textContent = "outside"; document.body.append(outside); const range = document.createRange(); range.selectNodeContents(outside); window.getSelection()!.removeAllRanges(); window.getSelection()!.addRange(range); } },
  ])("captures nothing for $name", async ({ select }) => {
    const { prepare } = surface();
    select();
    fireEvent.mouseUp(document.getElementById("price")!);
    await Promise.resolve();
    expect(prepare).not.toHaveBeenCalled();
  });

  it("leaves a selection to the element picker while it is picking, so the picked element is not captured twice", async () => {
    const { prepare } = surface();
    fireEvent.click(screen.getByRole("button", { name: "Comment on element" }));
    selectWords("price", "plan costs 20 dollars");
    fireEvent.mouseUp(document.getElementById("price")!);
    await Promise.resolve();
    expect(prepare).not.toHaveBeenCalled();
  });
});

describe("drift of a text capture", () => {
  const comment = (id: string): Comment => ({ id, anchor: id, body: `Thread ${id}`, createdAt: "2026-01-01T00:00:00.000Z", author: { name: "Ada" } });
  const locators: AnnotationCapture["locators"] = [{ kind: "css", selector: "#price" }];
  const text = (quote: { prefix: string; exact: string; suffix: string }): AnnotationCapture => ({ kind: "dom", version: 1, view: "form", anchor: "e:text", locators, quote, label: quote.exact });

  function surface(captures: Record<string, AnnotationCapture>, children: React.ReactNode) {
    render(
      <AnnotationSurface documentKey="text-drift" comments={Object.keys(captures).map(comment)} captures={captures} view="form" onCreate={vi.fn()}>
        {children}
      </AnnotationSurface>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Comments" }));
  }
  const rows = () => [...document.querySelectorAll<HTMLElement>("[data-drift-item]")].map((row) => [row.dataset.driftItem, row.dataset.driftState, row.querySelector("[data-drift-note]")?.textContent]);

  it("lists nothing while the words are still where they were written", async () => {
    surface({ here: text({ prefix: "costs ", exact: "20 dollars", suffix: " per month" }) }, <p id="price">The Pro plan costs 20 dollars per month.</p>);
    await Promise.resolve();
    expect(rows()).toEqual([]);
  });

  it("lists a thread whose words are gone as orphaned, with the text note, instead of pinning it somewhere", async () => {
    surface({ gone: text({ prefix: "costs ", exact: "20 dollars", suffix: " per month" }) }, <p id="price">The Pro plan is now free.</p>);
    await waitFor(() => expect(rows()).toEqual([["gone", "orphaned", driftNote("orphaned", "text")]]));
  });

  it("lists a thread whose words repeat where it was written as ambiguous", async () => {
    surface({ twice: text({ prefix: "", exact: "20 dollars", suffix: "" }) }, <p id="price">20 dollars now, 20 dollars later.</p>);
    await waitFor(() => expect(rows()).toEqual([["twice", "ambiguous", driftNote("ambiguous", "text")]]));
  });
});

it("preserves capture metadata across remounts", async () => {
  const selection = {
    kind: "code-range",
    version: 1,
    view: "source",
    patch: {
      version: 1,
      startLine: 2,
      endLine: 2,
      before: ["a"],
      lines: ["b"],
      after: ["c"],
    },
  } as const;
  render(
    <AnnotationSurface
      documentKey="restore-test"
      comments={[]}
      captures={{}}
      view="source"
      onCreate={vi.fn()}
      selection={{
        ...selection,
        patch: {
          ...selection.patch,
          before: ["a"],
          lines: ["b"],
          after: ["c"],
        },
      }}
    >
      <p>Source</p>
    </AnnotationSurface>,
  );
  await waitFor(() =>
    expect(
      JSON.parse(sessionStorage.getItem("restore-test:capture")!),
    ).toMatchObject({ kind: "code-range", patch: { startLine: 2 } }),
  );
});
