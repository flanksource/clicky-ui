import { beforeEach, describe, expect, it } from "vitest";
import {
  readOperationFiltersFromUrl,
  writeOperationFiltersToUrl,
} from "./operationCatalogUrl";

// operationCatalogUrl is OperationCatalog's URL codec. The unprefixed mode is
// today's default behaviour (every list param lives unnamespaced in the
// query string); the prefixed mode is what urlState={{prefix}} uses so a
// catalog embedded inside a host route (its own ?step=&tab=) does not
// collide with the host's own params.
describe("operationCatalogUrl", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });

  describe("readOperationFiltersFromUrl (unprefixed)", () => {
    it("reads every non-reserved, non-empty query param", () => {
      window.history.replaceState(null, "", "/?q=foo&limit=&__entity=e1");

      expect(readOperationFiltersFromUrl()).toEqual({ q: "foo" });
    });
  });

  describe("readOperationFiltersFromUrl (prefixed)", () => {
    it("reads only keys under the prefix, with the prefix stripped", () => {
      window.history.replaceState(
        null,
        "",
        "/?step=abc&tr.q=foo&tr.limit=10&other=ignored",
      );

      expect(readOperationFiltersFromUrl("tr")).toEqual({
        q: "foo",
        limit: "10",
      });
    });

    it("returns nothing when no key carries the prefix", () => {
      window.history.replaceState(null, "", "/?q=foo");

      expect(readOperationFiltersFromUrl("tr")).toEqual({});
    });
  });

  describe("writeOperationFiltersToUrl (unprefixed)", () => {
    it("writes known params and preserves reserved ones", () => {
      window.history.replaceState(null, "", "/widgets?__entity=e1");

      writeOperationFiltersToUrl({ q: "foobar", offset: "0" }, [
        "q",
        "offset",
      ]);

      const params = new URLSearchParams(window.location.search);
      expect(params.get("q")).toBe("foobar");
      expect(params.get("offset")).toBe("0");
      expect(params.get("__entity")).toBe("e1");
    });

    it("drops a param that is not in the known parameter list", () => {
      writeOperationFiltersToUrl({ q: "foo", bogus: "x" }, ["q"]);

      const params = new URLSearchParams(window.location.search);
      expect(params.get("q")).toBe("foo");
      expect(params.has("bogus")).toBe(false);
    });
  });

  describe("writeOperationFiltersToUrl (prefixed)", () => {
    it("namespaces written keys under the prefix and leaves the host's own params alone", () => {
      window.history.replaceState(null, "", "/drawer?step=42&tab=trace");

      writeOperationFiltersToUrl({ q: "foo", limit: "10" }, ["q", "limit"], "tr");

      const params = new URLSearchParams(window.location.search);
      expect(params.get("tr.q")).toBe("foo");
      expect(params.get("tr.limit")).toBe("10");
      // The host's own, differently-shaped params are untouched.
      expect(params.get("step")).toBe("42");
      expect(params.get("tab")).toBe("trace");
    });

    it("clears a previously-written prefixed key that is no longer set", () => {
      window.history.replaceState(null, "", "/drawer?tr.q=stale");

      writeOperationFiltersToUrl({}, ["q"], "tr");

      expect(new URLSearchParams(window.location.search).has("tr.q")).toBe(
        false,
      );
    });

    it("never writes an unprefixed key for the same param name", () => {
      writeOperationFiltersToUrl({ q: "foo" }, ["q"], "tr");

      expect(new URLSearchParams(window.location.search).has("q")).toBe(
        false,
      );
    });
  });
});
