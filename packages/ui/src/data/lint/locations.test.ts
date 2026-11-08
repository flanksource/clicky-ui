import { describe, expect, it } from "vitest";
import {
  imageCrop,
  locationLabel,
  showsLocationList,
  urlSelector,
  violationLocationLabel,
  violationTargetGroup,
} from "./locations";
import type { ViolationLocation } from "./types";

const PAGE = "https://oipa.example.com/entity/policy/p1";

describe("urlSelector", () => {
  it.each([
    [{ css: ".row[data-id=x]" }, "css: .row[data-id=x]"],
    [{ xpath: "//tr[@data-id='x']" }, "xpath: //tr[@data-id='x']"],
    [{ testId: "activity-status" }, "testId: activity-status"],
    [{ role: "button" }, "role: button"],
    [{ role: "button", name: "Process" }, 'role: button[name="Process"]'],
    [{ text: "02 Pending" }, "text: 02 Pending"],
    [{}, undefined],
  ])("formats %o as %s", (selector, expected) => {
    expect(urlSelector({ url: PAGE, ...selector })).toBe(expected);
  });

  it("refuses two selector strategies, naming both", () => {
    expect(() => urlSelector({ url: PAGE, css: ".row", xpath: "//tr" })).toThrow(/css, xpath/);
  });

  it("refuses an accessible name without a role", () => {
    expect(() => urlSelector({ url: PAGE, name: "Process" })).toThrow(/name.*role/);
  });
});

describe("locationLabel", () => {
  it.each<[string, ViolationLocation, string]>([
    ["a file at a ref, relative to the work dir", { ref: "main", file: "/repo/rules/a/data.xml", line: 12, column: 3 }, "main:a/data.xml:12:3"],
    ["a file without a ref or column", { file: "/repo/rules/a/data.xml", line: 12 }, "a/data.xml:12"],
    ["an entity with a name", { entity: { kind: "Policy", id: "p1", name: "P-1001" } }, "Policy · P-1001"],
    ["an entity without a name", { entity: { kind: "AsTransaction", id: "t1" } }, "AsTransaction · t1"],
    ["a url", { url: { url: PAGE, css: ".row" } }, PAGE],
    ["an image region", { image: { src: "shot.png", x: 4, y: 80, width: 480, height: 40 } }, "shot.png 4,80 480×40"],
    ["a message alone", { message: "somewhere" }, "somewhere"],
  ])("labels %s", (_, location, expected) => {
    expect(locationLabel(location, "/repo/rules")).toBe(expected);
  });
});

describe("violationTargetGroup", () => {
  it.each<[string, ViolationLocation[] | undefined, ReturnType<typeof violationTargetGroup>]>([
    ["the first location's entity kind", [{ entity: { kind: "Policy", id: "p1" } }, { url: { url: PAGE } }], { kind: "entity", name: "Policy" }],
    ["the first location's url host", [{ url: { url: "https://oipa.example.com:8443/x" } }], { kind: "url", name: "oipa.example.com:8443" }],
    ["Other for an image region", [{ image: { src: "shot.png", x: 0, y: 0, width: 1, height: 1 } }], { kind: "other", name: "Other" }],
    ["Other with no locations", undefined, { kind: "other", name: "Other" }],
  ])("is %s", (_, locations, expected) => {
    expect(violationTargetGroup(locations ? { locations } : {})).toEqual(expected);
  });

  it("fails loudly on a url that is not absolute", () => {
    expect(() => violationTargetGroup({ locations: [{ url: { url: "/entity/policy/p1" } }] })).toThrow(
      '"/entity/policy/p1"',
    );
  });
});

describe("violationLocationLabel", () => {
  it("names the file and position when the violation has a file", () => {
    expect(violationLocationLabel({ file: "a.go", line: 4, column: 2 }, true)).toBe("a.go:4:2");
    expect(violationLocationLabel({ file: "a.go", line: 4 }, false)).toBe(":4");
  });

  it("names the primary location of a file-less violation", () => {
    const v = { locations: [{ entity: { kind: "Policy", id: "p1", name: "P-1001" } }, { url: { url: PAGE } }] };
    expect(violationLocationLabel(v, true)).toBe("Policy · P-1001");
  });

  it("is empty for a file-less violation with no locations or line", () => {
    expect(violationLocationLabel({}, true)).toBe("");
  });
});

describe("showsLocationList", () => {
  it.each<[string, ViolationLocation[] | undefined, boolean]>([
    ["no locations", undefined, false],
    ["one plain file location", [{ file: "a.go", line: 1 }], false],
    ["one file location at a ref", [{ file: "a.go", line: 1, ref: "main" }], true],
    ["one entity location", [{ entity: { kind: "Policy", id: "p1" } }], true],
    ["two file locations", [{ file: "a.go" }, { file: "b.go" }], true],
  ])("is %s → %s", (_, locations, expected) => {
    expect(showsLocationList(locations ? { locations } : {})).toBe(expected);
  });
});

describe("imageCrop", () => {
  it("shows the region at its own size when it fits", () => {
    expect(imageCrop({ src: "s.png", x: 10, y: 80, width: 120, height: 40 }, { width: 240, height: 96 })).toEqual({
      scale: 1,
      frame: { width: 120, height: 40 },
      image: {
        width: 120,
        height: 40,
        objectFit: "none",
        objectPosition: "-10px -80px",
        transform: "scale(1)",
        transformOrigin: "top left",
      },
    });
  });

  it("scales a wide region down to the frame's width", () => {
    const crop = imageCrop({ src: "s.png", x: 0, y: 80, width: 480, height: 40 }, { width: 240, height: 96 });
    expect(crop.scale).toBe(0.5);
    expect(crop.frame).toEqual({ width: 240, height: 20 });
    expect(crop.image.transform).toBe("scale(0.5)");
  });

  it.each([
    [{ width: 0, height: 10 }],
    [{ width: 10, height: -1 }],
  ])("refuses an empty region %o", (size) => {
    expect(() => imageCrop({ src: "s.png", x: 0, y: 0, ...size }, { width: 240, height: 96 })).toThrow(/s\.png/);
  });
});
