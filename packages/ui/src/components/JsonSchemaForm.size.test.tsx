import { describe, expect, it, vi } from "vitest";
import { render } from "@testing-library/react";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject } from "./json-schema-form-types";

const stringSchema: JsonSchemaObject = {
  type: "object",
  properties: { Name: { type: "string" } },
};

function firstInput(container: HTMLElement): HTMLElement {
  const el = container.querySelector<HTMLElement>("input[data-jsf-input]");
  if (!el) throw new Error("no [data-jsf-input] input rendered");
  return el;
}

describe("JsonSchemaForm size", () => {
  it("defaults to the md baseline (h-9 text-sm) when size is unset", () => {
    const { container } = render(
      <JsonSchemaForm schema={stringSchema} value={{ Name: "" }} onChange={vi.fn()} />,
    );
    const input = firstInput(container);
    expect(input.className).toContain("h-9");
    expect(input.className).toContain("text-sm");
  });

  it("renders xs inputs at h-7 text-xs", () => {
    const { container } = render(
      <JsonSchemaForm schema={stringSchema} value={{ Name: "" }} onChange={vi.fn()} size="xs" />,
    );
    const input = firstInput(container);
    expect(input.className).toContain("h-7");
    expect(input.className).toContain("text-xs");
    expect(input.className).not.toContain("h-9");
  });

  it("renders xl inputs at h-11 text-lg", () => {
    const { container } = render(
      <JsonSchemaForm schema={stringSchema} value={{ Name: "" }} onChange={vi.fn()} size="xl" />,
    );
    const input = firstInput(container);
    expect(input.className).toContain("h-11");
    expect(input.className).toContain("text-lg");
  });

  it("scales the label text size", () => {
    const { container: xs } = render(
      <JsonSchemaForm schema={stringSchema} value={{ Name: "" }} onChange={vi.fn()} size="xs" />,
    );
    const { container: xl } = render(
      <JsonSchemaForm schema={stringSchema} value={{ Name: "" }} onChange={vi.fn()} size="xl" />,
    );
    const xsLabel = xs.querySelector("label");
    const xlLabel = xl.querySelector("label");
    expect(xsLabel?.className).toContain("text-xs");
    expect(xlLabel?.className).toContain("text-lg");
  });

  it("threads size into a nested object field's input", () => {
    const nested: JsonSchemaObject = {
      type: "object",
      properties: {
        addr: { type: "object", properties: { city: { type: "string" } } },
      },
    };
    const { container } = render(
      <JsonSchemaForm schema={nested} value={{ addr: { city: "" } }} onChange={vi.fn()} size="lg" />,
    );
    const input = firstInput(container);
    expect(input.className).toContain("h-10");
    expect(input.className).toContain("text-base");
  });

  it("matches the inline label cell min-height to the size", () => {
    const { container } = render(
      <JsonSchemaForm schema={stringSchema} value={{ Name: "" }} onChange={vi.fn()} size="sm" inline />,
    );
    const cell = [...container.querySelectorAll<HTMLElement>("div")].find((el) =>
      el.className.includes("min-h-8"),
    );
    expect(cell).toBeTruthy();
  });

  it("tightens the row gap for smaller sizes and caps it past lg", () => {
    function rowGap(size: "xs" | "md" | "lg" | "xl"): string {
      const { container } = render(
        <JsonSchemaForm schema={stringSchema} value={{ Name: "" }} onChange={vi.fn()} size={size} />,
      );
      const grid = [...container.querySelectorAll<HTMLElement>("div.grid")][0];
      return grid?.className ?? "";
    }
    expect(rowGap("xs")).toContain("gap-1");
    expect(rowGap("md")).toContain("gap-2.5");
    // lg and xl share the same capped gap.
    const lg = rowGap("lg");
    const xl = rowGap("xl");
    expect(lg).toContain("gap-4");
    expect(xl).toContain("gap-4");
  });
});

describe("JsonSchemaForm idPrefix", () => {
  it("namespaces generated input ids so two forms don't collide", () => {
    const { container } = render(
      <div>
        <JsonSchemaForm schema={stringSchema} value={{ Name: "" }} onChange={vi.fn()} idPrefix="a" />
        <JsonSchemaForm schema={stringSchema} value={{ Name: "" }} onChange={vi.fn()} idPrefix="b" />
      </div>,
    );
    const ids = [...container.querySelectorAll<HTMLElement>("input[data-jsf-input]")].map((el) => el.id);
    expect(ids).toEqual(["jsf-a-Name", "jsf-b-Name"]);
    // No duplicate ids in the document.
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps the bare id when no prefix is given", () => {
    const { container } = render(
      <JsonSchemaForm schema={stringSchema} value={{ Name: "" }} onChange={vi.fn()} />,
    );
    expect(firstInput(container).id).toBe("jsf-Name");
  });
});
