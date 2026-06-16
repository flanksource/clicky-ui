import { describe, expect, it } from "vitest";
import { pathParamNames } from "./command-form-utils";

describe("pathParamNames", () => {
  it.each([
    ["/api/v1/widgets", []],
    ["/api/v1/widgets/{id}", ["id"]],
    ["/orgs/{org}/repos/{repo}", ["org", "repo"]],
    ["/a/{id}", ["id"]],
  ])("extracts path params from %j", (path, expected) => {
    expect(pathParamNames(path)).toEqual(expected);
  });

  it("runs in linear time on long brace runs (no ReDoS)", () => {
    const hostile = "{".repeat(100_000);
    const start = performance.now();
    expect(pathParamNames(hostile)).toEqual([]);
    expect(performance.now() - start).toBeLessThan(1_000);
  });
});
