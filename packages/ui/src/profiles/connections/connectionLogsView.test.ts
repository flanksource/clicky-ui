import { describe, expect, it } from "vitest";
import type { BrowserDescriptor } from "./connectionBrowserModel";
import { logsResultSort } from "./connectionQueryWorkspaceModel";

const descriptor = (
  resultSort?: BrowserDescriptor["resultSort"],
): BrowserDescriptor => ({
  kind: "query",
  provider: "k8s",
  resultView: "logs",
  ...(resultSort ? { resultSort } : {}),
});

describe("handing a logs result to the table", () => {
  it("keeps the order the provider returned", () => {
    // A browser query is a bounded top-N, so the server's order and its cut are
    // one decision. Re-sorting in the browser shows the rows as though the cut
    // had been made the other way round — for Kubernetes, whose API only
    // resumes forward, that renders the oldest lines as "the latest logs".
    expect(logsResultSort(descriptor()).manualSort).toBe(true);
  });

  it("opens on the order the server declared", () => {
    expect(logsResultSort(descriptor({ key: "timestamp", dir: "asc" }))).toEqual(
      { manualSort: true, defaultSort: { key: "timestamp", dir: "asc" } },
    );
  });

  it("leaves the opening sort to the table when the server declares none", () => {
    expect(logsResultSort(descriptor())).toEqual({ manualSort: true });
  });
});
