import { describe, expect, it } from "vitest";

import { matchSourceRoute } from "./sources-server";

describe("matchSourceRoute", () => {
  it.each([
    ["GET", "/", false, "folders"],
    ["GET", "/", true, "read"],
    ["POST", "/", false, "create-page"],
    ["PUT", "/", true, "write"],
    ["PATCH", "/", false, "move"],
    ["DELETE", "/", true, "delete"],
    ["POST", "/folders", false, "create-folder"],
  ])("maps %s %s with slug=%s to %s", (method, path, hasSlug, route) => {
    expect(matchSourceRoute(method, path, hasSlug)).toBe(route);
  });

  it.each([
    ["PUT", "/", false],
    ["DELETE", "/", false],
    ["GET", "/folders", false],
    ["POST", "/unknown", false],
  ])("rejects unsupported %s %s with slug=%s", (method, path, hasSlug) => {
    expect(matchSourceRoute(method, path, hasSlug)).toBeUndefined();
  });
});
