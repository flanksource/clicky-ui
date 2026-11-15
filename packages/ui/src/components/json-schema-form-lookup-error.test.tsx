import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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

const FAILURE = "lookup upstream is down";
const USERS: FieldOption = { value: "users", label: "users" };

function renderField(lookupFetcher: LookupFetcher) {
  render(<JsonSchemaForm schema={schema} value={{}} onChange={() => {}} lookupFetcher={lookupFetcher} showPreferencesMenu={false} />);
}

describe("LookupControl failures", () => {
  it("shows the message of a rejected lookup under the control and clears it when a later search succeeds", async () => {
    let fail = true;
    renderField(async ({ query }) => {
      if (fail) throw new Error(FAILURE);
      return query === "" ? [USERS] : [];
    });

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent(FAILURE);
    expect(screen.getByRole("combobox")).toHaveAttribute("aria-describedby", alert.id);

    fail = false;
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "u" } });
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "" } });

    await waitFor(() => expect(screen.queryByRole("alert")).toBeNull());
  });

  it("keeps the options it already has when a later lookup fails", async () => {
    let fail = false;
    renderField(async () => {
      if (fail) throw new Error(FAILURE);
      return [USERS];
    });
    fireEvent.focus(screen.getByRole("combobox"));
    expect(await screen.findByRole("option", { name: "users" })).toBeInTheDocument();

    fail = true;
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "x" } });

    expect(await screen.findByRole("alert")).toHaveTextContent(FAILURE);
    expect(screen.getByRole("option", { name: "users" })).toBeInTheDocument();
  });
});
