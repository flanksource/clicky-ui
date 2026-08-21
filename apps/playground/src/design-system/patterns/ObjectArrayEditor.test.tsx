/** @vitest-environment jsdom */

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import type { JsonSchemaObject } from "@flanksource/clicky-ui";

import { ObjectArrayEditor } from "./ObjectArrayEditor";

afterEach(cleanup);

const SCHEMA: JsonSchemaObject = {
  type: "object",
  properties: {
    signatories: {
      type: "array",
      title: "Signatories",
      items: {
        type: "object",
        properties: {
          name: { type: "string", title: "Name" },
          role: { type: "string", title: "Role" },
        },
      },
      "x-array-display": "accordion",
      "x-item": {
        title: ["name"],
        summary: [{ property: "role" }],
        noun: "signatory",
        nounPlural: "signatories",
      },
    },
  },
};

const VALUE = { signatories: [{ name: "Ada Lovelace", role: "Security Owner" }] };

describe("ObjectArrayEditor", () => {
  it("renders a caller's array as collapsed identity rows with the body deferred", () => {
    render(<ObjectArrayEditor schema={SCHEMA} initial={VALUE} idPrefix="editor-test" />);

    const row = screen.getByRole("button", { name: "Ada Lovelace Security Owner" });
    expect(row.getAttribute("aria-expanded")).toBe("false");
    expect(screen.queryByRole("textbox", { name: /Name/ })).toBeNull();
  });

  it("names the add row and the count from the caller's noun", () => {
    render(<ObjectArrayEditor schema={SCHEMA} initial={VALUE} idPrefix="editor-test" />);

    expect(screen.getByText("1 signatory")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Add signatory" })).toBeTruthy();
  });

  it("hides the preferences menu, which belongs to a settings surface and not a specimen", () => {
    render(<ObjectArrayEditor schema={SCHEMA} initial={VALUE} idPrefix="editor-test" />);

    expect(screen.queryByRole("button", { name: /preferences/i })).toBeNull();
  });
});
