import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { processDetailRows, processFacetSampleRows, processNodeRows, processSampleRows, stackRecords } from "./fixtures";
import { ProcessTraceDetail } from "./ProcessTraceDetail";
import type { ProcessNodeRow, ProcessSampleRow, StackRecord } from "./types";

const root = processDetailRows.find((row) => row.key === "100:1")!;
const busyChild = processDetailRows.find((row) => row.key === "101:100")!;
const exitedChild = processDetailRows.find((row) => row.key === "102:101")!;
const plain = processNodeRows.find((row) => row.key === "300:299")!;

const section = (title: string) => {
  const heading = screen.getByText(title, { selector: "div" });
  return within(heading.closest("section")!);
};

describe("ProcessTraceDetail", () => {
  it("asks for a selection when there is no node", () => {
    render(<ProcessTraceDetail node={null} samples={[]} />);
    expect(screen.getByText("Select a process to view its trace")).toBeInTheDocument();
  });

  describe("header and overview", () => {
    it("shows the label, pid, parent pid and status", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} />);
      expect(screen.getByRole("heading", { name: "go" })).toBeInTheDocument();
      expect(screen.getByText("pid 101")).toBeInTheDocument();
      expect(screen.getByText("ppid 100")).toBeInTheDocument();
      expect(screen.getByText("running", { selector: "span" })).toBeInTheDocument();
    });

    it("shows the command, the working directory and a running process's start, 'running' exit and lifetime so far", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} />);
      expect(section("Command").getByText("go test ./pkg/...")).toBeInTheDocument();
      const process = section("Process");
      expect(process.getByText("/work/repo/pkg")).toBeInTheDocument();
      expect(process.getByText(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/)).toBeInTheDocument();
      expect(process.getByText("running")).toBeInTheDocument();
      expect(process.getByText("28 s so far")).toBeInTheDocument();
    });

    it("shows an exited process's exit time and its final lifetime", () => {
      render(<ProcessTraceDetail node={exitedChild} samples={[]} />);
      const process = section("Process");
      expect(process.queryByText("running")).not.toBeInTheDocument();
      expect(process.getByText("6.5 s")).toBeInTheDocument();
    });

    it("says the working directory is unavailable when the trace did not record it", () => {
      render(<ProcessTraceDetail node={plain} samples={[]} />);
      expect(section("Process").getByText("Unavailable")).toBeInTheDocument();
    });

    it("renders host links at the top of Overview", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} links={<a href="#step">Step: go test</a>} />);
      expect(screen.getByRole("link", { name: "Step: go test" })).toBeInTheDocument();
    });
  });

  describe("resources", () => {
    it("shows CPU, RSS and the peaks", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} />);
      const resources = section("Resources");
      expect(resources.getByText("88.2%")).toBeInTheDocument();
      expect(resources.getByText("160.0%")).toBeInTheDocument();
      expect(resources.getByText("401 MB")).toBeInTheDocument();
      expect(resources.getByText("488 MB")).toBeInTheDocument();
    });

    it("draws CPU and RSS sparklines from the node's samples, labelled with their max", () => {
      render(<ProcessTraceDetail node={busyChild} samples={processSampleRows} />);
      expect(screen.getByRole("img", { name: "CPU % over time" })).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "RSS over time" })).toBeInTheDocument();
      expect(screen.getByText("max 160.0%")).toBeInTheDocument();
      expect(screen.getByText("max 410 MB")).toBeInTheDocument();
    });

    it("says there are no samples", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} />);
      expect(screen.getAllByText("No samples")).toHaveLength(2);
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("says so for a single sample instead of drawing a line", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[processSampleRows[3]!]} />);
      expect(screen.getByText("140.0% (1 sample)")).toBeInTheDocument();
      expect(screen.queryByRole("img")).not.toBeInTheDocument();
    });

    it("ignores samples of other processes", () => {
      render(<ProcessTraceDetail node={root} samples={processSampleRows} />);
      expect(screen.getAllByText("No samples")).toHaveLength(2);
    });

    it("shows no disk tiles or sparklines when the samples carry no disk IO", () => {
      render(<ProcessTraceDetail node={busyChild} samples={processSampleRows} />);
      expect(screen.queryByText("Disk read")).not.toBeInTheDocument();
      expect(screen.queryByText("Disk write")).not.toBeInTheDocument();
    });

    it("shows the latest cumulative disk read and write as tiles, with sparklines over the samples", () => {
      render(<ProcessTraceDetail node={busyChild} samples={processFacetSampleRows} />);
      const resources = section("Resources");
      // The last of 12 ticks: read 12 x 4,000,000 B, write 12^2 x 500,000 B.
      expect(resources.getByText("46 MB", { selector: "span" })).toBeInTheDocument();
      expect(resources.getByText("69 MB", { selector: "span" })).toBeInTheDocument();
      expect(resources.getByRole("img", { name: "Disk read over time" })).toBeInTheDocument();
      expect(resources.getByRole("img", { name: "Disk write over time" })).toBeInTheDocument();
    });
  });

  describe("stack", () => {
    it("renders a Go checkpoint's goroutine records, with its time and reason", () => {
      render(<ProcessTraceDetail node={root} samples={[]} stacks={stackRecords} />);
      const stack = section("Stack");
      expect(stack.getByText("g17")).toBeInTheDocument();
      expect(stack.getByText("timeout")).toBeInTheDocument();
      expect(stack.getByText(new Date("2026-10-01T09:00:28.000Z").toLocaleString())).toBeInTheDocument();
    });

    it("shows a child process's native dump as raw text, not only the root's stack", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} stacks={stackRecords} />);
      expect(section("Stack").getByText(/Sampling process 101/)).toBeInTheDocument();
    });

    it("shows only the selected process's records", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} stacks={stackRecords} />);
      expect(section("Stack").queryByText("g17")).not.toBeInTheDocument();
    });

    it("shows a failed dump's error", () => {
      render(<ProcessTraceDetail node={exitedChild} samples={[]} stacks={stackRecords} />);
      expect(section("Stack").getByText("the process exited before a stack could be read")).toBeInTheDocument();
    });

    it("omits the Stack section for a node with no records and nothing to collect", () => {
      render(<ProcessTraceDetail node={plain} samples={[]} stacks={stackRecords} />);
      expect(screen.queryByText("Stack", { selector: "div" })).not.toBeInTheDocument();
    });

    it("shows the Stack section for a node that can be collected even before anything was", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} onCollectStack={() => {}} />);
      expect(section("Stack").getByText("No stack trace collected yet.")).toBeInTheDocument();
      expect(section("Stack").getByRole("button", { name: /Native sample/ })).toBeInTheDocument();
    });
  });

  describe("checkpoint chooser", () => {
    const options = () => within(screen.getByRole("combobox", { name: "Stack checkpoint" })).getAllByRole("option");

    it("lists the key's checkpoints with time and reason, latest first and selected", () => {
      render(<ProcessTraceDetail node={root} samples={[]} stacks={stackRecords} />);
      const select = screen.getByRole("combobox", { name: "Stack checkpoint" });
      expect(options().map((option) => option.textContent)).toEqual([
        expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} · timeout · inprocess$/),
        expect.stringMatching(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2} · periodic · inprocess$/),
      ]);
      expect(select).toHaveValue("ckpt-timeout");
    });

    it("shows the earlier checkpoint's goroutines once it is picked", () => {
      render(<ProcessTraceDetail node={root} samples={[]} stacks={stackRecords} />);
      expect(screen.getByText("g22")).toBeInTheDocument();
      fireEvent.change(screen.getByRole("combobox", { name: "Stack checkpoint" }), { target: { value: "ckpt-periodic" } });
      const stack = section("Stack");
      expect(stack.queryByText("g22")).not.toBeInTheDocument();
      expect(stack.getByText("g17")).toBeInTheDocument();
      expect(stack.getByText("periodic")).toBeInTheDocument();
    });

    it("has no chooser for a key with a single checkpoint", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} stacks={stackRecords} />);
      expect(screen.queryByRole("combobox", { name: "Stack checkpoint" })).not.toBeInTheDocument();
    });

    it("follows a newer checkpoint while the user has not picked one", () => {
      const newer: StackRecord = {
        ...stackRecords.find((record) => record.checkpointId === "ckpt-timeout" && record.goroutineId === 1)!,
        checkpointId: "ckpt-final",
        takenAt: "2026-10-01T09:00:40.000Z",
        reason: "final",
        goroutineId: 99,
      };
      const { rerender } = render(<ProcessTraceDetail node={root} samples={[]} stacks={stackRecords} />);
      rerender(<ProcessTraceDetail node={root} samples={[]} stacks={[...stackRecords, newer]} />);
      expect(screen.getByRole("combobox", { name: "Stack checkpoint" })).toHaveValue("ckpt-final");
      expect(screen.getByText("g99")).toBeInTheDocument();
    });
  });

  describe("collecting a stack", () => {
    it("offers one button per transport the node lists, and Refresh once a stack exists", () => {
      render(<ProcessTraceDetail node={root} samples={[]} stacks={stackRecords} onCollectStack={() => {}} />);
      expect(screen.getByRole("button", { name: /Refresh stack trace/ })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Native sample/ })).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Dump goroutines & kill/ })).not.toBeInTheDocument();
    });

    it("offers nothing without onCollectStack", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} stacks={stackRecords} />);
      expect(screen.queryByRole("button", { name: /Native sample/ })).not.toBeInTheDocument();
    });

    it("collects over the chosen transport for the selected node's key", () => {
      const onCollectStack = vi.fn();
      render(<ProcessTraceDetail node={busyChild} samples={[]} onCollectStack={onCollectStack} />);
      fireEvent.click(screen.getByRole("button", { name: /Native sample/ }));
      expect(onCollectStack).toHaveBeenCalledWith("101:100", "native");
    });

    it("disables every collect button while collecting", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} onCollectStack={() => {}} collecting />);
      expect(screen.getByRole("button", { name: /Native sample/ })).toBeDisabled();
      expect(screen.getByRole("button", { name: /Dump goroutines & kill/ })).toBeDisabled();
    });

    it("says it is collecting when there is no stack yet", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} onCollectStack={() => {}} collecting />);
      expect(screen.getByText("Collecting stack trace...")).toBeInTheDocument();
    });

    it("shows why a collection failed", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} onCollectStack={() => {}} collectError="session not found" />);
      expect(screen.getByRole("alert")).toHaveTextContent("session not found");
    });

    it("asks before a destructive transport and does nothing on cancel", () => {
      const onCollectStack = vi.fn();
      render(<ProcessTraceDetail node={busyChild} samples={[]} onCollectStack={onCollectStack} />);
      fireEvent.click(screen.getByRole("button", { name: /Dump goroutines & kill/ }));
      expect(onCollectStack).not.toHaveBeenCalled();
      expect(screen.getByText(/sends SIGQUIT to pid 101/i)).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
      expect(onCollectStack).not.toHaveBeenCalled();
      expect(screen.queryByText(/sends SIGQUIT to pid 101/i)).not.toBeInTheDocument();
    });

    it("runs the destructive transport once confirmed", () => {
      const onCollectStack = vi.fn();
      render(<ProcessTraceDetail node={busyChild} samples={[]} onCollectStack={onCollectStack} />);
      fireEvent.click(screen.getByRole("button", { name: /Dump goroutines & kill/ }));
      const dialog = screen.getByRole("dialog");
      fireEvent.click(within(dialog).getByRole("button", { name: "Dump goroutines & kill" }));
      expect(onCollectStack).toHaveBeenCalledTimes(1);
      expect(onCollectStack).toHaveBeenCalledWith("101:100", "sigquit");
    });

    it("confirms a transport the node marks destructive even when it is not sigquit", () => {
      const onCollectStack = vi.fn();
      const odd: ProcessNodeRow = { ...plain, stackTransports: [{ transport: "gops", destructive: true }] };
      render(<ProcessTraceDetail node={odd} samples={[]} onCollectStack={onCollectStack} />);
      fireEvent.click(screen.getByRole("button", { name: /Collect via gops/ }));
      expect(onCollectStack).not.toHaveBeenCalled();
      expect(screen.getByText(/terminates pid 300/)).toBeInTheDocument();
    });

    it("does not confirm a non-destructive transport", () => {
      const onCollectStack = vi.fn();
      const node: ProcessNodeRow = { ...plain, stackTransports: [{ transport: "pprof", destructive: false }] };
      render(<ProcessTraceDetail node={node} samples={[]} onCollectStack={onCollectStack} />);
      fireEvent.click(screen.getByRole("button", { name: /Collect via pprof/ }));
      expect(onCollectStack).toHaveBeenCalledWith("300:299", "pprof");
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("throws on a transport it does not know rather than offering a button for it", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const odd: ProcessNodeRow = { ...plain, stackTransports: [{ transport: "teleport", destructive: false }] };
      expect(() => render(<ProcessTraceDetail node={odd} samples={[]} onCollectStack={() => {}} />)).toThrow(
        /unknown stack transport "teleport"/,
      );
    });
  });

  describe("facet tabs", () => {
    const tabNames = () => screen.getAllByRole("tab").map((tab) => tab.textContent);
    const withoutFacet = (omit: keyof ProcessSampleRow): ProcessSampleRow[] =>
      processFacetSampleRows.map(
        (row) => Object.fromEntries(Object.entries(row).filter(([field]) => field !== omit)) as ProcessSampleRow,
      );

    it("has no tabs when the samples carry no facet counts and the node has no environment", () => {
      render(<ProcessTraceDetail node={busyChild} samples={processSampleRows} />);
      expect(screen.queryByRole("tablist")).not.toBeInTheDocument();
    });

    it("lists Overview and every facet the session armed", () => {
      render(<ProcessTraceDetail node={busyChild} samples={processFacetSampleRows} />);
      expect(tabNames()).toEqual(["Overview", "Open files", "Sockets", "Ports", "Connections"]);
    });

    it.each([
      ["openFiles", "Open files"],
      ["sockets", "Sockets"],
      ["ports", "Ports"],
      ["connections", "Connections"],
    ] as const)("hides the %s tab when no sample carries its count", (count, tab) => {
      render(<ProcessTraceDetail node={busyChild} samples={withoutFacet(count)} />);
      expect(tabNames()).not.toContain(tab);
      expect(tabNames()).toHaveLength(4);
    });

    it("shows the latest stored list with the time it was read, and a count sparkline", () => {
      render(<ProcessTraceDetail node={busyChild} samples={processFacetSampleRows} />);
      fireEvent.click(screen.getByRole("tab", { name: "Open files" }));
      // Tick 9 stored the last change: stdin and the package directory.
      expect(screen.getByText("/work/repo/pkg")).toBeInTheDocument();
      expect(screen.queryByText("/work/repo/.gavel/traces/run-1/process_tree.jsonl")).not.toBeInTheDocument();
      expect(screen.getByText(`Read at ${formatAt(processFacetSampleRows[8]!.sampledAt)}`)).toBeInTheDocument();
      expect(screen.getByRole("img", { name: "Open files over time" })).toBeInTheDocument();
    });

    it("resolves a list stored only when it changed: the latest row carrying it, not the latest row", () => {
      render(<ProcessTraceDetail node={busyChild} samples={processFacetSampleRows} />);
      fireEvent.click(screen.getByRole("tab", { name: "Ports" }));
      // The port list is stored on tick 1 only; ticks 2-12 carry the count alone.
      expect(screen.getByText("0.0.0.0:8080")).toBeInTheDocument();
      expect(screen.getByText(`Read at ${formatAt(processFacetSampleRows[0]!.sampledAt)}`)).toBeInTheDocument();
    });

    it("reads a zero count with no list as the list having emptied", () => {
      render(<ProcessTraceDetail node={busyChild} samples={processFacetSampleRows} />);
      fireEvent.click(screen.getByRole("tab", { name: "Sockets" }));
      expect(screen.getByText("No open sockets")).toBeInTheDocument();
      expect(screen.queryByText("127.0.0.1:8080")).not.toBeInTheDocument();
    });

    it("says no reading was stored for a process the facet's samples do not cover", () => {
      render(<ProcessTraceDetail node={root} samples={processFacetSampleRows} />);
      fireEvent.click(screen.getByRole("tab", { name: "Open files" }));
      expect(screen.getByText("No reading stored for this process yet")).toBeInTheDocument();
    });

    it("returns to the overview", () => {
      render(<ProcessTraceDetail node={busyChild} samples={processFacetSampleRows} />);
      fireEvent.click(screen.getByRole("tab", { name: "Ports" }));
      fireEvent.click(screen.getByRole("tab", { name: "Overview" }));
      expect(screen.getByText("Command", { selector: "div" })).toBeInTheDocument();
    });

    it("falls back to the overview when the selected process no longer has the open tab", () => {
      const { rerender } = render(<ProcessTraceDetail node={root} samples={[]} />);
      expect(screen.queryByRole("tab", { name: "Environment" })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("tab", { name: "Environment" }));
      rerender(<ProcessTraceDetail node={plain} samples={[]} />);
      expect(screen.getByText("Command", { selector: "div" })).toBeInTheDocument();
    });
  });

  describe("environment tab", () => {
    it("shows the recorded environment sorted by name, masked values as stored", () => {
      render(<ProcessTraceDetail node={root} samples={[]} />);
      fireEvent.click(screen.getByRole("tab", { name: "Environment" }));
      const names = screen
        .getAllByRole("row")
        .slice(1)
        .map((row) => row.textContent?.match(/API_TOKEN|GOFLAGS|HOME|PATH/)?.[0]);
      expect(names).toEqual(["API_TOKEN", "GOFLAGS", "HOME", "PATH"]);
      expect(screen.getByText("********")).toBeInTheDocument();
    });

    it("shows why the environment could not be read", () => {
      render(<ProcessTraceDetail node={exitedChild} samples={[]} />);
      fireEvent.click(screen.getByRole("tab", { name: "Environment" }));
      expect(screen.getByRole("alert")).toHaveTextContent("permission denied reading the environment of pid 102");
    });

    it("has no Environment tab for a node that recorded none", () => {
      render(<ProcessTraceDetail node={busyChild} samples={[]} />);
      expect(screen.queryByRole("tab", { name: "Environment" })).not.toBeInTheDocument();
    });
  });
});

function formatAt(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
