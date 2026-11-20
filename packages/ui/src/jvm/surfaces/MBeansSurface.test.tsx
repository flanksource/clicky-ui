import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeJvmClient, type FakeJvmClient } from "../fixtures/fake-client";
import { CACHE_MBEAN } from "../fixtures/mbeans";
import type { JvmStatus } from "../protocol/types";
import { mutationAllowed } from "../safety/mutation-allowed";
import { JvmProvider } from "./JvmProvider";
import { MBeansSurface, type MBeansSurfaceState } from "./MBeansSurface";

function Harness({ client, initial }: { client: FakeJvmClient; initial: MBeansSurfaceState }) {
  const [state, setState] = useState(initial);
  return (
    <JvmProvider client={client} scope="test">
      <MBeansSurface state={state} onStateChange={setState} />
    </JvmProvider>
  );
}

function renderSurface(status: JvmStatus, initial: MBeansSurfaceState = { mbean: CACHE_MBEAN.objectName }) {
  const client = fakeJvmClient({ status });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={queryClient}>
      <Harness client={client} initial={initial} />
    </QueryClientProvider>,
  );
  return client;
}

describe("MBeansSurface", () => {
  it("merges live values into the selected MBean's attributes", async () => {
    renderSurface({ allowMutation: true });
    expect(await screen.findByTitle("1204")).toBeInTheDocument();
    expect(screen.getByText("com.example.cache.CacheMBeanImpl")).toBeInTheDocument();
    expect(screen.getByText("Write only")).toBeInTheDocument();
  });

  it("requires the operator's consent before invoking, then refreshes values", async () => {
    const client = renderSurface({ allowMutation: true });
    fireEvent.click(await screen.findByRole("tab", { name: /Operations/ }));
    const run = screen.getByRole("button", { name: "Run clear()" });
    expect(run).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Allow MBean changes" }));
    fireEvent.click(run);
    fireEvent.click(screen.getByRole("button", { name: "Invoke" }));
    await waitFor(() => expect(client.invocations).toEqual([{ objectName: CACHE_MBEAN.objectName, operation: "clear", args: [] }]));
    expect(await screen.findByText("Completed.")).toBeInTheDocument();
  });

  it("explains that the agent refuses mutations and keeps writes disabled", async () => {
    renderSurface({ allowMutation: false });
    expect(await screen.findByText(/Runtime changes are disabled for this JVM/)).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: "Allow MBean changes" })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Edit / })).toBeNull();
  });

  it("selecting another MBean resets the tab", async () => {
    renderSurface({ allowMutation: true }, { mbean: CACHE_MBEAN.objectName, view: "operations", q: "java.lang:type=Memory" });
    expect(await screen.findByRole("tab", { name: /Operations/ })).toHaveAttribute("aria-selected", "true");
    const memory = await screen.findByRole("treeitem", { name: "java.lang:type=Memory" });
    fireEvent.click(within(memory).getByText("Memory"));
    expect(await screen.findByRole("heading", { name: "java.lang:type=Memory" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Attributes/ })).toHaveAttribute("aria-selected", "true");
  });
});

describe("mutationAllowed", () => {
  it.each([
    [{ runtime: true, permitted: true, consent: true, requireConsent: true }, true],
    [{ runtime: true, permitted: true, consent: false, requireConsent: false }, true],
    [{ runtime: true, permitted: true, consent: false, requireConsent: true }, false],
    [{ runtime: true, permitted: false, consent: true, requireConsent: true }, false],
    [{ runtime: false, permitted: true, consent: true, requireConsent: true }, false],
    [{ runtime: undefined, permitted: true, consent: true, requireConsent: false }, false],
  ])("%j → %s", (state, expected) => {
    expect(mutationAllowed(state)).toBe(expected);
  });
});
