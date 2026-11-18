import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EVALUATION_GRAPH } from "../fixtures/classes";
import type { JvmEvaluation } from "../protocol/types";
import { EvaluationResult } from "./EvaluationResult";

const GROOVY_RESULT: JvmEvaluation = { value: 7, graph: EVALUATION_GRAPH, stdout: "Inspecting order ORD-1042\n", stderr: "warning: slow query\n", elapsedMs: 18 };

describe("EvaluationResult", () => {
  it("explains what to do before anything has run", () => {
    render(<EvaluationResult />);
    expect(screen.getByText(/Run an expression to inspect live JVM state/)).toBeInTheDocument();
  });

  it("shows the object graph with its node types and elapsed time", () => {
    render(<EvaluationResult evaluation={GROOVY_RESULT} />);
    expect(screen.getByText("items")).toBeInTheDocument();
    expect(screen.getByText("@com.example.orders.model.Order")).toBeInTheDocument();
    expect(screen.getByText("ORD-1042")).toBeInTheDocument();
    expect(screen.getByText("18 ms")).toBeInTheDocument();
  });

  it("renders stdout and stderr in their own labelled regions, omitting empty streams", () => {
    const { rerender } = render(<EvaluationResult evaluation={GROOVY_RESULT} />);
    expect(screen.getByRole("region", { name: "Standard output" })).toHaveTextContent("Inspecting order ORD-1042");
    expect(screen.getByRole("region", { name: "Standard error" })).toHaveTextContent("warning: slow query");
    rerender(<EvaluationResult evaluation={{ ...GROOVY_RESULT, stderr: "" }} />);
    expect(screen.queryByRole("region", { name: "Standard error" })).toBeNull();
  });

  it("switches to the raw JSON of the plain value and back", () => {
    render(<EvaluationResult evaluation={GROOVY_RESULT} />);
    fireEvent.click(screen.getByRole("radio", { name: "Raw" }));
    expect(screen.getByRole("region", { name: "Raw result" })).toHaveTextContent("7");
    expect(screen.queryByText("@com.example.orders.model.Order")).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: "Tree" }));
    expect(screen.getByText("@com.example.orders.model.Order")).toBeInTheDocument();
  });

  it("shows a plain value without a graph as a structured value and offers no tree toggle", () => {
    render(<EvaluationResult evaluation={{ value: { "java.version": "21.0.5" } }} />);
    expect(screen.getByText("java.version")).toBeInTheDocument();
    expect(screen.getByText("21.0.5")).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "Tree" })).toBeNull();
  });

  it("reports a completed evaluation that produced no value", () => {
    render(<EvaluationResult evaluation={{ stdout: "done\n" }} />);
    expect(screen.getByText("The evaluation completed without a value.")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Standard output" })).toHaveTextContent("done");
  });

  it("shows an evaluation error through InlineError", () => {
    render(<EvaluationResult error={new Error("ognl.OgnlException: source is null")} />);
    expect(screen.getByText("Evaluation failed")).toBeInTheDocument();
    expect(screen.getAllByText(/ognl.OgnlException: source is null/).length).toBeGreaterThan(0);
  });

  it("fails loudly when the agent sends a graph of the wrong shape", () => {
    render(<EvaluationResult evaluation={{ graph: { label: "no id" } }} />);
    expect(screen.getByText("Evaluation result unreadable")).toBeInTheDocument();
    expect(screen.getAllByText(/Invalid object graph: the root node needs a string id and label/).length).toBeGreaterThan(0);
  });

  it("reports the node whose label is selected, only when the host handles selection", () => {
    const onSelectNode = vi.fn();
    const { rerender } = render(<EvaluationResult evaluation={GROOVY_RESULT} />);
    expect(screen.queryByTitle("Select this path")).toBeNull();
    rerender(<EvaluationResult evaluation={GROOVY_RESULT} onSelectNode={onSelectNode} />);
    fireEvent.click(screen.getAllByTitle("Select this path")[1]!);
    expect(onSelectNode).toHaveBeenCalledWith(expect.objectContaining({ id: "result.id", label: "id" }));
  });

  it("shows a loader instead of a stale result while running", () => {
    render(<EvaluationResult evaluation={GROOVY_RESULT} pending />);
    expect(screen.getByRole("status")).toBeInTheDocument();
    expect(screen.queryByText("items")).toBeNull();
  });
});
