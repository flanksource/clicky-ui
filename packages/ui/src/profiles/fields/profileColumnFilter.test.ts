import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { ProfileFieldEditorForm } from "./profileFieldEditor";
import {
  inferredFilterKind,
  patchColumnFilter,
  patchProfileField,
  PROFILE_FILTER_DEFAULT_LIMIT,
  type ProfileColumn,
} from "../wizard/profileWizardModel";

describe("patchColumnFilter", () => {
  it("merges one knob without disturbing the others", () => {
    expect(patchColumnFilter({ kind: "terms", limit: 10 }, { multi: false })).toEqual({
      kind: "terms",
      limit: 10,
      multi: false,
    });
  });

  // The distinction the server reads: an absent block means "infer this", an
  // empty one would mean "override it with nothing".
  it("drops the block once the last knob is cleared", () => {
    expect(patchColumnFilter({ limit: 10 }, { limit: undefined })).toBeUndefined();
  });

  it("drops a block that was never anything", () => {
    expect(patchColumnFilter(undefined, { field: undefined })).toBeUndefined();
  });

  it("creates the block on the first knob set", () => {
    expect(patchColumnFilter(undefined, { limit: 25 })).toEqual({ limit: 25 });
  });

  // false and 0 are values an author chose; only undefined means "unset".
  it("keeps a knob deliberately turned off", () => {
    expect(patchColumnFilter(undefined, { lookup: false })).toEqual({ lookup: false });
  });
});

describe("inferredFilterKind", () => {
  it.each([
    ["number", "range"],
    ["duration", "duration"],
    // A size literal has two bases, so "5MB" would mean two numbers; only
    // duration has one unambiguous grammar to offer.
    ["bytes", "range"],
    ["datetime", "time"],
    ["boolean", "boolean"],
    ["uuid", "exact"],
    ["json", "none"],
    ["key_values", "none"],
    ["string", "terms"],
    ["status", "terms"],
    [undefined, "terms"],
  ])("reads %s as %s, matching the server", (type, expected) => {
    expect(inferredFilterKind({ name: "c", ...(type ? { type } : {}) })).toBe(expected);
  });

  // A substring match and a day-granularity bound are choices an author makes;
  // no column type implies either.
  it.each(["number", "duration", "bytes", "datetime", "boolean", "uuid", "string"])(
    "never infers a substring match or a date bound for %s",
    (type) => {
      expect(["text", "date"]).not.toContain(inferredFilterKind({ name: "c", type }));
    },
  );
});

describe("the filter block survives editing the rest of the column", () => {
  it("is untouched by a label edit", () => {
    const column: ProfileColumn = {
      name: "tenant",
      type: "string",
      filter: { limit: 10, lookup: true },
    };
    expect(patchProfileField(column, { label: "Tenant" }).filter).toEqual({
      limit: 10,
      lookup: true,
    });
  });
});

describe("the column inspector", () => {
  const render = (field: ProfileColumn) =>
    renderToStaticMarkup(createElement(ProfileFieldEditorForm, { field, onChange: () => {} }));

  it("uses the backend default as the lookup limit placeholder", () => {
    const markup = render({ name: "tenant", type: "string" });

    expect(markup).toContain("Values offered");
    // Blank means the server's default, so the placeholder has to name it.
    expect(markup).toContain(`placeholder="${PROFILE_FILTER_DEFAULT_LIMIT}"`);
  });

  // A range is typed rather than picked, so a cap on a list it does not have
  // would be a control with nothing behind it. The same holds for every kind
  // that is written rather than chosen, which is what the split made explicit.
  it.each([
    ["a numeric range", { name: "retries", type: "number" }],
    ["a duration range", { name: "latency", type: "duration" }],
    ["a date range", { name: "day", type: "datetime", filter: { kind: "date" } }],
    ["an exact match", { name: "id", type: "uuid" }],
  ])("offers no lookup limit for %s", (_label, field) => {
    expect(render(field as ProfileColumn)).not.toContain("Values offered");
  });

  // The collapsed summary is the only place the chosen kind is named without
  // opening the section, so each one has to read as itself.
  it.each([
    [{ name: "latency", type: "duration" }, "Duration range"],
    [{ name: "day", type: "datetime", filter: { kind: "date" } }, "Date range"],
    [{ name: "at", type: "datetime" }, "Date &amp; time range"],
    [{ name: "id", type: "uuid" }, "Exact match"],
  ])("summarizes %o as its own kind", (field, summary) => {
    expect(render(field as ProfileColumn)).toContain(summary);
  });

  it("shows a declared limit in the value lookup input", () => {
    const markup = render({ name: "tenant", type: "string", filter: { limit: 7 } });
    const label = markup.indexOf('aria-label="Values offered"');
    const input = markup.slice(label - 200, label + 400);
    expect(input).toContain('value="7"');
  });

  it("selects Off for a disabled filter", () => {
    const markup = render({ name: "tenant", type: "string", filter: { disabled: true } });
    const label = markup.indexOf('aria-label="Off"');
    const input = markup.slice(label - 200, label + 100);
    expect(input).toContain('checked=""');
  });

  // Enumerated values are the answer a lookup would fetch, so the two cannot
  // both be on — and a disabled checkbox says so better than a silent override.
  it("disables the lookup toggle once values are listed", () => {
    const markup = render({
      name: "tenant",
      type: "string",
      filter: { options: ["prod", "dev"] },
    });
    expect(markup).toContain("Values are listed above");
    expect(markup).toContain("prod, dev");
  });

  // A name, a type and a backend field are all short; stretching them to half
  // a wide editor puts the label and the value it names at opposite ends of
  // the screen. The two expression editors are the exception — they need the
  // room, so they opt out.
  it("caps the labelled controls but not the expression editors", () => {
    const markup = render({ name: "tenant", type: "string" });

    expect(markup).toContain("max-w-md");
    for (const editor of ["JSONPath", "CEL expression"]) {
      const label = markup.slice(markup.indexOf(`>${editor}<`) - 400, markup.indexOf(`>${editor}<`));
      expect(label).not.toContain("max-w-md");
    }
  });
});
