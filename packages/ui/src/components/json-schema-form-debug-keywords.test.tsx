import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FORM_KEYWORD_GROUPS, groupKeywords } from "./json-schema-form-debug-groups";
import { DebugKeywords } from "./json-schema-form-debug-keywords";
import { ThemeProvider } from "../hooks/theme-provider";
import { THEME_STORAGE_KEY } from "../hooks/use-theme";
import type { ChangeListener, JsonSchemaProperty } from "./json-schema-form-types";

const here = dirname(fileURLToPath(import.meta.url));
const metaSchema = JSON.parse(readFileSync(resolve(here, "../../schemas/json-schema-form.schema.json"), "utf8")) as {
  properties: Record<string, unknown>;
};

const LISTENERS: ChangeListener[] = [
  { when: { const: "00" }, hide: ["CurrentMemberClass", "Rate"], set: { Mode: "manual" }, else: { show: ["Rate"] } },
  { when: { not: { enum: ["01", "02"] }, expr: "self.x > 1" }, patch: { Rate: { readOnly: true } } },
  { when: { const: "01" }, disable: ["Rate"] },
  { require: ["Amount"] },
];

function section(name: string): HTMLElement {
  return screen.getByRole("group", { name });
}

function texts(root: Element, selector: string): string[] {
  return [...root.querySelectorAll(selector)].map((el) => el.textContent ?? "");
}

function readActions(branch: Element | null): string[][] | undefined {
  if (!branch) return undefined;
  return [...branch.querySelectorAll<HTMLElement>("[data-action]")].map((row) => [
    row.dataset.action!,
    ...texts(row, "[data-detail]"),
    ...texts(row, "[data-target]"),
  ]);
}

function readListeners(root: Element) {
  return [...root.querySelectorAll<HTMLElement>("[data-debug-listener]")].map((listener) => ({
    active: listener.dataset.active,
    when: texts(listener, "[data-condition]"),
    then: readActions(listener.querySelector("[data-then]")),
    else: readActions(listener.querySelector("[data-else]")),
  }));
}

function glyphs(root: Element): string[] {
  return [...root.querySelectorAll("[data-glyph]")].map((el) => el.getAttribute("data-glyph")!);
}

describe("debug keyword catalog", () => {
  it("groups every x-* keyword the meta-schema documents", () => {
    const documented = Object.keys(metaSchema.properties).filter((k) => k.startsWith("x-")).sort();
    expect(Object.keys(FORM_KEYWORD_GROUPS).sort()).toEqual(documented);
  });

  it("sorts keywords into behaviour, presentation, opt-in, consumer and schema groups", () => {
    const prop: JsonSchemaProperty = {
      type: "string",
      title: "Heading only",
      default: "a",
      "x-hidden": true,
      "x-icon": "globe",
      "x-clicky-unit": "bytes",
      "x-oipa-query": { sql: "select 1" },
    };
    expect(groupKeywords(prop).map(({ group, entries }) => [group, entries.map(([k]) => k)])).toEqual([
      ["behaviour", ["x-hidden"]],
      ["presentation", ["x-icon"]],
      ["opt-in", ["x-clicky-unit"]],
      ["consumer", ["x-oipa-query"]],
      ["schema", ["type", "default"]],
    ]);
  });
});

