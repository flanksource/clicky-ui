import { expect, it } from "vitest";
import { reviewSourcePosition } from "./review-source";

it("marks normal page elements and editable SVG call sites using their original positions", () => {
  expect(reviewSourcePosition("report.tsx:12:8")).toEqual({ file: "report.tsx", line: 12, column: 8 });
  expect(reviewSourcePosition("report.tsx:12:8#2@012345abcdef")).toMatchObject({ file: "report.tsx", line: 12, column: 8 });
  expect(() => reviewSourcePosition("report.tsx:0:8")).toThrow("position");
});
