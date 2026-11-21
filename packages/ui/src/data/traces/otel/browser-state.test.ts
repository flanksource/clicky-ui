import { describe, expect, it } from "vitest";
import { browserHref, mergePinned, readBrowserLocation, withoutPinned } from "./browser-state";

const pinned = { attributes: { "oipa.plan.guid=P1": "include" as const }, source: "lab" };

describe("readBrowserLocation", () => {
  it("reads the search values, trace and span, and leaves a host's own keys out of the values", () => {
    const location = readBrowserLocation(`?env=lab&tab=traces&lookback=6h&limit=25&attributes=${encodeURIComponent('{"a=b":"exclude"}')}&trace=abc&span=s1`);
    expect(location).toEqual({ values: { lookback: "6h", limit: 25, attributes: { "a=b": "exclude" } }, trace: "abc", span: "s1" });
  });

  it("reads an empty query as no values, trace or span", () => {
    expect(readBrowserLocation("")).toEqual({ values: {} });
  });

  it("refuses a malformed search value rather than dropping it", () => {
    expect(() => readBrowserLocation("?limit=many")).toThrow(/limit must be a whole number/);
  });
});

describe("mergePinned", () => {
  it("adds the pinned modes beside the user's and lets the pinned mode win", () => {
    const merged = mergePinned({ attributes: { "oipa.plan.guid=P1": "exclude", "x=y": "include" }, lookback: "1h" }, pinned);
    expect(merged).toEqual({ attributes: { "x=y": "include", "oipa.plan.guid=P1": "include" }, lookback: "1h", source: "lab" });
  });

  it("restores a pinned filter the user cleared and overrides a pinned scalar", () => {
    expect(mergePinned({ attributes: {}, source: "records" }, pinned)).toEqual({ attributes: pinned.attributes, source: "lab" });
  });
});

describe("withoutPinned", () => {
  it("drops the pinned entries and keeps the user's", () => {
    expect(withoutPinned({ attributes: { "oipa.plan.guid=P1": "include", "x=y": "include" }, source: "lab", limit: 5 }, pinned)).toEqual({ attributes: { "x=y": "include" }, limit: 5 });
  });

  it("drops a mode filter whose every entry is pinned", () => {
    expect(withoutPinned({ attributes: pinned.attributes }, pinned)).toEqual({});
  });

  it("keeps a service named after an inherited property when only another service is pinned", () => {
    expect(withoutPinned({ services: { constructor: "include", api: "include" } }, { services: { api: "include" } }))
      .toEqual({ services: { constructor: "include" } });
  });
});

describe("browserHref", () => {
  it("keeps the path and a host's own query keys, replacing only the otel keys", () => {
    const href = browserHref({ pathname: "/plan/p1/telemetry", search: "?env=lab&limit=10&trace=old&span=old", values: { lookback: "1h" }, pinned: {} });
    expect(href).toBe("/plan/p1/telemetry?env=lab&lookback=1h");
  });

  it("adds the trace and span and leaves the pinned values out of the URL", () => {
    const href = browserHref({ pathname: "/t", search: "?env=lab", values: mergePinned({ lookback: "1h" }, pinned), pinned, trace: "abc", span: "s1" });
    expect(href).toBe("/t?env=lab&lookback=1h&trace=abc&span=s1");
  });

  it("is the bare path when there is nothing to carry", () => {
    expect(browserHref({ pathname: "/t", search: "", values: {}, pinned: {} })).toBe("/t");
  });

  it("round-trips a cleared scalar default without serializing the pinned source", () => {
    const defaults = { minSpans: 2, source: "records" };
    const href = browserHref({ pathname: "/t", search: "", values: { minSpans: undefined }, defaults, pinned });
    const { values } = readBrowserLocation(new URL(href, "http://localhost").search);
    expect(href).toBe("/t?minSpans=");
    expect({ ...defaults, ...values }).toEqual({ minSpans: undefined, source: "records" });
  });
});
