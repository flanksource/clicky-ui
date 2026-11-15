import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { highlightToLines } from "../../data/code-highlight";
import type { MonacoEditorProps } from "../../monaco/types";
import { classSourceFixture } from "../fixtures/classes";
import { DecompiledSourceView, type DecompiledSourceViewProps } from "./DecompiledSourceView";

vi.mock("../../data/code-highlight", async (importOriginal) => ({
  ...(await importOriginal<typeof import("../../data/code-highlight")>()),
  highlightToLines: vi.fn(async () => null),
}));

let editorProps: MonacoEditorProps | undefined;
vi.mock("../../monaco/MonacoEditor", () => ({
  MonacoEditor: function FakeMonacoEditor(props: MonacoEditorProps) {
    editorProps = props;
    return <textarea aria-label="Replacement source" value={props.value} onChange={(event) => props.onChange?.(event.target.value)} />;
  },
}));

const CLASS = "com.example.orders.OrderService";
const FIXTURE = classSourceFixture(CLASS, "6d06d69c");
const ROWS = FIXTURE.source.split("\n");

function row(index: number) {
  const element = document.querySelector<HTMLElement>(`[data-row="${index}"]`);
  if (!element) throw new Error(`no row ${index}`);
  return element;
}

function renderView(overrides: Partial<DecompiledSourceViewProps> = {}) {
  return render(
    <DecompiledSourceView
      qualifiedName={CLASS}
      source={FIXTURE.source}
      sourceLineNumbers={FIXTURE.sourceLineNumbers}
      mode="read"
      focusRange={null}
      highlightRow={-1}
      markers={[]}
      {...overrides}
    />,
  );
}

beforeEach(() => {
  editorProps = undefined;
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  Reflect.deleteProperty(Element.prototype, "scrollIntoView");
});

describe("DecompiledSourceView reading", () => {
  it("shows every decompiled row with the original bytecode line in the gutter, blank where the decompiler mapped nothing", () => {
    renderView();
    expect(document.querySelectorAll("[data-row]")).toHaveLength(ROWS.length);
    const gutter = (index: number) => row(index).querySelector("[data-gutter]")?.textContent;
    expect([0, 9, 10, 14, 17, 21, 24].map(gutter)).toEqual(["", "12", "13", "17", "20", "24", ""]);
    expect(row(15)).toHaveTextContent("inventory.reserve(order);");
  });

  it("numbers rows 1..N and warns when the decompiler supplied no line markers", () => {
    renderView({ sourceLineNumbers: ROWS.map(() => 0) });
    expect(row(3).querySelector("[data-gutter]")).toHaveTextContent("4");
    expect(screen.getByText(/no source-line markers/i)).toBeInTheDocument();
  });

  it("shows a host warning above the source", () => {
    renderView({ warning: "Decompiled with fallback options." });
    expect(screen.getByText("Decompiled with fallback options.")).toBeInTheDocument();
  });

  it("highlights the requested row and scrolls it into view", () => {
    renderView({ highlightRow: 15 });
    expect(row(15)).toHaveAttribute("data-highlighted", "true");
    expect(row(14)).not.toHaveAttribute("data-highlighted");
    expect(Element.prototype.scrollIntoView).toHaveBeenCalled();
  });

  it("reports the clicked 0-based row", () => {
    const onSelectRow = vi.fn();
    renderView({ onSelectRow });
    fireEvent.click(row(15));
    expect(onSelectRow).toHaveBeenCalledWith(15);
  });

  it("paints highlighted tokens once the highlighter answers", async () => {
    vi.mocked(highlightToLines).mockResolvedValueOnce(ROWS.map((line) => [{ content: line, color: "#d73a49" }]));
    renderView();
    await waitFor(() => expect(within(row(0)).getByText(ROWS[0]!)).toHaveStyle({ color: "#d73a49" }));
  });
});

describe("DecompiledSourceView folded to a method", () => {
  const focusRange = { startLine: 14, endLine: 19 };

  it("shows only the method's lines, counting what is hidden above and below", () => {
    renderView({ focusRange });
    expect([...document.querySelectorAll("[data-row]")].map((element) => element.getAttribute("data-row"))).toEqual(["13", "14", "15", "16", "17", "18"]);
    expect(screen.getByRole("button", { name: "Show 13 hidden lines above" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Show 6 hidden lines below" })).toBeInTheDocument();
    expect(row(13)).toHaveAttribute("data-in-focus", "true");
  });

  it("brings the rest of the class back and folds to the method again", () => {
    renderView({ focusRange });
    fireEvent.click(screen.getByRole("button", { name: "Show whole class" }));
    expect(document.querySelectorAll("[data-row]")).toHaveLength(ROWS.length);
    expect(row(13)).toHaveAttribute("data-in-focus", "true");
    expect(row(0)).not.toHaveAttribute("data-in-focus");
    fireEvent.click(screen.getByRole("button", { name: "Fold to method" }));
    expect(document.querySelectorAll("[data-row]")).toHaveLength(6);
  });

  it("opens the whole class from either hidden-lines control", () => {
    renderView({ focusRange });
    fireEvent.click(screen.getByRole("button", { name: "Show 6 hidden lines below" }));
    expect(document.querySelectorAll("[data-row]")).toHaveLength(ROWS.length);
  });

  it("folds again when a different method is picked", () => {
    const view = renderView({ focusRange });
    fireEvent.click(screen.getByRole("button", { name: "Show whole class" }));
    view.rerender(
      <DecompiledSourceView
        qualifiedName={CLASS}
        source={FIXTURE.source}
        sourceLineNumbers={FIXTURE.sourceLineNumbers}
        mode="read"
        focusRange={{ startLine: 21, endLine: 23 }}
        highlightRow={-1}
        markers={[]}
      />,
    );
    expect(document.querySelectorAll("[data-row]")).toHaveLength(3);
  });

  it("has no fold controls without a method", () => {
    renderView();
    expect(screen.queryByRole("button", { name: "Show whole class" })).toBeNull();
  });
});

describe("DecompiledSourceView editing", () => {
  it("loads the editor on demand with the draft and forwards edits", async () => {
    const onDraftChange = vi.fn();
    renderView({ mode: "edit", draft: "class OrderService {}", onDraftChange });
    const editor = await screen.findByRole("textbox", { name: "Replacement source" });
    expect(editor).toHaveValue("class OrderService {}");
    expect(editorProps).toMatchObject({ language: "java", path: "jvm-decompiled/com.example.orders.OrderService.java" });
    fireEvent.change(editor, { target: { value: "class OrderService { }" } });
    expect(onDraftChange).toHaveBeenCalledWith("class OrderService { }");
  });

  it("warns that only method bodies can be redefined, and does not render the read-only rows", async () => {
    renderView({ mode: "edit", draft: FIXTURE.source, onDraftChange: vi.fn() });
    expect(screen.getByText(/redefinition may change method bodies only/i)).toBeInTheDocument();
    await screen.findByRole("textbox", { name: "Replacement source" });
    expect(document.querySelector("[data-row]")).toBeNull();
  });

  it("requires a draft and a change handler to edit", () => {
    expect(() => renderView({ mode: "edit" })).toThrow("edit mode needs a draft and onDraftChange");
  });
});
