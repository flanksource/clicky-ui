import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, cleanup } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ConnectionStorageStatus } from "./ConnectionStorageStatus";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("KEK status", () => {
  it.each([
    ["ready", "KEK ready"],
    ["missing", "KEK missing"],
    ["unavailable", "KEK unavailable"],
    ["not_configured", "KEK not configured"],
  ])("shows %s without revealing key data", async (state, label) => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({
              kek: { state, detail: "Connection encryption status" },
            }),
            { status: 200 },
          ),
        ),
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ConnectionStorageStatus apiBase="/api/v1" />
      </QueryClientProvider>,
    );
    expect(await screen.findByRole("img", { name: label })).toBeDefined();
  });
  it("reports a failed status request as unavailable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(new Response("failure", { status: 503 })),
    );
    render(
      <QueryClientProvider client={new QueryClient()}>
        <ConnectionStorageStatus apiBase="/api/v1" />
      </QueryClientProvider>,
    );
    expect(
      await screen.findByRole("img", { name: "KEK unavailable" }),
    ).toBeDefined();
  });
});
