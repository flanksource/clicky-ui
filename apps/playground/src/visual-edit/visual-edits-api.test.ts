import { afterEach, expect, it, vi } from "vitest";
import type { VisualEditRequest } from "../../plugins/visual-edits-contract";
import { postVisualEdit } from "./visual-edits-api";

const request: VisualEditRequest = {
  page: "flanksource/facet-diagrams",
  source: "flanksource/_facet-diagrams/cells.tsx:12:7#0@aaaaaaaaaaaa",
  edit: { kind: "style", prop: "variant", value: "card" },
};

const reply = (status: number, contentType: string, body: unknown) =>
  vi.fn().mockResolvedValue({
    status,
    headers: { get: () => contentType },
    json: async () => body,
  });

afterEach(() => vi.unstubAllGlobals());

it("returns the typed response when the HTTP status matches", async () => {
  const stale = { status: "stale", error: "file changed", file: "cells.tsx" };
  vi.stubGlobal("fetch", reply(409, "application/json", stale));
  expect(await postVisualEdit(request)).toEqual(stale);
});

it("explains that a live playground server is required for non-JSON responses", async () => {
  vi.stubGlobal("fetch", reply(200, "text/html", null));
  await expect(postVisualEdit(request)).rejects.toThrow(/require a live playground server/);
});

it("throws with the payload when the HTTP status contradicts the response status", async () => {
  vi.stubGlobal("fetch", reply(500, "application/json", { error: "boom" }));
  await expect(postVisualEdit(request)).rejects.toThrow(/returned HTTP 500 with status undefined: \{"error":"boom"\}/);
});
