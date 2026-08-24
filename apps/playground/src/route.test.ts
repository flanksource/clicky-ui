import { describe, expect, it } from "vitest";

import { buildPlaygroundRoute, parsePlaygroundRoute } from "./route";

describe("playground route", () => {
  it("omits preview and visible annotation defaults", () => {
    expect(
      buildPlaygroundRoute({ page: "forms/input", view: "preview", annotations: "visible" }),
    ).toBe("?page=forms%2Finput");
  });

  it("round-trips markdown and hidden annotation state", () => {
    const route = parsePlaygroundRoute(
      "?page=forms%2Finput&view=markdown&annotations=hidden",
      "welcome",
    );
    expect(route).toEqual({ page: "forms/input", view: "markdown", annotations: "hidden" });
    expect(buildPlaygroundRoute(route)).toBe(
      "?page=forms%2Finput&view=markdown&annotations=hidden",
    );
  });

  it.each(["?page=welcome&view=source", "?page=welcome&annotations=off"])(
    "rejects invalid route state in %s",
    (search) => expect(() => parsePlaygroundRoute(search, "welcome")).toThrow(/invalid playground/),
  );
});
