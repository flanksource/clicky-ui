import { describe, expect, it } from "vitest";
import { toolParentLabel } from "./tool-name";
import type { ToolMeta } from "../chat/types";

function tool(name: string, label: string): ToolMeta {
  return { name, label };
}

describe("toolParentLabel", () => {
  it("humanizes the parent path when the label is a bare action verb", () => {
    expect(toolParentLabel(tool("xero_transactions_split", "Split"))).toBe(
      "Xero Transactions",
    );
  });

  it("splits camelCase operation ids", () => {
    expect(toolParentLabel(tool("xeroBankReconcile", "Reconcile"))).toBe(
      "Xero Bank",
    );
  });

  it("prefixes when the action label differs from the name's last segment", () => {
    expect(toolParentLabel(tool("invoices_send", "Email"))).toBe("Invoices");
  });

  it("returns undefined when the label already carries the parent word", () => {
    expect(
      toolParentLabel(tool("xero_accounts_list", "List Xero accounts")),
    ).toBeUndefined();
  });

  it("returns undefined for a single-segment tool name", () => {
    expect(toolParentLabel(tool("search", "Search"))).toBeUndefined();
  });

  it("returns undefined when there is no label to disambiguate", () => {
    expect(toolParentLabel(tool("xero_transactions_split", ""))).toBeUndefined();
  });
});
