import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import type { Inspection } from "./useInspection";
import { InspectionStatus } from "./inspectionStatus";

describe("InspectionStatus", () => {
  it("keeps stale metadata visible with its refresh failure and retry action", () => {
    const inspection: Inspection = {
      nodes: [],
      databases: [],
      activeDatabase: "",
      sqlDatabase: "",
      targetKind: "",
      loading: false,
      error: undefined,
      cache: {
        policy: "sql-catalog",
        state: "stale",
        cached: true,
        loadedAt: "2026-08-20T10:00:00Z",
        freshUntil: "2026-08-21T10:00:00Z",
        lastChangedAt: "2026-08-20T10:00:00Z",
        lastRefreshError: "source unavailable",
        ageMs: 2 * 24 * 60 * 60 * 1_000,
      },
      refreshing: false,
      refresh: vi.fn(),
    };

    const html = renderToStaticMarkup(
      <InspectionStatus inspection={inspection} />,
    );
    expect(html).toContain("Metadata updated 2d ago · stale");
    expect(html).toContain("Refresh failed: source unavailable");
    expect(html).toContain("Refresh metadata");
  });
});
