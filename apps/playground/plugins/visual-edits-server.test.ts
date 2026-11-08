// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { editableOpenings } from "./editable-jsx";
import { formatEditableSource } from "./editable-source-marker";
import { applyVisualEdit, createVisualEditLineage } from "./visual-edits-server";
import { sourceHash } from "./source-hash";

const FACET = 'import { BoxNode } from "@flanksource/facet";\n';
const PAGE = 'import { lazy } from "react";\nconst Diagram = lazy(() => import("./_d/diagram"));\nexport default () => <Diagram />;\n';
const DIAGRAM = `${FACET}import { Cell } from "./cell";
export default () => (
  <>
    <BoxNode title="Auth" variant="primary" />
    <BoxNode title="Store" variant={pick()} />
    <Cell>Gateway</Cell>
  </>
);
`;
const CELL = `${FACET}export const Cell = ({ children }: { children: string }) => <BoxNode title={children} />;\n`;
const OTHER = `${FACET}export default () => <BoxNode title="Alone" />;\n`;

describe("applyVisualEdit", () => {
  let root: string;
  let pagesDir: string;
  let lineage = createVisualEditLineage();

  const file = (rel: string) => join(pagesDir, rel);
  const disk = (rel: string) => readFileSync(file(rel), "utf8");
  const marker = (rel: string, ordinal: number) => {
    const text = disk(rel);
    const opening = editableOpenings(text, rel)[ordinal]!;
    return formatEditableSource({ file: rel, line: opening.line, column: opening.column, ordinal, hash: sourceHash(text) });
  };
  const apply = (request: unknown) => applyVisualEdit({ pagesDir, workspaceRoot: root, lineage, request });
  const style = (source: string, value: string) => ({ page: "flanksource/diagrams", source, edit: { kind: "style", prop: "variant", value } });

  beforeEach(() => {
    mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
    root = mkdtempSync(join(process.cwd(), ".tmp", "visual-edits-"));
    pagesDir = join(root, "pages");
    mkdirSync(join(pagesDir, "flanksource", "_d"), { recursive: true });
    writeFileSync(file("flanksource/diagrams.tsx"), PAGE);
    writeFileSync(file("flanksource/_d/diagram.tsx"), DIAGRAM);
    writeFileSync(file("flanksource/_d/cell.tsx"), CELL);
    writeFileSync(file("flanksource/other.tsx"), OTHER);
    lineage = createVisualEditLineage();
  });

  afterEach(() => {
    rmSync(root, { recursive: true, force: true });
  });

  it("saves a data-backed SVG label and its classes across both modules", () => {
    writeFileSync(file("flanksource/svg.tsx"), 'import { label } from "./_d/label"; export default () => <svg><text className="fill-primary">{label}</text></svg>');
    writeFileSync(file("flanksource/_d/label.ts"), 'export const label = "Gateway";');
    const result = apply({ page: "flanksource/svg", source: marker("flanksource/svg.tsx", 0), edit: { kind: "attributes", values: { children: "API", className: "fill-foreground" }, textFrom: "Gateway" } });
    expect({ status: result.statusCode, page: disk("flanksource/svg.tsx"), label: disk("flanksource/_d/label.ts") }).toEqual({
      status: 200,
      page: 'import { label } from "./_d/label"; export default () => <svg><text className="fill-foreground">{label}</text></svg>',
      label: 'export const label = "API";',
    });
  });

  it("does not write a resolved SVG label when a companion attribute is computed", () => {
    const source = 'import { label } from "./_d/label"; export default () => <svg><text fill={paint}>{label}</text></svg>';
    const label = 'export const label = "Gateway";';
    writeFileSync(file("flanksource/svg.tsx"), source);
    writeFileSync(file("flanksource/_d/label.ts"), label);
    const result = apply({ page: "flanksource/svg", source: marker("flanksource/svg.tsx", 0), edit: { kind: "attributes", values: { children: "API", fill: "red" }, textFrom: "Gateway" } });
    expect({ status: result.statusCode, page: disk("flanksource/svg.tsx"), label: disk("flanksource/_d/label.ts") }).toEqual({ status: 422, page: source, label });
  });

  it("edits a lazily imported _ helper and accepts a second edit made with the original marker", () => {
    const original = marker("flanksource/_d/diagram.tsx", 0);

    const first = apply(style(original, "danger"));
    const second = apply(style(original, "success"));

    expect(first).toMatchObject({
      statusCode: 200,
      body: { status: "applied", file: "flanksource/_d/diagram.tsx", path: "pages/flanksource/_d/diagram.tsx", line: 5 },
      written: file("flanksource/_d/diagram.tsx"),
    });
    expect(second.statusCode).toBe(200);
    expect(disk("flanksource/_d/diagram.tsx")).toContain('<BoxNode title="Auth" variant="success" />');
    expect(second.body).toMatchObject({ hash: sourceHash(disk("flanksource/_d/diagram.tsx")) });
  });

  it("writes a text edit into the module that holds the text, not the call-site wrapper", () => {
    const cell = marker("flanksource/_d/cell.tsx", 0);

    const result = apply({ page: "flanksource/diagrams", source: cell, edit: { kind: "text", prop: "title", from: "Gateway", to: "Door" } });

    expect(result).toMatchObject({ statusCode: 200, body: { status: "applied", file: "flanksource/_d/diagram.tsx" } });
    expect(disk("flanksource/_d/diagram.tsx")).toContain("<Cell>Door</Cell>");
    expect(disk("flanksource/_d/cell.tsx")).toBe(CELL);
  });

  it("refuses a call site outside the page's module graph and writes nothing", () => {
    const result = apply(style(marker("flanksource/other.tsx", 0), "danger"));

    expect(result).toMatchObject({ statusCode: 422, body: { status: "refused", reason: "outside-page", file: "flanksource/other.tsx" } });
    expect(disk("flanksource/other.tsx")).toBe(OTHER);
  });

  it("answers 409 stale when the file changed outside visual edits after render", () => {
    const original = marker("flanksource/_d/diagram.tsx", 0);
    writeFileSync(file("flanksource/_d/diagram.tsx"), `${DIAGRAM}// edited in Monaco\n`);

    const result = apply(style(original, "danger"));

    expect(result).toMatchObject({ statusCode: 409, body: { status: "stale", file: "flanksource/_d/diagram.tsx" } });
    expect(disk("flanksource/_d/diagram.tsx")).toBe(`${DIAGRAM}// edited in Monaco\n`);
  });

  it("answers 409 stale for a marker taken before an outside edit even after a visual edit followed it", () => {
    const original = marker("flanksource/_d/diagram.tsx", 0);
    writeFileSync(file("flanksource/_d/diagram.tsx"), `${DIAGRAM}// edited in Monaco\n`);
    const fresh = marker("flanksource/_d/diagram.tsx", 0);
    apply(style(fresh, "danger"));

    expect(apply(style(original, "success")).statusCode).toBe(409);
  });

  it("refuses a computed variant with the call-site location and a human sentence", () => {
    const result = apply(style(marker("flanksource/_d/diagram.tsx", 1), "danger"));

    expect(result).toMatchObject({
      statusCode: 422,
      body: {
        status: "refused",
        reason: "computed",
        file: "flanksource/_d/diagram.tsx",
        line: 6,
        error: expect.stringContaining("flanksource/_d/diagram.tsx:6:"),
      },
    });
  });

  it("reports text that lives in several modules as ambiguous, then applies the chosen candidate", () => {
    writeFileSync(file("flanksource/_d/labels.ts"), 'export const label = "Auth";\n');
    writeFileSync(file("flanksource/_d/diagram.tsx"), `import "./labels";\n${DIAGRAM}`);
    const source = marker("flanksource/_d/cell.tsx", 0);
    const edit = { kind: "text", prop: "title", from: "Auth", to: "Gate" };

    const ambiguous = apply({ page: "flanksource/diagrams", source, edit });
    expect(ambiguous).toMatchObject({ statusCode: 422, body: { status: "ambiguous", candidates: [{ file: "flanksource/_d/diagram.tsx" }, { file: "flanksource/_d/labels.ts" }] } });
    const choose = (ambiguous.body as { candidates: { id: string }[] }).candidates[1]!.id;

    expect(apply({ page: "flanksource/diagrams", source, edit, choose }).statusCode).toBe(200);
    expect(disk("flanksource/_d/labels.ts")).toBe('export const label = "Gate";\n');
  });

  it("reports text that only exists in a module outside src/pages as external", () => {
    writeFileSync(file("flanksource/_d/cell.tsx"), `import "../../../shared/brand";\n${CELL}`);
    mkdirSync(join(root, "shared"));
    writeFileSync(join(root, "shared", "brand.ts"), 'export const brand = "Mystery";\n');

    const result = apply({
      page: "flanksource/diagrams",
      source: marker("flanksource/_d/cell.tsx", 0),
      edit: { kind: "text", prop: "title", from: "Mystery", to: "Known" },
    });

    expect(result).toMatchObject({ statusCode: 422, body: { status: "refused", reason: "external" } });
  });

  describe("attributes edits", () => {
    const SVG_PAGE = `${FACET}export default () => (
  <svg>
    <BoxNode title="A" />
    <rect x={1} y={zone.y} fill="#fff" />
    <circle r={3} />
    <ellipse {...rest} rx={1} />
  </svg>
);
`;
    const attributes = (source: string, values: unknown) => ({ page: "flanksource/svg", source, edit: { kind: "attributes", values } });

    beforeEach(() => {
      writeFileSync(file("flanksource/svg.tsx"), SVG_PAGE);
    });

    it.each([
      ["replaces a number and a string literal", 1, { x: 40, fill: "#eef" }, '<rect x={1} y={zone.y} fill="#fff" />', '<rect x={40} y={zone.y} fill="#eef" />', 5],
      ["inserts missing attributes", 2, { stroke: "#123", strokeWidth: 2 }, "<circle r={3} />", '<circle r={3} stroke="#123" strokeWidth={2} />', 6],
      ["replaces after a spread", 3, { rx: 9 }, "<ellipse {...rest} rx={1} />", "<ellipse {...rest} rx={9} />", 7],
    ])("%s and answers with the written line", (_name, ordinal, values, before, after, line) => {
      const result = apply(attributes(marker("flanksource/svg.tsx", ordinal), values));

      expect(result).toMatchObject({
        statusCode: 200,
        body: { status: "applied", file: "flanksource/svg.tsx", path: "pages/flanksource/svg.tsx", line },
        written: file("flanksource/svg.tsx"),
      });
      expect(disk("flanksource/svg.tsx")).toBe(SVG_PAGE.replace(before, after));
    });

    it("refuses a computed attribute naming it, with the location, and writes nothing", () => {
      const result = apply(attributes(marker("flanksource/svg.tsx", 1), { fill: "#eef", y: 5 }));

      expect(result).toMatchObject({
        statusCode: 422,
        body: {
          status: "refused",
          reason: "computed",
          attribute: "y",
          file: "flanksource/svg.tsx",
          line: 5,
          column: 17,
          error: expect.stringMatching(/^flanksource\/svg\.tsx:5:17: y is computed there/),
        },
      });
      expect(disk("flanksource/svg.tsx")).toBe(SVG_PAGE);
    });

    it("refuses an attribute shadowed by a later spread, and an unchanged value", () => {
      expect(apply(attributes(marker("flanksource/svg.tsx", 3), { ry: 2 }))).toMatchObject({
        statusCode: 422,
        body: { reason: "spread", attribute: "ry", line: 7 },
      });
      expect(apply(attributes(marker("flanksource/svg.tsx", 2), { r: 3 }))).toMatchObject({
        statusCode: 422,
        body: { reason: "unchanged", attribute: "r" },
      });
      expect(disk("flanksource/svg.tsx")).toBe(SVG_PAGE);
    });

    it.each([
      ["an attribute that is not in the schema of the tag at the marker (derived from source, not the client)", 2, { width: 3 }, /"width" is not an editable attribute of <circle>/],
      ["an event handler attribute", 1, { onClick: "alert(1)" }, /"onClick" is not an editable attribute of <rect>/],
      ["a number given as a string", 1, { x: "40" }, /"x" of <rect> must be a finite number/],
      ["a string given as a number", 1, { fill: 4 }, /"fill" of <rect> must be a non-empty string/],
      ["an infinite number", 1, { x: Number.POSITIVE_INFINITY }, /finite number/],
      ["an opacity above 1", 1, { opacity: 2 }, /at most 1/],
      ["a facet component marker", 0, { x: 1 }, /no SVG schema for <BoxNode>/],
      ["a nested value", 1, { x: { a: 1 } }, /"edit\.values\.x" must be a string or a number/],
      ["an empty values object", 1, {}, /non-empty object/],
      ["a non-object values", 1, "x=1", /non-empty object/],
    ])("answers 400 for %s", (_name, ordinal, values, message) => {
      const result = apply(attributes(marker("flanksource/svg.tsx", ordinal), values));

      expect(result).toMatchObject({ statusCode: 400, body: { status: "invalid", error: expect.stringMatching(message) } });
      expect(disk("flanksource/svg.tsx")).toBe(SVG_PAGE);
    });

    it("answers 409 stale when the file changed after render", () => {
      const original = marker("flanksource/svg.tsx", 1);
      writeFileSync(file("flanksource/svg.tsx"), `${SVG_PAGE}// edited elsewhere\n`);

      expect(apply(attributes(original, { x: 2 }))).toMatchObject({ statusCode: 409, body: { status: "stale" } });
    });
  });

  it.each([
    ["a non-object body", null],
    ["a missing page", { source: "x", edit: {} }],
    ["an invalid slug", { page: "../x", source: "x", edit: {} }],
    ["a malformed marker", { page: "flanksource/diagrams", source: "nope", edit: { kind: "style", prop: "variant", value: "a" } }],
    ["an unknown edit kind", { page: "flanksource/diagrams", source: "a.tsx:1:1#0@0123456789ab", edit: { kind: "delete" } }],
    ["a style value with quotes", { page: "flanksource/diagrams", source: "a.tsx:1:1#0@0123456789ab", edit: { kind: "style", prop: "variant", value: 'a"b' } }],
    ["a style prop other than variant/role", { page: "flanksource/diagrams", source: "a.tsx:1:1#0@0123456789ab", edit: { kind: "style", prop: "className", value: "a" } }],
    ["a missing text field", { page: "flanksource/diagrams", source: "a.tsx:1:1#0@0123456789ab", edit: { kind: "text", prop: "title", from: "a" } }],
  ])("rejects %s with 400", (_name, request) => {
    expect(apply(request)).toMatchObject({ statusCode: 400, body: { status: "invalid", error: expect.any(String) } });
  });
});
