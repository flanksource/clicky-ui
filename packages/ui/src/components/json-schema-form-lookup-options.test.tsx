import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { FieldOption, JsonSchemaObject, LookupFetcher } from "./json-schema-form-types";

const schema: JsonSchemaObject = {
  type: "object",
  properties: {
    table: {
      type: "string",
      title: "Table",
      "x-clicky-lookup": { url: "/api/v1/lookup/t0/table", filter: "query" },
    },
  },
};

const ORDERS: FieldOption = {
  value: "orders",
  label: "orders",
  description: "public.orders",
  icon: <svg data-testid="orders-icon" />,
  tone: "violet",
  badges: [
    { label: "proxy", tone: "violet" },
    { label: "svc", icon: <svg data-testid="svc-icon" />, tone: "teal" },
  ],
};
const PLAIN: FieldOption = { value: "users", label: "users" };

function renderField(options: FieldOption[]) {
  const lookupFetcher: LookupFetcher = async () => options;
  render(<JsonSchemaForm schema={schema} value={{}} onChange={() => {}} lookupFetcher={lookupFetcher} showPreferencesMenu={false} />);
  fireEvent.focus(screen.getByRole("combobox"));
}

describe("LookupControl option rendering", () => {
  it("shows the option's icon, inline description and badges, and none for a bare option", async () => {
    renderField([ORDERS, PLAIN]);

    const orders = await screen.findByRole("option", { name: /orders/ });
    expect(within(orders).getByTestId("orders-icon")).toBeInTheDocument();
    expect(within(orders).getByText("public.orders")).toBeInTheDocument();
    expect(within(orders).getByText("proxy")).toBeInTheDocument();
    expect(within(orders).getByText("svc")).toBeInTheDocument();
    expect(within(orders).getByTestId("svc-icon")).toBeInTheDocument();

    const users = screen.getByRole("option", { name: "users" });
    expect(within(users).queryByText("proxy")).toBeNull();
    expect(within(users).queryByText("public.orders")).toBeNull();
  });

  it("tints the leading icon with the option's tone", async () => {
    renderField([ORDERS]);

    const icon = await screen.findByTestId("orders-icon");

    expect(icon.parentElement?.className).toContain("text-violet-700");
  });
});
