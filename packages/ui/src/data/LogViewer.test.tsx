import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { LogViewer } from "./LogViewer";
import { parseLogSections, takeLogRows } from "./log-sections";

const BOLD = "\u001b[1m";
const RESET = "\u001b[0m";

// What a purge procedure prints: every line of its groups is a command.
const purge = [
  "::description::Purging 500 activities",
  "::group::Cycle tables",
  "::status::Truncating AsCycle",
  "::progress::1/2",
  "::status::Truncating AsCycle",
  "::endgroup::",
  "::group::Table reload",
  "::status::AsFundValue: reloading",
  "::progress done=1,total=6::",
].join("\n");

function groupsOf(container: HTMLElement) {
  return [...container.querySelectorAll("details")].map((el) => ({
    name: el.getAttribute("data-log-group"),
    open: el.open,
    text: el.textContent,
  }));
}

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

    expect(groupsOf(container)).toEqual([
      { name: "Build", open: false, text: "Build(1 line)compiling" },
      { name: "Test", open: true, text: "Test(1 line)running" },
    ]);
    expect(container.querySelector("pre")?.textContent).not.toContain("::group::");
  });

  it("lists a group's status updates once each, with the latest status and progress below the log", () => {
    const { container } = render(<LogViewer logs={purge} maxHeight="none" />);

    expect(groupsOf(container)).toEqual([
      { name: "Cycle tables", open: false, text: "Cycle tables(1 line)Truncating AsCycle" },
      { name: "Table reload", open: true, text: "Table reload(1 line)AsFundValue: reloading" },
    ]);
    const footer = container.querySelector("[data-log-status]");
    expect(footer?.textContent).toBe("Purging 500 activitiesAsFundValue: reloading1/6");
    expect(container.querySelector("pre")?.contains(footer)).toBe(false);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "1");
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuemax", "6");
  });

  it("shows the stream verbatim in Raw, and back", () => {
    const { container } = render(<LogViewer logs={purge} maxHeight="none" />);
    const raw = screen.getByRole("button", { name: "Raw" });
    expect(raw).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(raw);
    expect(container.querySelector("pre")?.textContent).toBe(purge);
    expect(container.querySelector("details, [data-log-status]")).toBeNull();

    fireEvent.click(raw);
    expect(groupsOf(container)).toHaveLength(2);
  });

  it("has no Raw toggle or footer for a plain log", () => {
    const { container } = render(<LogViewer logs={"a\nb"} />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(container.querySelector("[data-log-status]")).toBeNull();
  });

  it("keeps the latest status of a log collapsed to its first lines", () => {
    const { container } = render(<LogViewer logs={"a\nb\nc\n::status::halfway"} collapsedLines={2} />);
    expect(container.querySelector("pre")?.textContent).toBe("a\nb");
    expect(container.querySelector("[data-log-status]")?.textContent).toBe("halfway");

    fireEvent.click(screen.getByRole("button", { name: /Show more \(4 lines\)/ }));
    expect(container.querySelector("pre")?.textContent).toBe("a\nb\nc\nhalfway");
  });

  it("shows the last rows with tailLines, not counting the commands", () => {
    const logs = "a\nb\nc\n::progress::1/3\n::progress::2/3\n::progress::3/3";
    const { container } = render(<LogViewer logs={logs} tailLines={2} maxHeight="none" />);
    expect(container.querySelector("pre")?.textContent).toBe("b\nc");
    expect(container.querySelector("[data-log-status]")?.textContent).toBe("3/3");
    fireEvent.click(screen.getByRole("button", { name: "Raw" }));
    expect(container.querySelector("pre")?.textContent).toBe("::progress::2/3\n::progress::3/3");
  });
});

describe("parseLogSections", () => {
  it("nests groups and counts every line inside a group, including its nested groups' lines", () => {
    expect(parseLogSections("::group::outer\na\n::group::inner\nb\nc\n::endgroup::\n::endgroup::\nafter")).toEqual({
      hasCommands: true,
      sections: [
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
      ],
    });
  });

  it("reads GitHub's downloaded-log markers and drops an endgroup whose group a tail cut off", () => {
    expect(parseLogSections("x\n##[endgroup]\n##[group]Run tests\r\nok\n##[endgroup]").sections).toEqual([
      { kind: "text", text: "x" },
      { kind: "group", name: "Run tests", lines: 1, closed: true, children: [{ kind: "text", text: "ok" }] },
    ]);
  });

  it.each([
    ["plain lines and unknown commands", "a\n::set-output name=x::1\nb", "a\n::set-output name=x::1\nb"],
    ["annotations", "::error file=a.go,line=3::boom\n::warning title=Slow::scan\n::notice::hi", "Error: boom\nWarning: scan\nNotice: hi"],
    ["escapes in a message", "::notice::50%25%0Adone", "Notice: 50%\ndone"],
    ["hidden commands", "a\n::debug::x\n::progress::1/2\n::description::y\nb", "a\nb"],
    ["a repeated status", "::status::s\n::progress::1/2\n::status::s\n::status::t", "s\nt"],
    ["a status repeated after other output", "::status::s\nother\n::status::s", "s\nother\ns"],
    ["malformed commands", "::progress::half\n::error nokey::x\n::stop-commands::", "::progress::half\n::error nokey::x\n::stop-commands::"],
    ["lines between stop-commands and its token", "::stop-commands::tok\n::status::shown\n::tok::\n::status::read", "::status::shown\nread"],
    ["carriage returns on commands", "::status::s\r\nplain\r", "s\nplain\r"],
  ])("renders %s", (_name, logs, text) => {
    expect(parseLogSections(logs).sections).toEqual([{ kind: "text", text }]);
  });

  it("keeps the latest description, status and progress", () => {
    const { description, status, progress } = parseLogSections(
      "::description::one\n::status::a\n::progress::1/4\n::description::two\n::status::b\n::progress done=3,total=4::",
    );
    expect({ description, status, progress }).toEqual({ description: "two", status: "b", progress: { done: 3, total: 4 } });
  });

  it("says whether the log held any command", () => {
    expect([parseLogSections("a"), parseLogSections("::debug::x"), parseLogSections("##[group]g")].map((log) => log.hasCommands)).toEqual([false, true, true]);
  });
});

describe("takeLogRows", () => {
  const { sections } = parseLogSections("a\nb\n::group::closed\n1\n2\n3\n::endgroup::\n::group::open\nc\nd");

  it("takes the last rows: an open group's lines, a closed group as one row kept whole", () => {
    expect(takeLogRows(sections, 2, "tail")).toEqual([{ kind: "group", name: "open", lines: 2, closed: false, children: [{ kind: "text", text: "d" }] }]);
    expect(takeLogRows(sections, 5, "tail")).toEqual([{ kind: "text", text: "b" }, ...sections.slice(1)]);
  });

  it("takes the first rows", () => {
    expect(takeLogRows(sections, 3, "head")).toEqual(sections.slice(0, 2));
    expect(takeLogRows(sections, 1, "head")).toEqual([{ kind: "text", text: "a" }]);
  });
});
