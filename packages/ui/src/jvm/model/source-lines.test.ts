import { describe, expect, it } from "vitest";
import { gutterLabel, hasLineMap, lineForRow, mappedRow, rowForLine } from "./source-lines";

// Decompiled rows 0..9. Row 4 and 5 are one statement CFR spread over two rows
// (both mapped to bytecode line 20); rows the decompiler could not map are 0.
const MAPPED = [0, 0, 0, 0, 20, 20, 0, 24, 0, 31];
const UNMAPPED = [0, 0, 0, 0, 0];

describe("hasLineMap", () => {
  it.each([
    [MAPPED, true],
    [UNMAPPED, false],
    [[], false],
  ])("%j -> %s", (numbers, expected) => {
    expect(hasLineMap(numbers)).toBe(expected);
  });
});

describe("mappedRow", () => {
  it.each([
    ["a row mapped to exactly the line", 24, { row: 7, line: 24 }],
    ["the first of several rows mapped to the same line", 20, { row: 4, line: 20 }],
    ["the nearest mapped line above when the line is unmapped", 28, { row: 7, line: 24 }],
    ["the last mapped line for a line past the end", 500, { row: 9, line: 31 }],
    ["nothing for a line before the first mapped line", 3, null],
    ["nothing for line zero", 0, null],
    ["nothing for a negative line", -4, null],
  ])("%s", (_name, line, expected) => {
    expect(mappedRow(MAPPED, line)).toEqual(expected);
  });
});

describe("rowForLine", () => {
  it.each([
    ["maps a bytecode line to its decompiled row", MAPPED, 31, 9],
    ["lands on the statement holding an unmapped line", MAPPED, 22, 4],
    ["treats the line as the row number when nothing is mapped", UNMAPPED, 3, 2],
    ["is -1 for line zero", MAPPED, 0, -1],
    ["is -1 for a line above every mapped line", MAPPED, 2, -1],
  ])("%s", (_name, numbers, line, expected) => {
    expect(rowForLine(numbers, line)).toBe(expected);
  });
});

describe("lineForRow", () => {
  it.each([
    ["the bytecode line of a mapped row", MAPPED, 7, 24],
    ["0 for a row the mapping skips", MAPPED, 6, 0],
    ["0 for a row beyond the mapping", MAPPED, 40, 0],
    ["0 for a negative row", MAPPED, -1, 0],
    ["the 1-based row number when nothing is mapped", UNMAPPED, 3, 4],
  ])("%s", (_name, numbers, row, expected) => {
    expect(lineForRow(numbers, row)).toBe(expected);
  });
});

describe("gutterLabel", () => {
  it("labels mapped rows with their bytecode line and leaves skipped rows blank", () => {
    expect(MAPPED.map((_, row) => gutterLabel(MAPPED, row))).toEqual(["", "", "", "", "20", "20", "", "24", "", "31"]);
  });

  it("labels rows with their 1-based number when the decompiler mapped nothing", () => {
    expect(UNMAPPED.map((_, row) => gutterLabel(UNMAPPED, row))).toEqual(["1", "2", "3", "4", "5"]);
  });
});
