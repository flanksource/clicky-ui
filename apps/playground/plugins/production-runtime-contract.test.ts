import { createHash } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  validateFrameMessage,
  validateHostMessage,
} from "../../../packages/page-runtime/src/host/validation.ts";
import { insertSourceMarkers } from "../../../packages/page-runtime/src/sw/markers.ts";
import { parseEditableSource } from "./editable-source-marker";

describe("browser-only playground runtime contracts", () => {
  it("accepts Design mode through the validated page bridge", () => {
    const message = { type: "mode", mode: "design" };
    expect(validateHostMessage(message)).toEqual(message);
  });

  it("emits source markers the visual-edit writer can use without a Vite transform", () => {
    const file = "diagram.tsx";
    const source = 'export default () => <svg><rect width={80} /></svg>;';
    const compiled = insertSourceMarkers(source, file, true);
    const marker = [...compiled.code.matchAll(/data-source=("(?:[^"\\]|\\.)*")/g)]
      .map(match => JSON.parse(match[1]!) as string)
      .find(value => value.startsWith(`${file}:1:${source.indexOf("<rect") + 1}`));
    expect(marker).toBeDefined();
    expect(parseEditableSource(marker!)).toEqual({
      file,
      line: 1,
      column: source.indexOf("<rect") + 1,
      ordinal: 0,
      hash: createHash("sha256").update(source, "utf8").digest("hex").slice(0, 12),
    });
  });

  it("preserves an edit marker in a validated element selection", () => {
    const message = {
      type: "selection",
      selection: {
        anchor: "#node",
        label: "Diagram node",
        rect: { left: 0, top: 0, width: 80, height: 40 },
        element: {
          source: "diagram.tsx:1:27#0@012345abcdef",
          componentName: "rect",
          html: '<rect id="node" width="80" height="40"></rect>',
          locators: [],
        },
      },
    };
    expect(validateFrameMessage(message)).toEqual(message);
  });
});
