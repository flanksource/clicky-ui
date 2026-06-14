import { describe, expect, it } from "vitest";
import type { Test } from "./types";
import { annotateRoutePaths, findNodeByRoutePath, slugify } from "./routePath";

const t = (name: string, children?: Test[]): Test => ({ name, children });

describe("slugify", () => {
  it("lowercases and collapses non-alphanumerics to single dashes", () => {
    expect(slugify("Create Policy (02)")).toBe("create-policy-02");
  });

  it("falls back to 'node' for an empty/symbol-only name", () => {
    expect(slugify("")).toBe("node");
    expect(slugify("***")).toBe("node");
  });
});

describe("annotateRoutePaths", () => {
  it("assigns a slug path per node and nests child paths under the parent", () => {
    const [root] = annotateRoutePaths([t("Test Plan", [t("setup"), t("Create Policy")])]);
    expect(root.route_path).toBe("test-plan");
    expect(root.children?.[0].route_path).toBe("test-plan/setup");
    expect(root.children?.[1].route_path).toBe("test-plan/create-policy");
  });

  it("disambiguates same-named siblings with a ~N ordinal", () => {
    const [root] = annotateRoutePaths([t("plan", [t("step"), t("step")])]);
    expect(root.children?.map((c) => c.route_path)).toEqual(["plan/step~1", "plan/step~2"]);
  });

  it("does not mutate the input forest", () => {
    const input = [t("plan", [t("step")])];
    annotateRoutePaths(input);
    expect(input[0].route_path).toBeUndefined();
    expect(input[0].children?.[0].route_path).toBeUndefined();
  });
});

describe("findNodeByRoutePath", () => {
  const annotated = annotateRoutePaths([t("plan", [t("setup"), t("Create Policy")])]);

  it("returns the node whose route_path matches the target", () => {
    expect(findNodeByRoutePath(annotated, "plan/create-policy")?.name).toBe("Create Policy");
  });

  it("returns null for an empty target or a path that no node owns", () => {
    expect(findNodeByRoutePath(annotated, "")).toBeNull();
    expect(findNodeByRoutePath(annotated, "plan/missing")).toBeNull();
  });
});
