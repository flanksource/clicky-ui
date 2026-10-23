import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { TestRunner, type TestRunnerProps } from "./TestRunner";
import { emptyTestFilters, type TestFilters } from "./filterState";
import type { Test } from "./types";

const tests: Test[] = [
  {
    name: "located failure",
    failed: true,
    framework: "go test",
    work_dir: "/repo/gavel",
    file: "pkg/server/handler_test.go",
    line: 20,
    end_line: 34,
    message: "boom",
  },
  { name: "unlocated failure", failed: true, framework: "go test", message: "no location" },
];

function Harness({ onOpenFile }: Pick<TestRunnerProps, "onOpenFile">) {
  const [selected, setSelected] = useState<Test | null>(null);
  const [filters, setFilters] = useState<TestFilters>(emptyTestFilters());
  const [expandAll, setExpandAll] = useState<boolean | null>(null);
  return (
    <TestRunner
      tests={tests}
      selected={selected}
      filters={filters}
      expandAll={expandAll}
      done
      now={0}
      onSelect={setSelected}
      onFiltersChange={setFilters}
      onExpandAllChange={setExpandAll}
      {...(onOpenFile ? { onOpenFile } : {})}
    />
  );
}

const openLink = () => screen.queryByRole("button", { name: "Open in Files" });

describe("TestRunner Open in Files", () => {
  it("hands the host the selected test's file, work dir and line", () => {
    const onOpenFile = vi.fn();
    render(<Harness onOpenFile={onOpenFile} />);
    fireEvent.click(within(screen.getByRole("tree")).getByText("located failure"));

    fireEvent.click(openLink()!);

    expect(onOpenFile).toHaveBeenCalledWith({ file: "pkg/server/handler_test.go", workDir: "/repo/gavel", line: 20 });
  });

  it("is absent for a test with no file", () => {
    render(<Harness onOpenFile={vi.fn()} />);
    fireEvent.click(within(screen.getByRole("tree")).getByText("unlocated failure"));

    expect(openLink()).toBeNull();
  });

  it("is absent unless the host supplies onOpenFile", () => {
    render(<Harness />);
    fireEvent.click(within(screen.getByRole("tree")).getByText("located failure"));

    expect(screen.getByText("pkg/server/handler_test.go:20")).toBeInTheDocument();
    expect(openLink()).toBeNull();
  });
});
