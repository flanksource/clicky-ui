import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaFormProps } from "./json-schema-form-types";

const schema = {
  properties: {
    name: { type: "string", title: "Name" },
    tags: { type: "array", title: "Tags", items: { type: "string" } },
    enabled: { type: "boolean", title: "Enabled" },
    connection: {
      type: "object",
      properties: {
        host: { type: "string", title: "Host" },
        retries: { type: "number", title: "Retries" },
        secret: { type: "string", format: "password" },
      },
    },
  },
};
const value = {
  name: "Example service",
  tags: ["internal"],
  enabled: false,
  connection: {
    host: "localhost",
    retries: 0,
    secret: "private-fixture-value",
  },
};

function example(props: Partial<JsonSchemaFormProps> = {}) {
  return (
    <JsonSchemaForm
      schema={schema}
      value={value}
      onChange={vi.fn()}
      layout={{ mode: "properties" }}
      persistPreferences={false}
      {...props}
    />
  );
}

describe("form value filtering", () => {
  it.each([
    ["SERVICE", "Name"],
    ["internal", "Tags"],
    ["false", "Enabled"],
    ["localhost", "Host"],
    ["0", "Retries"],
  ])("finds committed value %s", (query, label) => {
    render(example());
    fireEvent.change(screen.getByRole("textbox", { name: "Filter fields" }), {
      target: { value: query },
    });
    expect(
      screen.getByRole("button", { name: `Edit ${label}` }),
    ).toBeInTheDocument();
    if (label !== "Name")
      expect(
        screen.queryByRole("button", { name: "Edit Name" }),
      ).not.toBeInTheDocument();
  });

  it("keeps the filter visible with no results and clears without mutating values", () => {
    const onChange = vi.fn();
    render(example({ onChange }));
    const filter = screen.getByRole("textbox", { name: "Filter fields" });
    fireEvent.change(filter, { target: { value: "unmatched" } });
    expect(
      screen.getByText("No fields match “unmatched”."),
    ).toBeInTheDocument();
    expect(filter).toBeVisible();
    fireEvent.click(screen.getByRole("button", { name: "Clear filter" }));
    expect(
      screen.getByRole("button", { name: "Edit Name" }),
    ).toBeInTheDocument();
    expect(onChange).not.toHaveBeenCalled();
  });

  it("does not match masked password values in nested objects", () => {
    render(example());
    fireEvent.change(screen.getByRole("textbox", { name: "Filter fields" }), {
      target: { value: "private-fixture" },
    });
    expect(
      screen.queryByRole("button", { name: "Edit Host" }),
    ).not.toBeInTheDocument();
  });

  it("moves errors on filtered-out fields into the summary and restores inline errors on clear", () => {
    render(
      example({
        errors: [
          {
            instancePath: "/connection/host",
            message: "Host cannot be reached",
          },
        ],
      }),
    );
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Filter fields" }), {
      target: { value: "internal" },
    });
    expect(
      within(screen.getByRole("alert")).getByText(
        "/connection/host: Host cannot be reached",
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear filter" }));
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit Host" })).toHaveAttribute(
      "aria-invalid",
      "true",
    );
  });
});
