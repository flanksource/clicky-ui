import { describe, expect, it } from "vitest";
import { buildSidebarState, parseSidebarState, type SidebarState } from "./sidebar-state";

describe("sidebar state URL round trip", () => {
  it("builds then parses every non-default field", () => {
    window.history.replaceState(null, "", "/pages/button?keep=1#anchor");
    const state: SidebarState = { sort: "commented", filters: ["open", "resolved"], query: "btn", age: "all" };
    const url = buildSidebarState(state);
    expect(url).toBe("/pages/button?keep=1&sidebar.sort=commented&sidebar.filters=open%2Cresolved&sidebar.age=all&sidebar.q=btn#anchor");
    expect(parseSidebarState("/pages/button", url.slice(url.indexOf("?"), url.indexOf("#")))).toEqual(state);
  });

  it("omits defaults and preserves unrelated params", () => {
    window.history.replaceState(null, "", "/?keep=1&sidebar.sort=updated&sidebar.age=all");
    expect(buildSidebarState({ sort: "none", filters: [], query: "", age: "recent" })).toBe("/?keep=1");
  });

  it("parses an empty search to the default state", () => {
    expect(parseSidebarState("/", "")).toEqual({ sort: "none", filters: [], query: "", age: "recent" });
  });

  it.each([
    ["?sidebar.age=yesterday", "Invalid sidebar age: yesterday"],
    ["?sidebar.sort=newest", "Invalid sidebar sort: newest"],
    ["?sidebar.filters=open,bogus", "Invalid sidebar filter: bogus"],
    ["?sidebar.filters=recent", "Invalid sidebar filter: recent"],
  ])("rejects %s naming the offending value", (search, message) => {
    expect(() => parseSidebarState("/", search)).toThrow(message);
  });
});
