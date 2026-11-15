import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import extension from "./examples/form-extensions/extension";
import schema from "./examples/form-extensions/schema.json";
import value from "./examples/form-extensions/value.json";
import type { FormExtensionSource } from "./json-schema-form-extension-api";
import type { JsonSchemaObject } from "./json-schema-form-types";

// The shared fixture every extension point is exercised by: this test, the
// Storybook story, the PageForm E2E test and the playground demo load the same
// schema.json (which declares its own extension in x-clicky-extensions) +
// extension.tsx + value.json. Here the loader resolves the statically imported
// module, standing in for a host that serves the declared ref.

let latest: Record<string, unknown> = value;

const extensionLoader = async (source: FormExtensionSource) => {
  if (!("ref" in source) || source.ref !== "examples/form-extensions/extension.tsx") throw new Error(`unexpected extension source ${JSON.stringify(source)}`);
  return extension;
};

function Harness() {
  const [current, setCurrent] = useState<Record<string, unknown>>(value);
  latest = current;
  return (
    <JsonSchemaForm
      title="Service"
      schema={schema as JsonSchemaObject}
      value={current}
      onChange={setCurrent}
      layout={{ mode: "cards" }}
      extensionLoader={extensionLoader}
      showPreferencesMenu={false}
      persistPreferences={false}
    />
  );
}

// The schema declares its extension, so the form shows Loading until it is loaded.
async function renderLoaded() {
  const view = render(<Harness />);
  expect(screen.getByRole("status", { name: "Loading" })).toBeInTheDocument();
  await screen.findByRole("radiogroup", { name: "Accent" });
  return view;
}

describe("form-extensions example", () => {
  it("replaces the Title slot", async () => {
    const { container } = await renderLoaded();
    expect(container.querySelector("[data-example-title]")).toHaveTextContent("Service");
  });

  it("lays rows out as cards (form layout.mode) and endpoints as chips (field x-layout)", async () => {
    const { container } = await renderLoaded();
    expect(container.querySelector("[data-example-cards]")).toBeInTheDocument();
    expect(container.querySelector('[data-example-card="name"]')).toBeInTheDocument();
    expect(container.querySelector('[data-example-card="color"]')).toBeInTheDocument();
    expect(container.querySelector('[data-example-chips="endpoints"]')).toBeInTheDocument();
    expect(container.querySelector('[data-example-card="endpoints"]')).not.toBeInTheDocument();
  });

  it("badges the name field through the extension pre hook", async () => {
    const { container } = await renderLoaded();
    expect(container.querySelector('[data-example-card="name"]')).toHaveTextContent("id");
    expect(container.querySelector('[data-example-card="owner"]')).not.toHaveTextContent(/\bid\b/);
  });

  it("renders the color format as swatches, commits a pick, and marks the label through the post hook", async () => {
    const { container } = await renderLoaded();
    const group = screen.getByRole("radiogroup", { name: "Accent" });
    expect(within(group).getAllByRole("radio")).toHaveLength(3);
    expect(within(group).getByRole("radio", { name: "#0ea5e9" })).toBeChecked();
    fireEvent.click(within(group).getByRole("radio", { name: "#f97316" }));
    expect(latest.color).toBe("#f97316");
    expect(container.querySelectorAll("[data-example-color-mark]")).toHaveLength(1);
  });

  it("renders the stepper format bounded by the schema minimum and maximum", async () => {
    await renderLoaded();
    const stepper = screen.getByRole("group", { name: "Replicas" });
    expect(within(stepper).getByLabelText("Replicas value")).toHaveTextContent("3");
    fireEvent.click(within(stepper).getByRole("button", { name: "Increase" }));
    expect(latest.replicas).toBe(4);
    for (let i = 0; i < 10; i++) fireEvent.click(within(stepper).getByRole("button", { name: "Increase" }));
    expect(latest.replicas).toBe(10);
    expect(within(stepper).getByRole("button", { name: "Increase" })).toBeDisabled();
  });

  it("serves the owner lookup from the extension's ext:team-members handler", async () => {
    await renderLoaded();
    const owner = screen.getByRole("combobox", { name: /Owner/ });
    fireEvent.keyDown(owner, { key: "ArrowDown" });
    expect(await screen.findByText("Grace Hopper")).toBeInTheDocument();
    expect(screen.getByText("Linus Torvalds")).toBeInTheDocument();
  });

  it("keeps rendering the unregistered uri item format and the reserved md format built in", async () => {
    const { container } = await renderLoaded();
    const chips = container.querySelector<HTMLElement>('[data-example-chips="endpoints"]')!;
    expect(within(chips).getByText("https://checkout.example.com")).toBeInTheDocument();
    expect(within(chips).getByPlaceholderText("Add tag…")).toHaveAttribute("type", "text");
    expect(container.querySelector('[data-example-card="notes"]')).toBeInTheDocument();
    expect(container.querySelectorAll("[data-example-color]")).toHaveLength(1);
  });
});
