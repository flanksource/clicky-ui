import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { APP_LOADER } from "../fixtures/classes";
import { fakeJvmClient, type FakeJvmClient } from "../fixtures/fake-client";
import type { JvmDiagnosticsClient } from "../protocol/client";
import type { JvmStatus } from "../protocol/types";
import { JvmProvider } from "./JvmProvider";
import { PatchesSurface, type PatchesSurfaceProps } from "./PatchesSurface";

const ORDER_SERVICE = "com.example.orders.OrderService";

function renderSurface({ status = { allowMutation: true }, patched = true, client: override, ...props }: { status?: JvmStatus; patched?: boolean; client?: (client: FakeJvmClient) => JvmDiagnosticsClient } & PatchesSurfaceProps = {}) {
  const client = fakeJvmClient({ status, patched });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");
  render(
    <QueryClientProvider client={queryClient}>
      <JvmProvider client={override ? override(client) : client} scope="test">
        <PatchesSurface {...props} />
      </JvmProvider>
    </QueryClientProvider>,
  );
  return { client, invalidate };
}

describe("PatchesSurface", () => {
  it("lists the patched class with its lease countdown", async () => {
    renderSurface();
    expect(await screen.findByText(ORDER_SERVICE)).toBeInTheDocument();
    expect(screen.getByText("1 class patched")).toBeInTheDocument();
    expect(screen.getByText(/^in [12]m \d+s$/)).toBeInTheDocument();
  });

  it("requires the operator's consent before restoring, then refreshes the register and decompiled sources", async () => {
    const { client, invalidate } = renderSurface();
    const restore = await screen.findByRole("button", { name: `Restore ${ORDER_SERVICE}` });
    expect(restore).toBeDisabled();
    fireEvent.click(screen.getByRole("checkbox", { name: "Allow patch changes" }));
    fireEvent.click(restore);
    await waitFor(() => expect(client.mutations).toEqual([{ method: "restoreClass", request: { class: ORDER_SERVICE, loader: APP_LOADER } }]));
    expect(await screen.findByText("This JVM is running its original bytecode.")).toBeInTheDocument();
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["jvm", "test", "patches"] });
    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["jvm", "test", "class-source"] });
  });

  it("renews the lease for two minutes", async () => {
    const { client } = renderSurface({ requireConsent: false });
    const renew = await screen.findByRole("button", { name: `Renew lease of ${ORDER_SERVICE}` });
    await waitFor(() => expect(renew).toBeEnabled());
    fireEvent.click(renew);
    await waitFor(() => expect(client.mutations).toEqual([{ method: "renewClassLease", request: { class: ORDER_SERVICE, loader: APP_LOADER, seconds: 120 } }]));
  });

  it("shows the agent's error when a restore fails and keeps the row", async () => {
    renderSurface({
      requireConsent: false,
      client: (client) => ({
        ...client,
        restoreClass: async () => {
          throw new Error("redefinition rejected");
        },
      }),
    });
    const restore = await screen.findByRole("button", { name: `Restore ${ORDER_SERVICE}` });
    await waitFor(() => expect(restore).toBeEnabled());
    fireEvent.click(restore);
    expect(await screen.findByText(`${ORDER_SERVICE}: redefinition rejected`)).toBeInTheDocument();
    expect(screen.getByText("1 class patched")).toBeInTheDocument();
  });

  it("explains that the agent refuses mutations and keeps restore disabled", async () => {
    renderSurface({ status: { allowMutation: false } });
    expect(await screen.findByText(/Runtime changes are disabled for this JVM/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Restore ${ORDER_SERVICE}` })).toBeDisabled();
  });

  it("keeps writes disabled when the host does not permit mutations", async () => {
    renderSurface({ canMutate: false, requireConsent: false });
    expect(await screen.findByRole("button", { name: `Restore ${ORDER_SERVICE}` })).toBeDisabled();
    expect(screen.queryByRole("checkbox", { name: "Allow patch changes" })).toBeNull();
  });

  it("shows the empty register with the host's hint", async () => {
    renderSurface({ patched: false, emptyHint: <a href="#/classes">Open classes</a> });
    expect(await screen.findByText("This JVM is running its original bytecode.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open classes" })).toBeInTheDocument();
  });

  it("surfaces a failed register read", async () => {
    renderSurface({
      client: (client) => ({
        ...client,
        patches: async () => {
          throw new Error("agent unreachable");
        },
      }),
    });
    expect(await screen.findByText("Patch register unavailable")).toBeInTheDocument();
  });
});
