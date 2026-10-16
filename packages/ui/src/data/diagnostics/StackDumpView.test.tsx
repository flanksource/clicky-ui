import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { stackRecords } from "../traces/fixtures";
import { StackDumpView, type StackDumpViewProps } from "./StackDumpView";

const GO_DUMP = `goroutine 1 [running]:
main.work(0x1)
\t/app/main.go:12 +0x1f
main.main()
\t/app/main.go:5 +0x10

goroutine 7 [chan receive]:
main.consume(0xc000)
\t/app/consume.go:30 +0x2a

goroutine 9 [select]:
runtime.gopark(0x0)
\t/usr/local/go1.22/src/runtime/proc.go:400 +0xce
`;

const JVM_DUMP = `"http-nio-8080-exec-7" #41 daemon prio=5 os_prio=0 tid=0x00007f1c nid=0x2b1 runnable [0x00007f1b]
   java.lang.Thread.State: RUNNABLE
\tat com.acme.billing.CycleService.process(CycleService.java:212)
\tat java.base/java.lang.Thread.run(Thread.java:840)
`;

describe("StackDumpView", () => {
  it("lists Go goroutines with a filtered/total count, hiding runtime-only ones by default", () => {
    render(<StackDumpView text={GO_DUMP} />);
    expect(screen.getByText("2 / 3 goroutines")).toBeInTheDocument();
    expect(screen.getByText("g1")).toBeInTheDocument();
    expect(screen.getByText("g7")).toBeInTheDocument();
    expect(screen.queryByText("g9")).not.toBeInTheDocument();
  });

  it("shows runtime-only goroutines once hide-runtime is switched off, and Clear restores the default", () => {
    render(<StackDumpView text={GO_DUMP} />);
    fireEvent.click(screen.getByLabelText("Hide runtime-only"));
    expect(screen.getByText("3 / 3 goroutines")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(screen.getByText("2 / 3 goroutines")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Clear" })).not.toBeInTheDocument();
  });

  it("filters by search text", () => {
    render(<StackDumpView text={GO_DUMP} />);
    fireEvent.change(screen.getByLabelText("Filter goroutines"), { target: { value: "consume" } });
    expect(screen.getByText("1 / 3 goroutines")).toBeInTheDocument();
    expect(screen.queryByText("g1")).not.toBeInTheDocument();
  });

  it("filters by state chip, sorted by count", () => {
    render(<StackDumpView text={GO_DUMP} />);
    const chip = screen.getByRole("button", { name: /chan receive/ });
    fireEvent.click(chip);
    expect(chip).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByText("1 / 3 goroutines")).toBeInTheDocument();
    expect(screen.getByText("g7")).toBeInTheDocument();
  });

  it("resets filters when the dump changes", () => {
    const { rerender } = render(<StackDumpView text={GO_DUMP} />);
    fireEvent.change(screen.getByLabelText("Filter goroutines"), { target: { value: "consume" } });
    rerender(<StackDumpView text={`${GO_DUMP}\n`} />);
    expect(screen.getByLabelText("Filter goroutines")).toHaveValue("");
  });

  it("renders JVM thread dumps as threads", () => {
    render(<StackDumpView text={JVM_DUMP} />);
    expect(screen.getByText("1 / 1 threads")).toBeInTheDocument();
    expect(screen.getByLabelText("Filter threads")).toHaveAttribute(
      "placeholder",
      "Filter by thread name, function, or file",
    );
  });

  it("falls back to the raw text when the format is not recognised", () => {
    const { container } = render(<StackDumpView text={"SIGQUIT: quit\nPC=0x1 m=0"} />);
    expect(container.querySelector("pre")).toHaveTextContent("SIGQUIT: quit");
    expect(screen.queryByLabelText("Filter frames")).not.toBeInTheDocument();
  });

  it("shows status, collected-at, reason and error", () => {
    render(
      <StackDumpView
        text={GO_DUMP}
        status="ready"
        collectedAt="2026-10-01T09:00:00.000Z"
        reason="watchdog timeout"
        error="partial dump"
      />,
    );
    expect(screen.getByText("ready")).toBeInTheDocument();
    expect(screen.getByText("watchdog timeout")).toBeInTheDocument();
    expect(screen.getByText(new Date("2026-10-01T09:00:00.000Z").toLocaleString())).toBeInTheDocument();
    expect(screen.getByText("partial dump")).toHaveClass("text-red-600");
  });

  it("renders header actions beside the meta row", () => {
    render(<StackDumpView text={GO_DUMP} headerActions={<button type="button">Refresh</button>} />);
    expect(screen.getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });

  it("in single-item mode suppresses the filter UI but keeps every item and header actions", () => {
    render(
      <StackDumpView text={GO_DUMP} singleItem headerActions={<button type="button">Refresh</button>} />,
    );
    expect(screen.queryByLabelText("Filter goroutines")).not.toBeInTheDocument();
    expect(screen.queryByText(/goroutines$/)).not.toBeInTheDocument();
    expect(screen.getByText("g9")).toBeInTheDocument();
    expect(within(document.body).getByRole("button", { name: "Refresh" })).toBeInTheDocument();
  });

  it("says when filters match nothing", () => {
    render(<StackDumpView text={GO_DUMP} />);
    fireEvent.change(screen.getByLabelText("Filter goroutines"), { target: { value: "zzz-nothing" } });
    expect(screen.getByText("No goroutines match the current filters.")).toBeInTheDocument();
  });

  it("throws when given neither text nor records", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const bare = {} as unknown as StackDumpViewProps;
    expect(() => render(<StackDumpView {...bare} />)).toThrow(/either text or records/);
  });

  describe("records", () => {
    const checkpoint = (id: string) => stackRecords.filter((record) => record.checkpointId === id);

    it("renders Go goroutine records as goroutines without parsing text, taking time and reason from the records", () => {
      render(<StackDumpView records={checkpoint("ckpt-timeout")} />);
      // g22 is runtime-free; hide-runtime keeps all three user goroutines.
      expect(screen.getByText("3 / 3 goroutines")).toBeInTheDocument();
      expect(screen.getByText("g17")).toBeInTheDocument();
      expect(screen.getByText("timeout")).toBeInTheDocument();
      expect(screen.getByText(new Date("2026-10-01T09:00:28.000Z").toLocaleString())).toBeInTheDocument();
    });

    it("shows a record's state with its wait, and its created-by frame once the goroutine is opened", () => {
      render(<StackDumpView records={checkpoint("ckpt-timeout")} />);
      expect(screen.getByText("chan receive, 2 minutes")).toBeInTheDocument();
      expect(screen.getByText("runner.New")).toBeInTheDocument();
    });

    it("filters records by state chip like parsed text", () => {
      render(<StackDumpView records={checkpoint("ckpt-timeout")} />);
      fireEvent.click(screen.getByRole("button", { name: /select/ }));
      expect(screen.getByText("1 / 3 goroutines")).toBeInTheDocument();
      expect(screen.getByText("g22")).toBeInTheDocument();
    });

    it("lets explicit collectedAt and reason override the records'", () => {
      render(<StackDumpView records={checkpoint("ckpt-timeout")} reason="override" />);
      expect(screen.getByText("override")).toBeInTheDocument();
      expect(screen.queryByText("timeout")).not.toBeInTheDocument();
    });

    it("shows a native dump record's raw text", () => {
      const { container } = render(<StackDumpView records={checkpoint("ckpt-native")} />);
      expect(container.querySelector("pre")).toHaveTextContent("Sampling process 101");
      expect(screen.queryByLabelText("Filter goroutines")).not.toBeInTheDocument();
    });

    it("shows a failed dump's error and no empty text block", () => {
      const { container } = render(<StackDumpView records={checkpoint("ckpt-exited")} />);
      expect(screen.getByText("the process exited before a stack could be read")).toHaveClass("text-red-600");
      expect(container.querySelector("pre")).toBeNull();
    });

    it("resets filters when the checkpoint changes", () => {
      const { rerender } = render(<StackDumpView records={checkpoint("ckpt-timeout")} />);
      fireEvent.change(screen.getByLabelText("Filter goroutines"), { target: { value: "sql" } });
      rerender(<StackDumpView records={checkpoint("ckpt-periodic")} />);
      expect(screen.getByLabelText("Filter goroutines")).toHaveValue("");
    });

    it("throws on a record of an unknown format", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const odd = [{ ...checkpoint("ckpt-native")[0]!, format: "jvm" as unknown as "go" }];
      expect(() => render(<StackDumpView records={odd} />)).toThrow(/unknown format "jvm"/);
    });

    it("throws on a dump that mixes Go and native records", () => {
      vi.spyOn(console, "error").mockImplementation(() => {});
      const mixed = [...checkpoint("ckpt-timeout"), ...checkpoint("ckpt-native")];
      expect(() => render(<StackDumpView records={mixed} />)).toThrow(/cannot mix Go and native/);
    });
  });
});
