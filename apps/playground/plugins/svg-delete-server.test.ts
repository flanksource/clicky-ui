// @vitest-environment node
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { afterEach, beforeEach, expect, it } from "vitest";
import { editableOpenings } from "./editable-jsx";
import { formatEditableSource } from "./editable-source-marker";
import { sourceHash } from "./source-hash";
import { applyVisualEdit, createVisualEditLineage } from "./visual-edits-server";

const SOURCE = 'export default () => <svg><rect width={20}/><circle r={4}/><text>Keep</text></svg>;';
let root: string;
let pagesDir: string;
let lineage = createVisualEditLineage();
const file = () => join(pagesDir, "diagram.tsx");
const disk = () => readFileSync(file(), "utf8");
const marker = (ordinal: number) => {
  const source = disk();
  const opening = editableOpenings(source, "diagram.tsx")[ordinal]!;
  return formatEditableSource({ file: "diagram.tsx", line: opening.line, column: opening.column, ordinal, hash: sourceHash(source) });
};
const apply = (source: string, edit: unknown, page = "diagram") => applyVisualEdit({ pagesDir, workspaceRoot: root, lineage, request: { page, source, edit } });

beforeEach(() => {
  mkdirSync(join(process.cwd(), ".tmp"), { recursive: true });
  root = mkdtempSync(join(process.cwd(), ".tmp/svg-delete-"));
  pagesDir = join(root, "pages");
  mkdirSync(pagesDir);
  writeFileSync(file(), SOURCE);
  lineage = createVisualEditLineage();
});
afterEach(() => rmSync(root, { recursive: true, force: true }));

it("deletes the selected SVG call site and rejects old markers after ordinals shift", () => {
  const rect = marker(0);
  const circle = marker(1);
  expect(apply(rect, { kind: "attributes", values: { width: 24 } }).statusCode).toBe(200);
  expect(apply(rect, { kind: "delete" })).toMatchObject({ statusCode: 200, body: { status: "applied" } });
  expect(disk()).toBe('export default () => <svg><circle r={4}/><text>Keep</text></svg>;');
  expect(apply(circle, { kind: "delete" })).toMatchObject({ statusCode: 409, body: { status: "stale" } });
  expect(apply(circle, { kind: "attributes", values: { r: 12 } }).statusCode).toBe(409);
  expect(apply(marker(0), { kind: "delete" }).statusCode).toBe(200);
  expect(disk()).toBe('export default () => <svg><text>Keep</text></svg>;');
});

it("does not delete source changed outside visual editing", () => {
  const original = marker(0);
  const changed = `${SOURCE}\n// Edited elsewhere\n`;
  writeFileSync(file(), changed);
  expect(apply(original, { kind: "delete" }).statusCode).toBe(409);
  expect(disk()).toBe(changed);
});

it("refuses deletion outside the selected page module graph", () => {
  writeFileSync(join(pagesDir, "other.tsx"), "export default () => <svg/>;");
  expect(apply(marker(0), { kind: "delete" }, "other")).toMatchObject({ statusCode: 422, body: { reason: "outside-page" } });
  expect(disk()).toBe(SOURCE);
});

it("rejects non-SVG call sites without changing source", () => {
  const source = 'import { BoxNode } from "@flanksource/facet"; export default () => <BoxNode title="Keep"/>;';
  writeFileSync(file(), source);
  expect(apply(marker(0), { kind: "delete" })).toMatchObject({ statusCode: 400, body: { error: expect.stringContaining("SVG") } });
  expect(disk()).toBe(source);
});
