import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ToolSchemaBrowser } from "./ToolSchemaBrowser";
import type { ToolMeta } from "../chat/types";

const TOOLS: ToolMeta[] = [
  {
    name: "xero_transactions_split",
    label: "Split",
    group: "Accounting Transaction Write",
  },
  {
    name: "xero_accounts_list",
    label: "List Xero accounts",
    group: "Accounting Read",
  },
];

describe("ToolSchemaBrowser", () => {
  it("prefixes a bare action label with its humanized parent path", () => {
    render(<ToolSchemaBrowser tools={TOOLS} />);
    const splitButton = screen.getByRole("button", { name: /Split/ });
    expect(splitButton).toHaveTextContent("Xero Transactions Split");
  });

  it("does not add a parent prefix when the label already carries context", () => {
    render(<ToolSchemaBrowser tools={TOOLS} />);
    const listButton = screen.getByRole("button", {
      name: "List Xero accounts",
    });
    expect(listButton).toHaveTextContent("List Xero accounts");
    expect(listButton).not.toHaveTextContent("Xero Accounts List Xero accounts");
  });
});
