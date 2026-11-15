import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { THREADS } from "../fixtures/threads";
import { parseStateSet, serializeStateSet, type ThreadSort } from "../model/threads";
import { ThreadTree, type ThreadTreeProps } from "./ThreadTree";

function Harness({ selected = null, ...props }: Partial<ThreadTreeProps> & { selected?: number | null }) {
  const [selectedId, setSelectedId] = useState<number | null>(selected);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<ThreadSort>("cpu");
  const [states, setStates] = useState(parseStateSet(""));
  return (
    <>
      <output data-testid="selected">{selectedId}</output>
      <ThreadTree
        threads={THREADS}
        cpuTimeEnabled
        selectedId={selectedId}
        onSelect={setSelectedId}
        query={query}
        onQueryChange={setQuery}
        sort={sort}
        onSortChange={setSort}
        states={states}
        onToggleState={(state) => {
          const next = new Set(states);
          if (!next.delete(state)) next.add(state);
          setStates(parseStateSet(serializeStateSet(next)));
        }}
        onClear={() => {
          setQuery("");
          setStates(new Set());
        }}
        {...props}
      />
    </>
  );
}

const row = (id: number) => document.querySelector<HTMLElement>(`[data-thread-row="${id}"]`);

describe("ThreadTree", () => {
  it("groups the http-nio workers under one node with their count and hides agent threads", () => {
    render(<Harness />);
    const group = screen.getByText("http-nio-8080-exec").closest("[role=treeitem]") as HTMLElement;
    expect(within(group).getByText("5")).toBeInTheDocument();
    expect(row(21)).not.toBeNull();
    expect(row(51)).toBeNull();
    expect(row(11)).toBeNull();
    expect(screen.getByText("(2 hidden)")).toBeInTheDocument();
  });

  it("shows agent threads on request", () => {
    render(<Harness />);
    fireEvent.click(screen.getByLabelText(/Show agent threads/));
    expect(row(51)).not.toBeNull();
    expect(row(11)).not.toBeNull();
  });

  it("restricts to the clicked state and clears it again", () => {
    render(<Harness />);
    fireEvent.click(screen.getByRole("button", { name: /^BLOCKED/ }));
    expect([22, 23].map(row).every(Boolean)).toBe(true);
    expect(row(21)).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Clear" }));
    expect(row(21)).not.toBeNull();
    expect(screen.queryByRole("button", { name: "Clear" })).toBeNull();
  });

  it("counts state chips without the hidden agent threads", () => {
    render(<Harness />);
    expect(screen.getByRole("button", { name: /^RUNNABLE/ })).toHaveTextContent("RUNNABLE3");
  });

  it("selects the thread whose row is clicked", () => {
    render(<Harness />);
    fireEvent.click(within(row(24)!).getByText("http-nio-8080-exec-4"));
    expect(screen.getByTestId("selected")).toHaveTextContent("24");
  });

  it("selects the lock owner, not the waiter, when the owner is clicked", () => {
    render(<Harness selected={22} />);
    fireEvent.click(within(row(22)!).getByRole("button", { name: "http-nio-8080-exec-3" }));
    expect(screen.getByTestId("selected")).toHaveTextContent("23");
  });

  it("shows the lock a thread waits on", () => {
    render(<Harness />);
    expect(within(row(22)!).getByText("com.example.orders.Inventory@7f31245a")).toBeInTheDocument();
    expect(within(row(21)!).queryByText(/owned by/)).toBeNull();
  });

  it("renders host row content and matches host search text", () => {
    render(<Harness rowExtra={(thread) => (thread.id === 21 ? <span>finding: slow total()</span> : null)} getSearchText={(thread) => (thread.id === 21 ? "PriceCalculator" : "")} />);
    expect(within(row(21)!).getByText("finding: slow total()")).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Filter threads"), { target: { value: "pricecalc" } });
    expect(row(21)).not.toBeNull();
    expect(row(22)).toBeNull();
  });

  it("filters by thread id", () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("Filter threads"), { target: { value: "31" } });
    expect(row(31)).not.toBeNull();
    expect(row(21)).toBeNull();
  });

  it("orders by name when asked", () => {
    render(<Harness />);
    const order = () => Array.from(document.querySelectorAll("[data-thread-row]")).map((el) => el.getAttribute("data-thread-row"));
    expect(order().slice(0, 2)).toEqual(["21", "22"]);
    fireEvent.click(screen.getByRole("radio", { name: "Name" }));
    expect(order()[0]).toBe("3");
  });

  it("says nothing matches when the text filter leaves no thread", () => {
    render(<Harness />);
    fireEvent.change(screen.getByLabelText("Filter threads"), { target: { value: "no-such-thread" } });
    expect(screen.getByText("No matching tree nodes.")).toBeInTheDocument();
  });

  it("says no thread matches when the snapshot has none to show", () => {
    render(<Harness threads={[]} />);
    expect(screen.getByText("No threads match the selected filters.")).toBeInTheDocument();
  });

  it("shows a dash instead of a CPU figure when the JVM measures none", () => {
    render(<Harness cpuTimeEnabled={false} />);
    expect(within(row(21)!).getByText("—")).toHaveAttribute("title", expect.stringContaining("does not report"));
  });
});
