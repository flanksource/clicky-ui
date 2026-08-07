import { describe, expect, it, vi } from "vitest";
import { parametersToFormConfig, type LookupSearch } from "./formMetadata";
import type { OperationLookupFilter } from "./types";

const serviceParam = { name: "service", in: "query" as const };

function multiFilterConfig(
  filter: OperationLookupFilter,
  lookupSearch?: LookupSearch | undefined,
) {
  const config = parametersToFormConfig(
    [serviceParam],
    { service: "" },
    () => {},
    { lookup: { filters: { service: filter } }, lookupSearch },
  );
  const emitted = config.filters[0];
  if (emitted?.kind !== "multi") throw new Error(`expected a multi filter, got ${emitted?.kind}`);
  return emitted;
}

const head: OperationLookupFilter = {
  label: "Service",
  type: "multi-filter",
  multi: true,
  options: { api: { kind: "text", text: "api" }, web: { kind: "text", text: "web" } },
};

describe("truncated filters", () => {
  // The whole point of the head/search split: without these three props the
  // control renders a capped list as if it were the complete one.
  it("passes the truncation through so the control can offer a search", () => {
    const search = vi.fn(async () => []);
    const filter = multiFilterConfig({ ...head, truncated: true, total: 412 }, search);

    expect(filter.truncated).toBe(true);
    expect(filter.total).toBe(412);
    expect(filter.onSearch).toBeTypeOf("function");
  });

  it("searches the server by the filter's own key", async () => {
    const search = vi.fn(async () => [{ value: "payments", label: "payments" }]);
    const filter = multiFilterConfig({ ...head, truncated: true, total: 412 }, search);

    await filter.onSearch?.("pay");

    expect(search).toHaveBeenCalledWith("service", "pay");
  });

  // A set that arrived whole is searched in the browser: a round trip could only
  // return what is already here.
  it("leaves a complete option set to filter client-side", () => {
    const search = vi.fn(async () => []);
    const filter = multiFilterConfig(head, search);

    expect(filter.truncated).toBeUndefined();
    expect(filter.total).toBeUndefined();
    expect(filter.onSearch).toBeUndefined();
  });

  // Truncation is a fact about the data; the searcher is a capability of the
  // client. Reporting the first without the second is what lets a consumer with
  // no lookup endpoint still say the list is partial.
  it("still reports truncation when nothing can search it", () => {
    const filter = multiFilterConfig({ ...head, truncated: true, total: 412 }, undefined);

    expect(filter.truncated).toBe(true);
    expect(filter.total).toBe(412);
    expect(filter.onSearch).toBeUndefined();
  });
});
