import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { describe, expect, it, vi } from "vitest";
import { FilterForm } from "./FilterForm";
import type { OpenAPIParameter, OperationLookupResponse } from "./types";
import type { OperationsApiClient } from "./useOperations";

// A list operation with the paired from/to date params plus one ordinary
// text param -- mirrors a policy list command's query surface.
const parameters: OpenAPIParameter[] = [
  { name: "from", in: "query", description: "Start date", schema: { type: "string" } },
  { name: "to", in: "query", description: "End date", schema: { type: "string" } },
  { name: "policy", in: "query", description: "Policy number", schema: { type: "string" } },
];

// The backend types `from`/`to` so formMetadata pairs them into a timeRange.
const lookupResponse: OperationLookupResponse = {
  filters: {
    from: { type: "from", label: "From" },
    to: { type: "to", label: "To" },
  },
};

function makeClient(): OperationsApiClient {
  return {
    getOpenAPISpec: vi.fn(),
    executeCommand: vi.fn(),
    lookupFilters: vi.fn(async () => lookupResponse),
  };
}

function renderFilterForm() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <FilterForm
        client={makeClient()}
        path="/policies"
        method="GET"
        parameters={parameters}
        onSubmit={vi.fn()}
      />
    </QueryClientProvider>,
  );
}

describe("FilterForm time range", () => {
  it("renders the paired from/to params as the native TimeRange picker, not bare inputs", async () => {
    const { container } = renderFilterForm();

    // The TimeRange popover trigger appears once the lookup pairs from/to.
    const trigger = await screen.findByRole("button", { name: /time range filter/i });
    expect(trigger).toBeInTheDocument();

    // No bare text input is rendered for the from/to fields in the form body.
    expect(screen.queryByLabelText("From")).not.toBeInTheDocument();
    expect(screen.queryByLabelText("To")).not.toBeInTheDocument();
    expect(container.querySelector('input[type="date"]')).toBeNull();
  });

  it("applies a from/to selection through the TimeRange popover", async () => {
    renderFilterForm();

    const trigger = await screen.findByRole("button", { name: /time range filter/i });
    fireEvent.click(trigger);

    fireEvent.change(screen.getByLabelText("Time range from"), {
      target: { value: "2026-04-01" },
    });
    fireEvent.change(screen.getByLabelText("Time range to"), {
      target: { value: "2026-04-30" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    await waitFor(() =>
      expect(screen.getByRole("button", { name: /time range filter/i })).toHaveTextContent(
        "2026-04-01",
      ),
    );
  });
});

describe("FilterForm placeholders", () => {
  it("renders no placeholder when the field has a label and none is explicit", async () => {
    renderFilterForm();

    const policyInput = (await screen.findByLabelText("Policy")) as HTMLInputElement;
    // `policy` declares description "Policy number" but no explicit placeholder.
    // The field already carries the "Policy" label, so no placeholder is
    // synthesized — not the description, not the label, not generic junk.
    expect(policyInput.placeholder).toBe("");
    expect(policyInput.placeholder).not.toBe("Policy number");
  });
});

describe("FilterForm multi-value filters", () => {
  it("renders a standard multi-select combobox without tristate option controls", async () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false, gcTime: 0 } },
    });
    const multiFilterLookup: OperationLookupResponse = {
      filters: {
        status: {
          label: "Status",
          type: "multi-filter",
          multi: true,
          options: {
            ready: { kind: "text", text: "Ready" },
            failed: { kind: "text", text: "Failed" },
          },
        },
      },
    };

    render(
      <QueryClientProvider client={queryClient}>
        <FilterForm
          client={{
            getOpenAPISpec: vi.fn(),
            executeCommand: vi.fn(),
            lookupFilters: vi.fn(async () => multiFilterLookup),
          }}
          path="/jobs"
          method="GET"
          parameters={[{ name: "status", in: "query" }]}
          onSubmit={vi.fn()}
        />
      </QueryClientProvider>,
    );

    const combobox = await screen.findByRole("combobox", { name: "Status" });
    expect(screen.queryByRole("group", { name: "Status" })).not.toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "Ready" })).not.toBeInTheDocument();

    fireEvent.click(combobox);

    const readyOption = await screen.findByRole("option", { name: "Ready" });
    expect(readyOption.querySelector("[data-tristate-region]")).toBeNull();
    expect(screen.getByRole("option", { name: "Failed" })).toBeInTheDocument();

    fireEvent.mouseDown(readyOption);

    await waitFor(() =>
      expect(screen.getByRole("combobox", { name: "Status" })).toHaveValue("Ready"),
    );
    expect(screen.getByRole("combobox", { name: "Status" })).not.toHaveValue("+1");
  });
});
