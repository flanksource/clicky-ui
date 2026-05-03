import { describe, expect, it } from "vitest";
import { normalizeTags, splitTagToken, tagFilterTokens } from "./TagList";

describe("normalizeTags", () => {
  it("parses key=value strings", () => {
    expect(normalizeTags(["region=us-east", "tier=edge"])).toEqual([
      { key: "region", value: "us-east", display: "region=us-east", token: "region=us-east" },
      { key: "tier", value: "edge", display: "tier=edge", token: "tier=edge" },
    ]);
  });

  it("parses key:value strings", () => {
    expect(normalizeTags(["region:us-east"])).toEqual([
      { key: "region", value: "us-east", display: "region=us-east", token: "region=us-east" },
    ]);
  });

  it("preserves bare values without a separator", () => {
    expect(normalizeTags(["edge"])).toEqual([{ value: "edge", display: "edge", token: "edge" }]);
  });

  it("normalizes object form", () => {
    expect(normalizeTags([{ key: "env", value: "prod" }])).toEqual([
      { key: "env", value: "prod", display: "env=prod", token: "env=prod" },
    ]);
  });

  it("normalizes Record form", () => {
    expect(normalizeTags({ env: "prod", tier: "edge" })).toEqual([
      { key: "env", value: "prod", display: "env=prod", token: "env=prod" },
      { key: "tier", value: "edge", display: "tier=edge", token: "tier=edge" },
    ]);
  });

  it("drops empty values from records", () => {
    expect(normalizeTags({ env: "prod", missing: null, blank: "" })).toEqual([
      { key: "env", value: "prod", display: "env=prod", token: "env=prod" },
    ]);
  });

  it("honours a custom separator", () => {
    const tags = normalizeTags(["region=us-east"], "/");
    expect(tags[0]?.display).toBe("region/us-east");
    expect(tags[0]?.token).toBe("region/us-east");
  });
});

describe("tagFilterTokens", () => {
  it("emits one token per tag", () => {
    expect(tagFilterTokens(["region=us-east", "tier=edge"])).toEqual([
      "region=us-east",
      "tier=edge",
    ]);
  });

  it("returns an empty list for null/undefined", () => {
    expect(tagFilterTokens(null)).toEqual([]);
    expect(tagFilterTokens(undefined)).toEqual([]);
  });
});

describe("splitTagToken", () => {
  it("splits on the configured separator", () => {
    expect(splitTagToken("env=prod")).toEqual({ key: "env", value: "prod" });
    expect(splitTagToken("region=us-east")).toEqual({ key: "region", value: "us-east" });
  });

  it("preserves separators inside the value", () => {
    expect(splitTagToken("path=/var/log=foo")).toEqual({ key: "path", value: "/var/log=foo" });
  });

  it("returns an empty key when no separator is present", () => {
    expect(splitTagToken("edge")).toEqual({ key: "", value: "edge" });
  });

  it("supports a custom separator", () => {
    expect(splitTagToken("env|prod", "|")).toEqual({ key: "env", value: "prod" });
  });
});
