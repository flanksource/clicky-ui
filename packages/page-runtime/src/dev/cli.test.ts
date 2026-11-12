import { describe, expect, it } from "vitest";
import { parsePackageArguments } from "./cli.ts";

describe("serve-packages arguments", () => {
  it("accepts repeated package directories and explicit upstreams and port", () => {
    expect(parsePackageArguments(["--package", "packages/ui", "--package", "../facet", "--upstream-registry", "https://registry.example.com", "--upstream-origin", "https://files.example.com", "--port", "0"])).toEqual({ packages: ["packages/ui", "../facet"], upstreamRegistry: "https://registry.example.com", upstreamOrigin: "https://files.example.com", port: 0, stateDir: ".tmp/package-origin" });
  });

  it.each([[], ["--package"], ["--package", "--port"], ["--unknown", "x"], ["--package", ".", "--port", "abc"], ["--package", ".", "--port", "65536"], ["--package", ".", "--port", "1", "--port", "2"]].map((args) => ({ args })))("rejects invalid arguments $args", ({ args }) => {
    expect(() => parsePackageArguments(args)).toThrow();
  });
});
