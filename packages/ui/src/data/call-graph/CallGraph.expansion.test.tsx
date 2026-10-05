import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CallGraph, type CallGraphProps } from "./CallGraph";
import {
  GO_ROOT,
  goGraph,
  goModuleScopesExpansion,
  type GoGraph,
} from "./call-graph.fixtures";
import type { CallGraphFetchParams } from "./types";

function deferredExpansion() {
  let resolve!: (graph: GoGraph) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<GoGraph>((done, fail) => {
    resolve = done;
    reject = fail;
  });
  return { promise, resolve, reject };
}

async function expand() {
  const button = await screen.findByRole("button", {
    name: "Expand 2 more from Pipeline.moduleScopes",
  });
  await act(async () => fireEvent.click(button));
}

describe("CallGraph expansion lifecycle", () => {
  it("does not restore an aborted loading status when returning to the previous key", async () => {
    const pending = deferredExpansion();
    const fetchGraph = vi.fn((params: CallGraphFetchParams) =>
      params.purpose === "expand"
        ? pending.promise
        : Promise.resolve(goGraph()),
    );
    const { rerender } = render(
      <CallGraph root={GO_ROOT} fetchGraph={fetchGraph} fetchKey="scope-a" />,
    );
    await expand();
    rerender(
      <CallGraph root={GO_ROOT} fetchGraph={fetchGraph} fetchKey="scope-b" />,
    );
    await waitFor(() =>
      expect(
        fetchGraph.mock.calls.filter(([params]) => params.purpose === "load"),
      ).toHaveLength(2),
    );
    rerender(
      <CallGraph root={GO_ROOT} fetchGraph={fetchGraph} fetchKey="scope-a" />,
    );
    await waitFor(() =>
      expect(
        fetchGraph.mock.calls.filter(([params]) => params.purpose === "load"),
      ).toHaveLength(3),
    );
    expect(
      screen.queryByText("Loading more around Pipeline.moduleScopes…"),
    ).not.toBeInTheDocument();
    await act(async () => pending.resolve(goModuleScopesExpansion()));
    expect(
      screen.queryByRole("button", {
        name: "method Pipeline.broadModuleScopes",
      }),
    ).not.toBeInTheDocument();
  });

  it("reports an active expansion failure and allows retry", async () => {
    const pending = deferredExpansion();
    let attempts = 0;
    const fetchGraph = vi.fn((params: CallGraphFetchParams) => {
      if (params.purpose !== "expand") return Promise.resolve(goGraph());
      return ++attempts === 1
        ? pending.promise
        : Promise.resolve(goModuleScopesExpansion());
    });
    render(<CallGraph root={GO_ROOT} fetchGraph={fetchGraph} />);
    await expand();
    await act(async () =>
      pending.reject(new Error("Graph service unavailable")),
    );
    expect(
      within(screen.getByLabelText("Selection")).getByRole("status"),
    ).toHaveTextContent(
      "Cannot expand Pipeline.moduleScopes: Graph service unavailable",
    );
    await expand();
    expect(
      await screen.findByRole("button", {
        name: "method Pipeline.broadModuleScopes",
      }),
    ).toBeInTheDocument();
    expect(attempts).toBe(2);
  });

  const changes: Array<[string, Partial<CallGraphProps<GoGraph>>]> = [
    ["root", { root: undefined }],
    ["depth", { depth: 3 }],
    ["direction", { direction: "callees" }],
    ["exclusions", { exclude: ["fmt"] }],
    ["access", { access: ["call"] }],
    ["columns", { columns: true }],
    ["fetch key", { fetchKey: "scope-b" }],
  ];
  it.each(changes)(
    "aborts an expansion after changing %s",
    async (_name, change) => {
      const pending = deferredExpansion();
      const fetchGraph = vi.fn((params: CallGraphFetchParams) =>
        params.purpose === "expand"
          ? pending.promise
          : Promise.resolve(goGraph()),
      );
      const props: CallGraphProps<GoGraph> = {
        root: GO_ROOT,
        fetchGraph,
        onDepthChange: vi.fn(),
        onDirectionChange: vi.fn(),
        onExcludeChange: vi.fn(),
        onAccessChange: vi.fn(),
        onColumnsChange: vi.fn(),
      };
      const { rerender } = render(<CallGraph {...props} />);
      await expand();
      const signal = fetchGraph.mock.calls.find(
        ([params]) => params.purpose === "expand",
      )![0].signal;
      rerender(<CallGraph {...props} {...change} />);
      await waitFor(() => expect(signal.aborted).toBe(true));
      await act(async () => pending.reject(new Error("Old expansion failed")));
      expect(
        screen.queryByText(/Old expansion failed/),
      ).not.toBeInTheDocument();
    },
  );

  it("does not start duplicate requests and aborts on unmount", async () => {
    const pending = deferredExpansion();
    const fetchGraph = vi.fn((params: CallGraphFetchParams) =>
      params.purpose === "expand"
        ? pending.promise
        : Promise.resolve(goGraph()),
    );
    const { unmount } = render(
      <CallGraph root={GO_ROOT} fetchGraph={fetchGraph} />,
    );
    await expand();
    await expand();
    expect(
      fetchGraph.mock.calls.filter(([params]) => params.purpose === "expand"),
    ).toHaveLength(1);
    const signal = fetchGraph.mock.calls[1]![0].signal;
    unmount();
    expect(signal.aborted).toBe(true);
    await act(async () => pending.resolve(goModuleScopesExpansion()));
  });

  it.each(["success", "failure"])(
    "ignores an old %s without clearing the newer expansion",
    async (outcome) => {
      const old = deferredExpansion();
      const current = deferredExpansion();
      let expansions = 0;
      const fetchGraph = vi.fn((params: CallGraphFetchParams) => {
        if (params.purpose !== "expand") return Promise.resolve(goGraph());
        return ++expansions === 1 ? old.promise : current.promise;
      });
      const { rerender } = render(
        <CallGraph root={GO_ROOT} fetchGraph={fetchGraph} fetchKey="scope-a" />,
      );
      await expand();
      rerender(
        <CallGraph root={GO_ROOT} fetchGraph={fetchGraph} fetchKey="scope-b" />,
      );
      await waitFor(() =>
        expect(
          fetchGraph.mock.calls.filter(([params]) => params.purpose === "load"),
        ).toHaveLength(2),
      );
      await expand();
      await act(async () => {
        if (outcome === "success") old.resolve(goModuleScopesExpansion());
        else old.reject(new Error("Stale failure"));
      });
      expect(
        within(screen.getByLabelText("Selection")).getByRole("status"),
      ).toHaveTextContent("Loading more around Pipeline.moduleScopes");
      expect(
        screen.queryByRole("button", {
          name: "method Pipeline.broadModuleScopes",
        }),
      ).not.toBeInTheDocument();
      await act(async () => current.resolve(goModuleScopesExpansion()));
      expect(
        await screen.findByRole("button", {
          name: "method Pipeline.broadModuleScopes",
        }),
      ).toBeInTheDocument();
      expect(screen.queryByLabelText("Selection")).not.toBeInTheDocument();
    },
  );
});
