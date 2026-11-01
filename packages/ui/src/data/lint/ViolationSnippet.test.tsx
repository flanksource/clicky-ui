import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { ViolationSnippet, VIOLATION_CONTEXT_LINES } from "./ViolationSnippet";

const SOURCE = Array.from({ length: 20 }, (_, i) => `line ${i + 1}`).join("\n");
const FILE = "pkg/a.txt";
const WORK_DIR = "/repo";

const renderedLines = (container: HTMLElement) =>
  [...container.querySelectorAll("[data-source-line]")].map((el) => Number(el.getAttribute("data-source-line")));

describe("ViolationSnippet", () => {
  it.each(["warning", "info"] as const)("uses the %s source tone instead of error red", async (severity) => {
    const { container } = render(<ViolationSnippet violation={{ line: 1, severity, message: "Check value" }} file="example.go" workDir="" loadSource={async () => "package example"} />);
    await waitFor(() => expect(container.querySelector('[data-source-tone]')).toHaveAttribute("data-source-tone", severity));
  });
  it("shows the flagged range with context lines either side, loaded by work-dir-relative file", async () => {
    const loadSource = vi.fn(() => Promise.resolve(SOURCE));
    const flagged = { line: 10, end_line: 11 };
    const { container } = render(
      <ViolationSnippet violation={flagged} file={FILE} workDir={WORK_DIR} loadSource={loadSource} />,
    );
    await screen.findByText("line 10");
    const expected = Array.from(
      { length: flagged.end_line - flagged.line + 1 + 2 * VIOLATION_CONTEXT_LINES },
      (_, i) => flagged.line - VIOLATION_CONTEXT_LINES + i,
    );
    expect(renderedLines(container)).toEqual(expected);
    expect(loadSource).toHaveBeenCalledWith({ file: FILE, workDir: WORK_DIR });
  });

  it("shows the full message above the independently scrolling source window", async () => {
    const violation = { line: 5, message: "value is never read" };
    const { container } = render(
      <ViolationSnippet violation={violation} file={FILE} workDir={WORK_DIR} loadSource={() => Promise.resolve(SOURCE)} />,
    );
    await screen.findByText("line 5");
    const message = screen.getByText(violation.message);
    expect(message.closest("[data-scroll-x]")).toBeNull();
    expect(message.compareDocumentPosition(container.querySelector("[data-scroll-x]")!)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("clamps the window at the start and end of the file", async () => {
    const loadSource = () => Promise.resolve("only\ntwo");
    const { container } = render(
      <ViolationSnippet violation={{ line: 1 }} file="b.txt" workDir={WORK_DIR} loadSource={loadSource} />,
    );
    await screen.findByText("only");
    expect(renderedLines(container)).toEqual([1, 2]);
  });

  it("reports a failed load instead of hiding it", async () => {
    const loadSource = () => Promise.reject(new Error("no such file"));
    render(<ViolationSnippet violation={{ line: 3 }} file="missing.txt" workDir={WORK_DIR} loadSource={loadSource} />);
    expect(await screen.findByRole("alert")).toHaveTextContent("Could not load missing.txt: no such file");
  });

  it("falls back to the linter's reported code without a loader", () => {
    render(<ViolationSnippet violation={{ line: 3, code: "x := y" }} file={FILE} workDir={WORK_DIR} />);
    expect(screen.getByText("x := y")).toBeInTheDocument();
  });
});
