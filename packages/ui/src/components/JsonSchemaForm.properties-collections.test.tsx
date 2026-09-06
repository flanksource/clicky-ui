import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import {
  collectionProperties,
  collectionValues,
} from "./json-schema-form-properties.fixtures";

describe("collection property presentation", () => {
  it.each(["xs", "sm", "md", "lg", "xl"] as const)(
    "preserves each collection layout without input chrome at %s",
    (size) => {
      const { container } = render(
        <JsonSchemaForm
          schema={{ properties: collectionProperties }}
          value={collectionValues}
          onChange={vi.fn()}
          size={size}
          layout={{ mode: "properties" }}
          showPreferencesMenu={false}
        />,
      );
      const table = within(
        screen.getByRole("button", { name: "Edit Object table" }),
      ).getByRole("table");
      expect(
        within(table)
          .getAllByRole("columnheader")
          .map((cell) => cell.textContent),
      ).toEqual(["Name", "Enabled"]);
      expect(
        within(table)
          .getAllByRole("cell")
          .map((cell) => cell.textContent),
      ).toEqual(["Gateway", "true"]);
      expect(
        within(
          screen.getByRole("button", { name: "Edit Object cards" }),
        ).getByRole("article"),
      ).toHaveTextContent("Worker");
      const accordion = screen.getByRole("button", {
        name: "Edit Object accordion",
      });
      expect(accordion).toHaveTextContent("1 service");
      expect(within(accordion).getByText("API")).toBeInTheDocument();
      expect(accordion).not.toHaveTextContent("Enabled");
      expect(
        within(
          screen.getByRole("button", { name: "Edit Compact list" }),
        ).getByText("Check configuration"),
      ).toHaveClass("font-mono");
      expect(
        container.querySelectorAll(
          "input, textarea, select, [role=combobox], [aria-expanded], .border-input",
        ),
      ).toHaveLength(0);
    },
  );

  it("keeps table column ordering and restores its editor on click", () => {
    render(
      <JsonSchemaForm
        schema={{
          properties: {
            services: {
              ...collectionProperties.table!,
              items: {
                type: "object",
                "x-order": ["enabled", "name"],
                properties: {
                  name: { type: "string", title: "Name" },
                  enabled: { type: "boolean", title: "Enabled" },
                },
              },
            },
          },
        }}
        value={{ services: collectionValues.table }}
        onChange={vi.fn()}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
      />,
    );
    expect(
      screen.getAllByRole("columnheader").map((cell) => cell.textContent),
    ).toEqual(["Enabled", "Name"]);
    fireEvent.click(screen.getByRole("button", { name: "Edit Object table" }));
    expect(
      screen
        .getAllByRole("columnheader")
        .slice(0, 2)
        .map((cell) => cell.textContent),
    ).toEqual(["Enabled", "Name"]);
    expect(screen.getByDisplayValue("Gateway")).toBeInTheDocument();
    fireEvent.keyDown(screen.getByDisplayValue("Gateway"), { key: "Escape" });
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveTextContent("Gateway");
  });

  it("uses custom item summaries, badges and error counts for accordion previews", () => {
    render(
      <JsonSchemaForm
        schema={{ properties: { services: collectionProperties.accordion! } }}
        value={{ services: collectionValues.accordion }}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
        errors={[
          { instancePath: "/services/0/name", message: "Duplicate name" },
        ]}
        pre={[
          (field) =>
            field.key === "services"
              ? {
                  ...field,
                  itemSummary: () => ({
                    title: "Service API",
                    badge: { label: "Ready" },
                    summary: "Two workers",
                  }),
                }
              : field,
        ]}
      />,
    );
    const preview = screen.getByRole("button", {
      name: "Edit Object accordion",
    });
    expect(preview).toHaveTextContent("Service APIReadyTwo workers1 error");
  });

  it("nests structured map entries with constrained key labels", () => {
    render(
      <JsonSchemaForm
        schema={{
          properties: {
            endpoints: {
              type: "object",
              title: "Endpoints",
              propertyNames: {
                title: "Role",
                enum: ["primary"],
                "x-enum-labels": { primary: "Primary endpoint" },
              },
              additionalProperties: {
                type: "object",
                "x-layout": "stack",
                properties: { host: { type: "string", title: "Host" } },
              },
            },
          },
        }}
        value={{ endpoints: { primary: { host: "localhost" } } }}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
      />,
    );
    expect(screen.getByRole("term", { name: "primary" })).toHaveTextContent(
      "Primary endpoint",
    );
    expect(screen.getByRole("term", { name: "host" })).toHaveStyle({
      paddingInlineStart: "32px",
    });
    expect(screen.getByRole("button", { name: "Edit Host" })).toHaveTextContent(
      "localhost",
    );
  });
});
