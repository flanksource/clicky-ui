import { expect, it } from "vitest";
import { styleEditBody } from "./style-edit-comment";

const refusal = { reason: "computed", file: "flanksource/_diagrams/call-path.tsx", line: 42, column: 9, message: "fill is computed in code" };

it("names every attribute change, the element and why it was refused", () => {
  expect(
    styleEditBody({
      marker: "flanksource/_diagrams/call-path.tsx:42:9#3@aaaaaaaaaaaa",
      tag: "rect",
      changes: [
        { attribute: "fill", from: "#ffffff", to: "#eeeeff" },
        { attribute: "strokeWidth", from: null, to: 2 },
      ],
      refusal,
    }),
  ).toBe(
    "Change `fill` from `#ffffff` to `#eeeeff`, `strokeWidth` (not set) to `2` of `<rect>`. It cannot be edited in place: fill is computed in code (flanksource/_diagrams/call-path.tsx:42).",
  );
});
