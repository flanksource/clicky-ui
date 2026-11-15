import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fireEvent, userEvent, waitFor, within } from "storybook/test";
import { JsonSchemaForm } from "./JsonSchemaForm";
import extension from "./examples/form-extensions/extension";
import schema from "./examples/form-extensions/schema.json";
import value from "./examples/form-extensions/value.json";
import type { FormExtensionSource } from "./json-schema-form-extension-api";
import type { JsonSchemaObject } from "./json-schema-form-types";

// A form extension is one bundle: custom field types (keyed by the standard
// `format`), lookup handlers (keyed by `x-clicky-lookup.url`), layout engines
// (keyed by `layout.mode` / `x-layout`), slot replacements, and pre/post hooks.
// This story loads the shared fixture in examples/form-extensions (whose schema
// declares its own extension in `x-clicky-extensions`) — the same
// schema.json + extension.tsx + value.json the unit test, the PageForm E2E test
// and the playground demo use — and asserts every extension point.

// The schema declares its extension (`x-clicky-extensions`), and a host opts in
// by giving the form a loader. This one resolves the statically imported module,
// standing in for a host that serves the declared ref.
const extensionLoader = async (source: FormExtensionSource) => {
  if (!("ref" in source) || source.ref !== "examples/form-extensions/extension.tsx") {
    throw new Error(`unexpected extension source ${JSON.stringify(source)}`);
  }
  return extension;
};

function Demo() {
  const [current, setCurrent] = useState<Record<string, unknown>>(value);
  return (
    <div className="max-w-3xl space-y-4">
      <JsonSchemaForm
        title="Service"
        schema={schema as JsonSchemaObject}
        value={current}
        onChange={setCurrent}
        layout={{ mode: "cards" }}
        extensionLoader={extensionLoader}
        persistPreferences={false}
      />
      <output data-testid="value" className="block whitespace-pre-wrap font-mono text-xs">
        {JSON.stringify(current)}
      </output>
    </div>
  );
}

const meta = {
  title: "Extensions/FormExtension",
  component: Demo,
  parameters: {
    docs: {
      description: {
        component:
          "`extensions` on `JsonSchemaForm` takes `FormExtension` bundles (`defineFormExtension`). Registering a built-in format or layout name, or the same name from two extensions, throws. An unregistered `format` (such as `uri`) still renders as before; an unregistered layout name throws.",
      },
    },
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Example: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // the declared extension loads first (Loading, then the form)
    await canvas.findByRole("radiogroup", { name: "Accent" });
    const output = () => JSON.parse(canvas.getByTestId("value").textContent ?? "{}") as Record<string, unknown>;

    // slots: Title
    expect(canvasElement.querySelector("[data-example-title]")).toHaveTextContent("Service");

    // layouts, form level: layout.mode "cards"
    expect(canvasElement.querySelector("[data-example-cards]")).toBeInTheDocument();
    expect(canvasElement.querySelector('[data-example-card="name"]')).toBeInTheDocument();

    // layouts, field level: endpoints use x-layout "chips"
    expect(canvasElement.querySelector('[data-example-chips="endpoints"]')).toBeInTheDocument();
    expect(canvasElement.querySelector('[data-example-card="endpoints"]')).not.toBeInTheDocument();

    // pre: the id badge on name
    expect(canvasElement.querySelector('[data-example-card="name"]')).toHaveTextContent("id");

    // formats: color swatches, committing a pick; post: the marker on the label
    const swatches = canvas.getByRole("radiogroup", { name: "Accent" });
    expect(within(swatches).getAllByRole("radio")).toHaveLength(3);
    await userEvent.click(within(swatches).getByRole("radio", { name: "#22c55e" }));
    await waitFor(() => expect(output().color).toBe("#22c55e"));
    expect(canvasElement.querySelectorAll("[data-example-color-mark]")).toHaveLength(1);

    // formats: stepper bounded by minimum/maximum
    const stepper = canvas.getByRole("group", { name: "Replicas" });
    await userEvent.click(within(stepper).getByRole("button", { name: "Increase" }));
    await waitFor(() => expect(output().replicas).toBe(4));

    // lookups: owner is served by the extension's ext:team-members handler
    fireEvent.keyDown(canvas.getByRole("combobox", { name: /Owner/ }), { key: "ArrowDown" });
    expect(await within(document.body).findByText("Grace Hopper")).toBeInTheDocument();
    await userEvent.keyboard("{Escape}");

    // formats: uri is not registered by any extension, so its items still use the stock tag input
    const chips = canvasElement.querySelector<HTMLElement>('[data-example-chips="endpoints"]')!;
    expect(within(chips).getByPlaceholderText("Add tag…")).toHaveAttribute("type", "text");

    // formats: md is reserved and stays the built-in editor, not an extension control
    expect(canvasElement.querySelector('[data-example-card="notes"]')).toBeInTheDocument();
    expect(canvasElement.querySelectorAll("[data-example-color]")).toHaveLength(1);
  },
};
