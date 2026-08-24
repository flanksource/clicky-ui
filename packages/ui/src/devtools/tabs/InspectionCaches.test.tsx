import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { DebugClient } from "../debugClient";
import type { FlushResult, InspectionCacheStats } from "../types";
import { InspectionCaches } from "./InspectionCaches";

function cache(policy: string, overrides: Partial<InspectionCacheStats> = {}): InspectionCacheStats {
  return {
    policy,
    entries: 12,
    maxEntries: 1024,
    weight: 12,
    maxWeight: 250_000,
    filling: 0,
    freshForSeconds: 86_400,
    maxFreshForSeconds: 604_800,
    ...overrides,
  };
}

/** A client whose network is a pair of stubs, so a spec drives both endpoints. */
function stubClient(overrides: {
  caches?: InspectionCacheStats[];
  flush?: FlushResult | Error;
}) {
  const flushed: Array<{ policy?: string }> = [];
  const client = new DebugClient();
  vi.spyOn(client, "inspection").mockResolvedValue({ caches: overrides.caches ?? [] });
  vi.spyOn(client, "flushInspection").mockImplementation(async (options = {}) => {
    flushed.push(options);
    if (overrides.flush instanceof Error) throw overrides.flush;
    return overrides.flush ?? { caches: [], entries: 0 };
  });
  return { client, flushed };
}

describe("InspectionCaches", () => {
  const noop = () => undefined;

  it("shows occupancy against the ceiling the policy set", async () => {
    render(
      <InspectionCaches
        caches={[cache("opensearch-fields", { entries: 40, maxEntries: 1024 })]}
        refreshInspection={false}
        onRefreshInspectionChange={noop}
      />,
    );

    expect(await screen.findByText("opensearch-fields")).toBeInTheDocument();
    expect(screen.getByText("40 / 1024")).toBeInTheDocument();
    expect(screen.getByText("1d")).toBeInTheDocument();
  });

  it("flushes one named cache and re-reads what is left", async () => {
    const { client, flushed } = stubClient({
      caches: [cache("column-cardinality")],
      flush: { caches: [{ policy: "column-cardinality", entries: 12 }], entries: 12 },
    });
    render(
      <InspectionCaches client={client} refreshInspection={false} onRefreshInspectionChange={noop} />,
    );
    await screen.findByText("column-cardinality");

    fireEvent.click(screen.getByRole("button", { name: "Flush" }));

    await waitFor(() => expect(flushed).toEqual([{ policy: "column-cardinality" }]));
    expect(await screen.findByText("Dropped 12 entries from 1 cache.")).toBeInTheDocument();
    expect(client.inspection).toHaveBeenCalledTimes(2);
  });

  it("flushes everything when no cache is named", async () => {
    const { client, flushed } = stubClient({
      caches: [cache("a"), cache("b")],
      flush: { caches: [{ policy: "a", entries: 1 }], entries: 1 },
    });
    render(
      <InspectionCaches client={client} refreshInspection={false} onRefreshInspectionChange={noop} />,
    );
    await screen.findByText("a");

    fireEvent.click(screen.getByRole("button", { name: "Flush all" }));

    await waitFor(() => expect(flushed).toEqual([{}]));
    expect(await screen.findByText("Dropped 1 entry from 1 cache.")).toBeInTheDocument();
  });

  // Without the count, an empty flush and a broken one look identical, and an
  // operator will conclude the second.
  it("says plainly when there was nothing to drop", async () => {
    const { client } = stubClient({
      caches: [cache("a", { entries: 3 })],
      flush: { caches: [], entries: 0 },
    });
    render(
      <InspectionCaches client={client} refreshInspection={false} onRefreshInspectionChange={noop} />,
    );
    await screen.findByText("a");

    fireEvent.click(screen.getByRole("button", { name: "Flush all" }));

    expect(await screen.findByText("Nothing was cached to drop.")).toBeInTheDocument();
  });

  it("surfaces a refused flush rather than reporting success", async () => {
    const { client } = stubClient({
      caches: [cache("a")],
      flush: new Error('unknown inspection cache "a"'),
    });
    render(
      <InspectionCaches client={client} refreshInspection={false} onRefreshInspectionChange={noop} />,
    );
    await screen.findByText("a");

    fireEvent.click(screen.getByRole("button", { name: "Flush all" }));

    expect(await screen.findByText('unknown inspection cache "a"')).toBeInTheDocument();
  });

  // An empty cache has nothing to drop, and a button that looks live but does
  // nothing is how an operator learns to distrust the whole panel.
  it("offers no flush for a cache holding nothing", async () => {
    render(
      <InspectionCaches
        caches={[cache("empty", { entries: 0 })]}
        refreshInspection={false}
        onRefreshInspectionChange={noop}
      />,
    );
    await screen.findByText("empty");

    expect(screen.getByRole("button", { name: "Flush" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Flush all" })).toBeDisabled();
  });

  it("reports the rebuild setting and hands changes back", async () => {
    const changes: boolean[] = [];
    const { rerender } = render(
      <InspectionCaches
        caches={[cache("a")]}
        refreshInspection={false}
        onRefreshInspectionChange={(next) => changes.push(next)}
      />,
    );
    expect(screen.queryByText(/Rebuilding on every request/)).toBeNull();

    fireEvent.click(screen.getByRole("checkbox"));
    expect(changes).toEqual([true]);

    // The warning is what stops it being left on by accident, so it is pinned.
    rerender(
      <InspectionCaches
        caches={[cache("a")]}
        refreshInspection
        onRefreshInspectionChange={(next) => changes.push(next)}
      />,
    );
    expect(await screen.findByText(/Rebuilding on every request/)).toBeInTheDocument();
  });
});
