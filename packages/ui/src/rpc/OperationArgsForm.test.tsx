import { fireEvent, render, screen } from "@testing-library/react";
import * as matchers from "@testing-library/jest-dom/matchers";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { OperationArgsForm } from "./OperationArgsForm";
import type { OpenAPIParameter, ResolvedOperation } from "./types";
import type { OperationsApiClient } from "./useOperations";
expect.extend(matchers);

function operationWith(parameters: OpenAPIParameter[]): ResolvedOperation {
  return {
    path: "/api/v1/jobs/run",
    method: "post",
    operation: { operationId: "runJob", parameters },
  };
}

const client: OperationsApiClient = {
  getOpenAPISpec: vi.fn(async () => ({
    openapi: "3.0.0",
    info: { title: "test", version: "1" },
    paths: {},
  })),
  executeCommand: vi.fn(),
};

function renderArgs(
  operation: ResolvedOperation,
  args: Record<string, unknown> = {},
) {
  const onChange = vi.fn();
  const onValidityChange = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <OperationArgsForm
        client={client}
        operation={operation}
        args={args}
        onChange={onChange}
        onValidityChange={onValidityChange}
      />
    </QueryClientProvider>,
  );
  return { onChange, onValidityChange };
}

describe("OperationArgsForm", () => {
  it("says an operation without parameters needs no input and reports empty args", async () => {
    const { onChange, onValidityChange } = renderArgs(operationWith([]));
    expect(screen.getByText("This operation does not require input.")).toBeInTheDocument();
    await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({}));
    expect(onValidityChange).toHaveBeenLastCalledWith(true);
  });

  it("sends positional args as a list and keeps string flags as strings", async () => {
    const { onChange } = renderArgs(
      operationWith([
        { name: "args", in: "query", schema: { type: "array" } },
        { name: "tables", in: "query", schema: { type: "string" } },
      ]),
      { args: ["AsCycle", "AsActivity"], tables: "a,b" },
    );
    expect(screen.getByRole("textbox", { name: "Args" })).toHaveValue("AsCycle,AsActivity");
    await vi.waitFor(() =>
      expect(onChange).toHaveBeenLastCalledWith({
        args: ["AsCycle", "AsActivity"],
        tables: "a,b",
      }),
    );
  });

  it("reports a number parameter that is not a number as invalid", async () => {
    const { onValidityChange } = renderArgs(
      operationWith([
        { name: "batch-size", in: "query", schema: { type: "integer" } },
      ]),
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Batch Size" }), {
      target: { value: "1.5" },
    });
    expect(await screen.findByText("Batch Size must be a whole number.")).toBeInTheDocument();
    expect(onValidityChange).toHaveBeenLastCalledWith(false);
  });

  it("names stored args the operation no longer accepts and drops them", async () => {
    const { onChange } = renderArgs(
      operationWith([{ name: "dry-run", in: "query", schema: { type: "boolean" } }]),
      { "dry-run": true, retired: "x" },
    );
    expect(
      screen.getByText("Dropped arguments this operation no longer accepts: retired"),
    ).toBeInTheDocument();
    await vi.waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ "dry-run": true }));
  });
});
