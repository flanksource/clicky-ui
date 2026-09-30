import { act, fireEvent, render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import { readPreferences } from "./json-schema-form-preferences";
import type { JsonSchemaObject } from "./json-schema-form-types";

const STORAGE_KEY = "json-schema-form-debug-test";
const QUERY = "Select ClassGroupGUID, ClassGroupName From AsClassGroup";

// A screen as the OIPA emitter shapes it: a field the rule hides outright, one
// an ONCHANGE hides until an option is picked, and a query-backed combo.
const SCHEMA: JsonSchemaObject = {
  type: "object",
  properties: {
    MemberClassOption: {
      type: "string",
      title: "Member Class Action",
      "x-on-change": [{ when: { const: "00" }, hide: ["CurrentMemberClass"] }],
    },
    CurrentMemberClassGroup: {
      type: "string",
      title: "Current Member Class Group",
      default: "Plan:SchemeName",
      "x-oipa-query": { type: "SQL", sql: QUERY },
    },
    CurrentMemberClass: { type: "string", title: "Current Member Class" },
    Filler: { type: "string", title: "Filler", "x-hidden": true },
    Internal: { type: "string", title: "Internal" },
  },
};

const VALUE = { MemberClassOption: "00" };

function renderForm(extra: Partial<Parameters<typeof JsonSchemaForm>[0]> = {}) {
  return render(
    <JsonSchemaForm
      schema={SCHEMA}
      value={VALUE}
      onChange={vi.fn()}
      preferencesStorageKey={STORAGE_KEY}
      applyDefaults={false}
      hiddenKeys={["Internal"]}
      {...extra}
    />,
  );
}

function toggleDebug() {
  fireEvent.click(screen.getByRole("button", { name: "Form display options" }));
  fireEvent.click(screen.getByRole("menuitemcheckbox", { name: /Show hidden fields/ }));
}

function hiddenRows(container: HTMLElement): Record<string, string> {
  return Object.fromEntries(
    [...container.querySelectorAll<HTMLElement>("[data-debug-field]")]
      .filter((row) => row.dataset.debugHidden !== undefined)
      .map((row) => [row.dataset.debugField!, row.dataset.debugHidden!]),
  );
}

beforeEach(() => localStorage.removeItem(STORAGE_KEY));

describe("JsonSchemaForm debug mode", () => {
  it("leaves hidden fields out until debug is on", () => {
    renderForm();

    expect(screen.queryByText("Filler")).toBeNull();
    expect(screen.queryByText("Current Member Class")).toBeNull();
  });

  it("shows every hidden field with why it is hidden, but never a key the host lays out elsewhere", () => {
    const { container } = renderForm();
    toggleDebug();

    expect(hiddenRows(container)).toEqual({
      Filler: "hidden by the schema (x-hidden)",
      CurrentMemberClass: 'hidden by x-on-change on "MemberClassOption"',
    });
    expect(screen.queryByText("Internal")).toBeNull();
    expect(readPreferences(STORAGE_KEY).debug).toBe(true);
  });

  it("shows fields dropped as read-only or empty with their reason", () => {
    const schema: JsonSchemaObject = {
      type: "object",
      properties: { Computed: { type: "string", title: "Computed", readOnly: true }, Blank: { type: "string", title: "Blank" } },
    };
    const { container } = render(
      <JsonSchemaForm schema={schema} value={{ Computed: "x" }} onChange={vi.fn()} preferencesStorageKey={STORAGE_KEY} hideReadOnlyFields hideEmpty />,
    );
    toggleDebug();

    expect(hiddenRows(container)).toEqual({ Computed: "hidden: read-only", Blank: "hidden: empty" });
  });

  it("tells where a field comes from: its query, its default and its schema", () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ debug: true }));
    renderForm();

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Debug CurrentMemberClassGroup" }));

    const card = screen.getByTestId("json-schema-form-debug-card");
    expect(within(card).getByRole("group", { name: "Consumer extensions" })).toHaveTextContent('x-oipa-query { "type": "SQL"');
    expect(card).toHaveTextContent(QUERY);
    expect(card).toHaveTextContent("default Plan:SchemeName");
    expect(card).toHaveTextContent("/CurrentMemberClassGroup");
    expect(card.querySelector("[data-glyph]")).toHaveAttribute("data-glyph", "UiString");
    expect(within(card).queryByRole("button", { name: "Show more" })).toBeNull();
  });

  it("clamps a card too tall to read behind Show more, and opens the full details in a dialog that outlives the hover card", () => {
    vi.useFakeTimers();
    vi.spyOn(HTMLElement.prototype, "scrollHeight", "get").mockReturnValue(900);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(320);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ debug: true }));
    renderForm();

    fireEvent.mouseEnter(screen.getByRole("button", { name: "Debug MemberClassOption" }));
    const card = screen.getByTestId("json-schema-form-debug-card");
    const body = within(card).getByTestId("json-schema-form-debug-card-body");
    expect(body).toHaveAttribute("data-clamped", "true");

    fireEvent.click(within(card).getByRole("button", { name: "Show more" }));
    expect(body).toHaveAttribute("data-clamped", "false");

    fireEvent.click(within(card).getByRole("button", { name: "Open in dialog" }));
    fireEvent.mouseLeave(card);
    act(() => vi.advanceTimersByTime(500));

    expect(screen.queryByTestId("json-schema-form-debug-card")).toBeNull();
    const dialog = screen.getByRole("dialog", { name: "Member Class Action" });
    expect(within(dialog).getByTestId("json-schema-form-debug-card-body")).toHaveAttribute("data-clamped", "false");
    expect(dialog.querySelector('[data-action="hide"] [data-target]')).toHaveTextContent("CurrentMemberClass");
    vi.useRealTimers();
    vi.restoreAllMocks();
  });
});
