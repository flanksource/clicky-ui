import { renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { LookupDescriptor } from "../components/json-schema-form-types";
import { useOperationLookupFetcher } from "./operationLookupFetcher";
import type { OperationLookupFilter } from "./types";
import type { OperationsApiClient } from "./useOperations";

const DESCRIPTOR: LookupDescriptor = { url: "/api/v1/lookup/t0/db", filter: "query" };

async function fetchOptions(filter: OperationLookupFilter) {
  const client = { lookupFilterOptions: vi.fn(async () => filter) } as unknown as OperationsApiClient;
  const { result } = renderHook(() => useOperationLookupFetcher(client));
  return result.current!({ descriptor: DESCRIPTOR, query: "" });
}

describe("useOperationLookupFetcher option mapping", () => {
  it("carries icon, description, tone, group and badges from the lookup node onto the option", async () => {
    const options = await fetchOptions({
      options: {
        "connection://pg/main": {
          kind: "text",
          plain: "main",
          icon: "postgres",
          description: "db.internal:5432 · app",
          tone: "teal",
          group: "Postgres",
          badges: [{ label: "svc", icon: "ph:network-thin", tone: "teal" }, { label: "via OS" }],
        },
      },
    });

    expect(options).toEqual([
      {
        value: "connection://pg/main",
        label: "main",
        icon: "postgres",
        description: "db.internal:5432 · app",
        tone: "teal",
        group: "Postgres",
        badges: [{ label: "svc", icon: "ph:network-thin", tone: "teal" }, { label: "via OS" }],
      },
    ]);
  });

  it("leaves a plain node as just value and label", async () => {
    expect(await fetchOptions({ options: { users: { kind: "text", plain: "users" } } })).toEqual([
      { value: "users", label: "users" },
    ]);
  });

  it("maps the selected node's presentation too, for a value outside the head set", async () => {
    const options = await fetchOptions({
      options: {},
      selected: { "connection://pg/old": { kind: "text", plain: "old", icon: "postgres" } },
    });

    expect(options).toEqual([{ value: "connection://pg/old", label: "old", icon: "postgres" }]);
  });

  it("treats a tone it does not know as neutral rather than dropping the option", async () => {
    const options = await fetchOptions({ options: { a: { kind: "text", plain: "a", tone: "chartreuse" } } });

    expect(options).toEqual([{ value: "a", label: "a", tone: "neutral" }]);
  });

  it("rejects a badge without a label, naming the option", async () => {
    await expect(
      fetchOptions({ options: { a: { kind: "text", plain: "a", badges: [{ icon: "x" } as never] } } }),
    ).rejects.toThrow(/option "a".*badge 0.*label/);
  });
});
