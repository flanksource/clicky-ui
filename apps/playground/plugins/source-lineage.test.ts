import { expect, it } from "vitest";
import { recordSourceEdit, resolveOrdinal, type VisualEditLineage } from "./source-lineage";
import { sourceHash } from "./source-hash";

it("remaps a surviving SVG after deletion and refuses the removed call site", () => {
  const before = 'export default () => <svg><rect id="removed"/><circle id="kept"/></svg>';
  const after = before.replace('<rect id="removed"/>', "");
  const lineage: VisualEditLineage = new Map();
  recordSourceEdit({ lineage, file: "drawing.tsx", before, after, deleted: { ordinal: 0, count: 1 } });
  const request = { lineage, file: "drawing.tsx", from: sourceHash(before), to: sourceHash(after) };
  expect([resolveOrdinal({ ...request, ordinal: 0 }), resolveOrdinal({ ...request, ordinal: 1 })]).toEqual([null, 0]);
});
