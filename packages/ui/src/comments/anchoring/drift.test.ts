import { describe, expect, it } from "vitest";
import { driftNote, elementDrift, patchDrift, webTextDrift } from "./drift";

const element = document.createElement("p");
const range = document.createRange();

describe("drift states", () => {
  it("maps a patch match: matched is not drift, ambiguous and outdated are", () => {
    expect([
      patchDrift({ state: "matched", startLine: 1, endLine: 2 }),
      patchDrift({ state: "ambiguous" }),
      patchDrift({ state: "outdated" }),
    ]).toEqual([null, "ambiguous", "outdated"]);
  });

  it("maps an element match: found by agreeing locators is not drift, found by a minority is moved, not found is orphaned", () => {
    expect([
      elementDrift({ element, matchedBy: "anchor", conflict: false }),
      elementDrift({ element, matchedBy: "anchor", conflict: true }),
      elementDrift(null),
    ]).toEqual([null, "moved", "orphaned"]);
  });

  it("maps a web text match onto the same states", () => {
    expect([
      webTextDrift({ state: "matched", element, range }),
      webTextDrift({ state: "moved", element, range }),
      webTextDrift({ state: "ambiguous", element }),
      webTextDrift({ state: "orphaned" }),
    ]).toEqual([null, "moved", "ambiguous", "orphaned"]);
  });

  it("explains each state in terms of what the thread was written on", () => {
    expect([driftNote("orphaned", "element"), driftNote("moved", "text"), driftNote("outdated", "lines")]).toEqual([
      "The element this was written on is no longer in the document.",
      "Its element was found somewhere other than where it was written; check it before relying on it.",
      "The lines this was written on have changed or been removed.",
    ]);
  });

  it("refuses a state that cannot happen to that kind of anchor", () => {
    expect(() => driftNote("outdated", "element")).toThrow(/outdated/);
  });
});