describe("DebugKeywords", () => {
  it("lays each change listener out as its conditions, its actions and its else branch, and says which holds for the current value", () => {
    render(<DebugKeywords prop={{ type: "string", "x-on-change": LISTENERS }} value="00" />);

    expect(readListeners(section("Behaviour"))).toEqual([
      {
        active: "true",
        when: ['= "00"'],
        then: [
          ["hide", "CurrentMemberClass", "Rate"],
          ["set", '= "manual"', "Mode"],
        ],
        else: [["show", "Rate"]],
      },
      { active: "unknown", when: ['∉ ["01","02"]', "expr self.x > 1"], then: [["patch", "readOnly: true", "Rate"]], else: undefined },
      { active: "false", when: ['= "01"'], then: [["disable", "Rate"]], else: undefined },
      { active: "true", when: ["always"], then: [["require", "Amount"]], else: undefined },
    ]);
  });

  it("gathers the fields a listener sets to the same value, or patches the same way, onto one row", () => {
    const listener: ChangeListener = {
      when: { const: "01" },
      patch: {
        CategoryCode: { readOnly: true },
        MemberClassGroupName: { readOnly: false },
        LoanOverride: { readOnly: true },
        MemberClassDate: { readOnly: true, title: "Class date" },
      },
      set: { CategoryCode: "", LoanOverride: "00", MemberClassDate: "", MemberClassOption: "00" },
    };
    render(<DebugKeywords prop={{ type: "string", "x-on-change": [listener] }} value="01" />);

    expect(readListeners(section("Behaviour"))[0]!.then).toEqual([
      ["set", '= ""', "CategoryCode", "MemberClassDate"],
      ["set", '= "00"', "LoanOverride", "MemberClassOption"],
      ["patch", "readOnly: true", "CategoryCode", "LoanOverride"],
      ["patch", "readOnly: false", "MemberClassGroupName"],
      ["patch", 'readOnly: true, title: "Class date"', "MemberClassDate"],
    ]);
  });

  it("marks each condition and action with its palette glyph, in the dark variant under a dark theme", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "dark");
    const { container } = render(
      <ThemeProvider>
        <DebugKeywords prop={{ type: "string", "x-on-change": LISTENERS }} value="00" />
      </ThemeProvider>,
    );
    localStorage.removeItem(THEME_STORAGE_KEY);

    const first = container.querySelector("[data-debug-listener]")!;
    expect(glyphs(first)).toEqual(["UiConstant1Dark", "UiEyeClosed", "UiVariable5Dark", "UiEye"]);
    expect(glyphs(container.querySelectorAll("[data-debug-listener]")[1]!)).toEqual([
      "UiProhibit",
      "UiEvaluateExpressionDark",
      "UiEditModeDark",
    ]);
  });

  it("heads each group and known keyword with its palette glyph, leaving consumer keys unmarked", () => {
    render(
      <DebugKeywords
        prop={{
          type: "string",
          readOnly: true,
          "x-clicky-lookup": { url: "/api/v1/connection", filter: "name" },
          "x-oipa-query": { sql: "select 1" },
        }}
      />,
    );

    expect(glyphs(section("Behaviour"))).toEqual(["UiHibernateEvent", "UiDatabaseLink"]);
    expect(glyphs(section("Consumer extensions"))).toEqual(["UiExtension"]);
    expect(glyphs(section("Schema"))).toEqual(["UiDataSchema", "UiString", "UiReadAccess"]);
  });

  it("merges the x-enum-* maps into one option table and flags keys outside the enum", () => {
    render(
      <DebugKeywords
        prop={{
          type: "string",
          enum: ["list", "map"],
          "x-enum-labels": { list: "List", map: "Map", gone: "Gone" },
          "x-enum-descriptions": { list: "Many values" },
          "x-enum-tones": { map: "indigo" },
          "x-enum-display": "segmented",
        }}
      />,
    );

    const rows = within(section("Presentation"))
      .getAllByRole("row")
      .map((row) => within(row).queryAllByRole("cell").map((cell) => cell.textContent));
    expect(rows.filter((cells) => cells.length > 0)).toEqual([
      ["list", "List", "Many values", ""],
      ["map", "Map", "", "indigo"],
      ["gone ⚠ not in enum", "Gone", "", ""],
    ]);
    expect(section("Presentation")).toHaveTextContent("x-enum-display segmented");
  });

  it("spells out a lookup descriptor and an x-item summary spec", () => {
    render(
      <DebugKeywords
        prop={{
          type: "array",
          "x-clicky-lookup": {
            url: "/api/v1/connection",
            filter: "name",
            multi: true,
            scope: { param: "types", from: "provider.type" },
            hierarchy: { delimiters: "./" },
          },
          "x-item": { title: ["name", "key"], fallback: "Param", summary: ["type", { property: "name", pattern: "{{.params.{}}}" }], glyph: "type" },
        }}
      />,
    );

    expect(section("Behaviour")).toHaveTextContent(
      'x-clicky-lookup GET /api/v1/connection filter name · multi-select · scope types ← provider.type · tree split on "./"',
    );
    expect(section("Presentation")).toHaveTextContent(
      "x-item title name | key (else Param) · summary type · {{.params.name}} · glyph type",
    );
  });

  it("marks consumer extensions as not read by the form and pretty-prints them", () => {
    render(<DebugKeywords prop={{ type: "string", "x-oipa-query": { type: "SQL", sql: "select 1" } }} />);

    const consumer = section("Consumer extensions");
    expect(consumer).toHaveTextContent("not read by the form");
    expect(consumer.querySelector("pre")?.textContent).toBe('{\n  "type": "SQL",\n  "sql": "select 1"\n}');
  });
});
