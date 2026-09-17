import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { ClickyTable } from "./Clicky";

describe("ClickyTable cellRenderers", () => {
  it("renders a parsed payload in its cell with access to hidden header values", () => {
    const payload = { transactionName: "PolicyIssue", clientNumber: "CL-1" };
    const renderPayload = vi.fn((value: unknown, row: Record<string, unknown>) => (
      <div>{String((value as typeof payload).transactionName)} by {String(row.source)}</div>
    ));

    render(
      <ClickyTable
        columns={[{ name: "type", label: "Type" }, { name: "payload", label: "Payload", type: "json" }]}
        rows={[{ cells: {
          type: { kind: "text", text: "ActivityProcess" },
          source: { kind: "text", text: "example:type=Publisher" },
          payload: { kind: "map", fields: [
            { name: "transactionName", value: { kind: "text", text: "PolicyIssue" } },
            { name: "clientNumber", value: { kind: "text", text: "CL-1" } },
          ] },
        } }]}
        cellRenderers={{ payload: renderPayload }}
      />,
    );

    expect(screen.getByText("PolicyIssue by example:type=Publisher")).toBeInTheDocument();
    expect(renderPayload).toHaveBeenCalledWith(payload, {
      type: "ActivityProcess", source: "example:type=Publisher", payload,
    });
  });
});
