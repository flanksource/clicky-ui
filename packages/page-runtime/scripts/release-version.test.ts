import { describe, expect, test } from "vitest";
import { nextReleaseVersion, readPublishedVersions } from "./release-version.ts";

describe("registry release versions", () => {
test.each([
  { current: "0.1.0", published: [], expected: "0.1.0" },
  { current: "0.1.0", published: ["0.0.0"], expected: "0.1.0" },
  { current: "0.1.0", published: ["0.1.9", "0.1.10", "0.1.2"], expected: "0.1.11" },
  { current: "0.1.3", published: ["0.1.2", "0.2.0-beta.1"], expected: "0.1.3" },
])("selects $expected from registry history $published", ({ current, published, expected }) => {
  expect(nextReleaseVersion({ current, published })).toBe(expected);
});
});

test.each(["invalid", "0.1", "0.1.0-beta.1"])("rejects an invalid stable release version %s", current => {
  expect(() => nextReleaseVersion({ current, published: [] })).toThrow(/version/i);
});

test("allows first publication only after an explicit registry 404", () => {
  expect(readPublishedVersions({ status: 1, stdout: JSON.stringify({ error: { code: "E404" } }), stderr: "Not found" })).toEqual([]);
  for (const code of ["E401", "ENETWORK", "E500"]) {
    expect(() => readPublishedVersions({ status: 1, stdout: JSON.stringify({ error: { code } }), stderr: code })).toThrow(code);
  }
});

test.each([{ stdout: '"0.1.0"', expected: ["0.1.0"] }, { stdout: '["0.1.0","0.1.1"]', expected: ["0.1.0", "0.1.1"] }])("reads the registry version response $stdout", ({ stdout, expected }) => {
  expect(readPublishedVersions({ status: 0, stdout, stderr: "" })).toEqual(expected);
});

test("rejects malformed registry responses", () => {
  for (const stdout of ['{"error":{}}', '[1]', "invalid"]) expect(() => readPublishedVersions({ status: 0, stdout, stderr: "" })).toThrow();
});
