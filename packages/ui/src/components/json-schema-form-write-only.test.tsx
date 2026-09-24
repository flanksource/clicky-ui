import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { JsonSchemaObject, JsonSchemaProperty } from "./json-schema-form-types";

const TOKEN = "tok-123";
const NAME = "ops";

// writeOnly is JSON Schema's "sent, never read back": the form accepts it as an
// input, and leaves it out of anything that only shows values.
function schemaWith(token: JsonSchemaProperty): JsonSchemaObject {
  return {
    type: "object",
    properties: {
      token: { type: "string", title: "Token", ...token },
      name: { type: "string", title: "Name" },
    },
  };
}

function labels(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("label")).map((label) => label.textContent?.trim() ?? "");
}

describe("writeOnly fields", () => {
  it("renders as an ordinary input in an editable form", () => {
    const { container } = render(
      <JsonSchemaForm schema={schemaWith({ writeOnly: true })} value={{ token: TOKEN, name: NAME }} onChange={vi.fn()} showPreferencesMenu={false} />,
    );
    expect(labels(container)).toContain("Token");
    expect(container.querySelector<HTMLInputElement>("#jsf-token")?.value).toBe(TOKEN);
  });

  it("is omitted from a read-only form, value and label alike", () => {
    const { container } = render(
      <JsonSchemaForm schema={schemaWith({ writeOnly: true })} value={{ token: TOKEN, name: NAME }} onChange={vi.fn()} readOnly showPreferencesMenu={false} />,
    );
    expect(container.textContent).not.toContain(TOKEN);
    expect(container.querySelector("#jsf-token")).toBeNull();
    expect(labels(container)).toEqual(["Name"]);
  });

  it("is omitted when the field itself is readOnly", () => {
    const { container } = render(
      <JsonSchemaForm schema={schemaWith({ writeOnly: true, readOnly: true })} value={{ token: TOKEN }} onChange={vi.fn()} showPreferencesMenu={false} />,
    );
    expect(container.textContent).not.toContain(TOKEN);
    expect(container.textContent).not.toContain("Token");
  });

  it("still renders inside a disabled object, which is not a read-only view", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        auth: {
          type: "object",
          title: "Auth",
          "x-disabled": true,
          properties: { token: { type: "string", title: "Token", writeOnly: true } },
        },
      },
    };
    const { container } = render(
      <JsonSchemaForm schema={schema} value={{ auth: { token: TOKEN } }} onChange={vi.fn()} showPreferencesMenu={false} />,
    );
    expect(container.textContent).toContain("Token");
  });

  it("is removed by a listener that patches it readOnly", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        locked: {
          type: "boolean",
          title: "Locked",
          "x-on-change": [{ when: { const: true }, patch: { token: { readOnly: true } } }],
        },
        token: { type: "string", title: "Token", writeOnly: true },
      },
    };
    const unlocked = render(<JsonSchemaForm schema={schema} value={{ locked: false, token: TOKEN }} onChange={vi.fn()} showPreferencesMenu={false} />);
    expect(labels(unlocked.container)).toContain("Token");
    unlocked.unmount();

    const locked = render(<JsonSchemaForm schema={schema} value={{ locked: true, token: TOKEN }} onChange={vi.fn()} showPreferencesMenu={false} />);
    expect(locked.container.textContent).not.toContain(TOKEN);
    expect(labels(locked.container)).not.toContain("Token");
  });
});
