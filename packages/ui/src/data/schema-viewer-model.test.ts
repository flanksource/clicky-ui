import { expect, it } from "vitest";
import { buildSchemaTree } from "./schema-viewer-model";

it("keeps generic setup fields and typed step variants with distinct paths", () => {
  const roots = buildSchemaTree({ type: "object", properties: {
    setup: { type: "object", properties: { command: { type: "string" } } },
    steps: { type: "array", items: { oneOf: [
      { title: "exec", required: ["exec"], properties: { kind: { const: "exec" }, exec: { type: "string" } } },
      { title: "test", required: ["kind"], properties: { kind: { const: "test" }, paths: { type: "array", items: { type: "string" } } } },
    ] } },
  } });
  expect(roots.map((node) => node.label)).toEqual(["setup", "steps"]);
  expect(roots[0]?.children?.map((node) => node.label)).toEqual(["command"]);
  expect(roots[1]?.children?.map((node) => node.label)).toEqual(["exec", "test"]);
  expect(new Set(roots[1]?.children?.map((node) => node.key)).size).toBe(2);
  expect(roots[1]?.children?.[0]?.children?.map((node) => node.label)).toEqual(["kind", "exec"]);
});

it("keeps plain descriptions inline and expands fields with additional metadata", () => {
  const roots = buildSchemaTree({ type: "object", properties: {
    name: { type: "string", description: "Display name" },
    count: { type: "integer", default: 0 },
    enabled: { type: "boolean", default: false },
    mode: { const: "exec" },
    timeout: { type: "string", format: "duration" },
  } });
  expect(roots.map((node) => ({ label: node.label, expandable: Boolean(node.children?.length), value: node.meta?.constValue ?? node.meta?.defaultValue }))).toEqual([
    { label: "name", expandable: false, value: undefined },
    { label: "count", expandable: false, value: "0" },
    { label: "enabled", expandable: false, value: "false" },
    { label: "mode", expandable: false, value: '"exec"' },
    { label: "timeout", expandable: true, value: undefined },
  ]);
});

it("does not turn required-only alternatives into empty variant fields", () => {
  const roots = buildSchemaTree({ type: "object", properties: {
    exec: { type: "string" },
    script: { type: "string" },
  }, anyOf: [{ required: ["exec"] }, { required: ["script"] }] });
  expect(roots.map((node) => node.label)).toEqual(["exec", "script"]);
});
