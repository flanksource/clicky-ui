// Guards the story backend's remote-pagination contract: the fake client must
// slice its master row set per the request's limit/offset and report a
// {total, limit, offset} envelope, because the AppShell/rpc stories rely on it
// to exercise the same path a real clicky-rpc backend takes.

import { describe, expect, it } from "vitest";
import { FAKE_CLIENT, SAMPLE_SPEC } from "./rpc-story.fixtures";
import { WIDGETS_FIXTURE } from "./rpc-story-fixtures/widgets.fixture";
import { DEFAULT_PAGE_LIMIT } from "./rpc-story-fixtures/surface-fixture";
import type { ClickyDocument, ClickyNode } from "../data/Clicky";

const WIDGETS_PATH = "/api/v1/widgets";

function tableRowNames(stdout: string | undefined): string[] {
  if (!stdout) throw new Error("expected a Clicky document on stdout");
  const doc = JSON.parse(stdout) as ClickyDocument;
  const node = doc.node as ClickyNode & { rows?: Array<{ cells?: Record<string, ClickyNode> }> };
  if (node.kind !== "table") throw new Error(`expected a table node, got ${String(node.kind)}`);
  return (node.rows ?? []).map((row) => {
    const cell = row.cells?.name;
    if (!cell) throw new Error("row is missing a name cell");
    return cell.text ?? "";
  });
}

async function listWidgets(params: Record<string, string>) {
  return FAKE_CLIENT.executeCommand(WIDGETS_PATH, "get", params);
}

describe("rpc story fixtures — remote pagination", () => {
  it("declares both a limit and an offset role so a pagination config can be built", () => {
    // parametersToFormConfig only builds config.pagination when BOTH roles are
    // present; without this the DataTable footer never renders.
    const parameters = SAMPLE_SPEC.paths[WIDGETS_PATH]?.get?.parameters ?? [];
    const roles = parameters.map((parameter) => parameter["x-clicky"]?.role);
    expect(roles).toContain("limit");
    expect(roles).toContain("offset");
  });

  it("returns only the requested slice and reports the full total", async () => {
    const response = await listWidgets({ limit: "10", offset: "0" });

    expect(response.pagination).toEqual({
      total: WIDGETS_FIXTURE.listRows.length,
      limit: 10,
      offset: 0,
    });
    expect(tableRowNames(response.stdout)).toHaveLength(10);
  });

  it("returns a disjoint page when the offset advances", async () => {
    const [first, second] = await Promise.all([
      listWidgets({ limit: "10", offset: "0" }),
      listWidgets({ limit: "10", offset: "10" }),
    ]);

    const firstNames = tableRowNames(first.stdout);
    const secondNames = tableRowNames(second.stdout);

    expect(secondNames).toHaveLength(10);
    expect(secondNames).not.toEqual(firstNames);
    expect(firstNames.filter((name) => secondNames.includes(name))).toEqual([]);
    expect(second.pagination?.offset).toBe(10);
  });

  it("falls back to the default page size when limit is absent or blank", async () => {
    const response = await listWidgets({ offset: "0" });

    expect(response.pagination?.limit).toBe(DEFAULT_PAGE_LIMIT);
    expect(tableRowNames(response.stdout)).toHaveLength(DEFAULT_PAGE_LIMIT);
  });

  it("clamps a negative offset rather than returning an empty page", async () => {
    const response = await listWidgets({ limit: "5", offset: "-40" });

    expect(response.pagination?.offset).toBe(0);
    expect(tableRowNames(response.stdout)).toHaveLength(5);
  });

  it("returns a short final page at the end of the row set", async () => {
    const total = WIDGETS_FIXTURE.listRows.length;
    const response = await listWidgets({ limit: "25", offset: String(total - 4) });

    expect(tableRowNames(response.stdout)).toHaveLength(4);
    expect(response.pagination?.total).toBe(total);
  });
});
