import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ParameterGrid } from "./FilterFormFields";

describe("ParameterGrid bounded filters", () => {
  it("renders number and duration filters as editable bounded controls", () => {
    render(
      <ParameterGrid
        autoSubmit
        isSubmitting={false}
        submitLabel="Run"
        submittingLabel="Running"
        filters={[
          {
            key: "amount",
            kind: "number",
            label: "Amount",
            unit: "USD",
            value: { min: "100", minOperator: ">" },
            onChange: vi.fn(),
          },
          {
            key: "elapsed",
            kind: "duration",
            label: "Elapsed",
            unit: "ms",
            value: { max: "2", maxOperator: "<=", maxUnit: "m" },
            onChange: vi.fn(),
          },
        ]}
      />,
    );

    expect(screen.getByLabelText("Amount minimum")).toHaveValue(100);
    expect(screen.getAllByText("USD")).toHaveLength(2);
    expect(screen.getByLabelText("Elapsed maximum")).toHaveValue(2);
    expect(screen.getByLabelText("Elapsed maximum unit")).toHaveValue("m");
  });
});
