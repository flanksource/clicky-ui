import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import {
  allPropertiesSchema,
  allPropertiesValues,
  propertiesLookupFetcher,
  propertiesPresentation,
} from "./json-schema-form-properties.fixtures";

describe("content-only property previews", () => {
  it.each(["xs", "sm", "md", "lg", "xl"] as const)(
    "renders no editor chrome at %s",
    async (size) => {
      const { container } = await act(async () =>
        render(
          <JsonSchemaForm
            schema={allPropertiesSchema}
            value={allPropertiesValues}
            onChange={vi.fn()}
            layout={{ mode: "properties" }}
            size={size}
            showPreferencesMenu={false}
            pre={[propertiesPresentation]}
          />,
        ),
      );
      expect(
        container.querySelectorAll(
          "input:not([type=checkbox]), textarea, select, [role=combobox], [role=slider], [role=radio], [aria-expanded]",
        ),
      ).toHaveLength(0);
      for (const checkbox of screen.getAllByRole("checkbox")) {
        expect(checkbox).toBeDisabled();
        expect(checkbox).toHaveAccessibleName();
      }
      expect(container.querySelectorAll(".border-input")).toHaveLength(0);
      expect(
        screen.getByRole("button", { name: "Edit String tags" }),
      ).toHaveTextContent("apiinternal");
      expect(
        screen.getByRole("button", { name: "Edit owner" }),
      ).toHaveTextContent("platform");
      expect(
        screen.getByRole("button", { name: "Edit Object accordion" }),
      ).toHaveTextContent("API");
      expect(
        within(
          screen.getByRole("button", { name: "Edit Enum radio" }),
        ).queryByText("medium"),
      ).not.toBeInTheDocument();
    },
  );

  it("retains fetched lookup labels without mounting a picker", async () => {
    const fetcher = vi.fn(async () => [{ value: "api", label: "API service" }]);
    render(
      <JsonSchemaForm
        schema={{
          properties: {
            service: {
              type: "string",
              title: "Service",
              "x-clicky-lookup": { url: "/example/options", filter: "name" },
            },
          },
        }}
        value={{ service: "api" }}
        onChange={vi.fn()}
        layout={{ mode: "properties" }}
        showPreferencesMenu={false}
        lookupFetcher={fetcher}
      />,
    );
    expect(await screen.findByText("API service")).toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("restores the picker only while editing and returns to content after cancel", async () => {
    await act(async () =>
      render(
        <JsonSchemaForm
          schema={allPropertiesSchema}
          value={allPropertiesValues}
          onChange={vi.fn()}
          layout={{ mode: "properties" }}
          showPreferencesMenu={false}
          lookupFetcher={propertiesLookupFetcher}
          pre={[propertiesPresentation]}
        />,
      ),
    );
    fireEvent.click(screen.getByRole("button", { name: "Edit String tags" }));
    expect(screen.getByRole("combobox")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Toggle options" }),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Remove api" }));
    fireEvent.click(
      screen.getByRole("button", { name: "Cancel editing String tags" }),
    );
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Toggle options" }),
    ).not.toBeInTheDocument();
  });
});
