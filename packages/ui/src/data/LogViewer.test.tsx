import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { LogViewer } from "./LogViewer";
import { parseLogSections } from "./log-sections";

const BOLD = "\u001b[1m";
const RESET = "\u001b[0m";

describe("LogViewer", () => {
  it("styles ANSI escapes instead of printing them", () => {
    const { container } = render(<LogViewer logs={`${BOLD}Title:${RESET} Buy milk`} />);
    const pre = container.querySelector("pre");
    expect(pre?.textContent).toBe("Title: Buy milk");
    expect(pre?.querySelector("span[style]")?.textContent).toBe("Title:");
  });

  it("renders group markers as collapsible sections, closed groups collapsed and the open one expanded", () => {
    const logs = ["start", "::group::Build", "compiling", "::endgroup::", "::group::Test", "running"].join("\n");
    const { container } = render(<LogViewer logs={logs} maxHeight="none" />);

    const groups = [...container.querySelectorAll("details")].map((el) => ({
      name: el.getAttribute("data-log-group"),
      open: el.open,
      summary: el.querySelector("summary")?.textContent,
    }));
    expect(groups).toEqual([
      { name: "Build", open: false, summary: "Build(1 line)" },
      { name: "Test", open: true, summary: "Test(1 line)" },
    ]);
    expect(container.querySelector("pre")?.textContent).not.toContain("::group::");
  });
});

describe("parseLogSections", () => {
  it("nests groups and counts every line inside a group, including its nested groups' lines", () => {
    expect(parseLogSections("::group::outer\na\n::group::inner\nb\nc\n::endgroup::\n::endgroup::\nafter")).toEqual([
      {
        kind: "group",
        name: "outer",
        lines: 3,
        closed: true,
        children: [
          { kind: "text", text: "a" },
          { kind: "group", name: "inner", lines: 2, closed: true, children: [{ kind: "text", text: "b\nc" }] },
        ],
      },
      { kind: "text", text: "after" },
    ]);
  });

  it("reads GitHub's downloaded-log markers and drops an endgroup whose group a tail cut off", () => {
    expect(parseLogSections("x\n##[endgroup]\n##[group]Run tests\r\nok\n##[endgroup]")).toEqual([
      { kind: "text", text: "x" },
      { kind: "group", name: "Run tests", lines: 1, closed: true, children: [{ kind: "text", text: "ok" }] },
    ]);
  });

  it("leaves plain logs as one text section", () => {
    expect(parseLogSections("a\n::notice::kept\nb")).toEqual([{ kind: "text", text: "a\n::notice::kept\nb" }]);
  });
});
