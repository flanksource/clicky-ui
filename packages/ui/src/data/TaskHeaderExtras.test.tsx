import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TaskMetadataChips } from "./TaskHeaderExtras";
import type { TaskProcessDetails, TaskSnapshot } from "./TaskSnapshot";

const processDetails = (metadata: unknown): TaskProcessDetails => ({
  command: "agent",
  status: "running",
  restarts: 0,
  restartPolicy: "no",
  latest: { cpuPercent: 0, rssBytes: 0, vmsBytes: 0, openFiles: 0, sampledAt: "" },
  peak: { cpuPercent: 0, rssBytes: 0, vmsBytes: 0, openFiles: 0, sampledAt: "" },
  metrics: {},
  metadata,
});

const task = (details?: TaskSnapshot["details"]): TaskSnapshot => ({
  id: "t1",
  name: "claude-agent",
  type: "task",
  status: "running",
  ...(details ? { details } : {}),
});

describe("TaskMetadataChips", () => {
  it("chips the scalar metadata a process reports", () => {
    render(<TaskMetadataChips task={task(processDetails({ state: "running", session: "df7aa36e" }))} />);

    expect(screen.getByTitle("state: running")).toBeInTheDocument();
    expect(screen.getByTitle("session: df7aa36e")).toBeInTheDocument();
  });

  // Structure belongs in the expanded details, where it can be shown as
  // structure. A header row that flattened it would only mislead.
  it("leaves structured values out of the header", () => {
    render(
      <TaskMetadataChips
        task={task(processDetails({ state: "running", turn: { pending: 2 } }))}
      />,
    );

    expect(screen.getByTitle("state: running")).toBeInTheDocument();
    expect(screen.queryByTitle(/^turn:/)).toBeNull();
  });

  it("renders nothing for a task with no process metadata", () => {
    const { container: plain } = render(<TaskMetadataChips task={task()} />);
    expect(plain).toBeEmptyDOMElement();

    const { container: none } = render(<TaskMetadataChips task={task(processDetails(undefined))} />);
    expect(none).toBeEmptyDOMElement();
  });
});
