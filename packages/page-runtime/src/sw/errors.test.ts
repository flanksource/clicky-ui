import { expect, it } from "vitest";
import { runtimeError } from "./errors.ts";

it("reports a render error's source coordinates from its module stack", () => {
  const error = new Error("render failure");
  error.stack = "Error: render failure\n at Page (https://pages.example.com/src/reports/q3.tsx?page=reports%2Fq3.tsx:12:8)";
  expect(runtimeError({ error, phase: "render", file: "reports/q3.tsx" })).toEqual({ phase: "render", file: "reports/q3.tsx", message: "render failure", line: 12, column: 8 });
});
