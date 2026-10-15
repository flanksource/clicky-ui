import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { sqlStatementRows } from "./fixtures";
import { SqlTraceTable } from "./SqlTraceTable";

describe("SqlTraceTable", () => {
  it("groups repeated statements into one row with a count badge", () => {
    render(<SqlTraceTable rows={sqlStatementRows} />);
    expect(screen.getAllByRole("row")).toHaveLength(1 + 3);
    expect(screen.getByText("×3")).toBeInTheDocument();
  });

  it("shows every execution when grouping is switched off", () => {
    render(<SqlTraceTable rows={sqlStatementRows} />);
    fireEvent.click(screen.getByRole("switch", { name: "Group repeated statements" }));
    expect(screen.getAllByRole("row")).toHaveLength(1 + sqlStatementRows.length);
    expect(screen.queryByText("×3")).not.toBeInTheDocument();
  });

  it("starts ungrouped when asked", () => {
    render(<SqlTraceTable rows={sqlStatementRows} groupRepeated={false} />);
    expect(screen.getAllByRole("row")).toHaveLength(1 + sqlStatementRows.length);
  });

  it("shows op, tables, duration and the error of a failed statement", () => {
    render(<SqlTraceTable rows={sqlStatementRows} />);
    expect(screen.getByText("UPDATE")).toBeInTheDocument();
    expect(screen.getByText("jobs")).toBeInTheDocument();
    expect(screen.getByText("12.5 ms")).toBeInTheDocument();
    expect(screen.getByText('relation "audit" does not exist')).toBeInTheDocument();
  });

  it("shows a dash for the rows of a driver that could not tell", () => {
    render(<SqlTraceTable rows={[sqlStatementRows[4]!]} />);
    expect(screen.getByText("—")).toBeInTheDocument();
  });

  it("expands a group to each execution with its arguments", () => {
    render(<SqlTraceTable rows={sqlStatementRows} />);
    fireEvent.click(screen.getByText("×3"));
    const executions = screen.getByRole("list", { name: "Executions" });
    expect(within(executions).getAllByRole("listitem")).toHaveLength(3);
    expect(within(executions).getByText("[42]")).toBeInTheDocument();
  });

  it("expands a single statement to its arguments", () => {
    render(<SqlTraceTable rows={[sqlStatementRows[0]!]} />);
    fireEvent.click(screen.getByText("SELECT"));
    expect(screen.getByText("Arguments")).toBeInTheDocument();
  });

  it("renders the empty label when there are no statements", () => {
    render(<SqlTraceTable rows={[]} />);
    expect(screen.getByText("No SQL statements recorded")).toBeInTheDocument();
  });
});
