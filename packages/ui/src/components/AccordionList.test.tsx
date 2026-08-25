import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AccordionList, type AccordionListProps } from "./AccordionList";

type Route = { path: string; upstream: string };

const SAMPLE: Route[] = [
  { path: "/users", upstream: "users-svc" },
  { path: "/events", upstream: "events-svc" },
];

// A stateful host, because expansion is keyed by index: proving that an open row
// follows its item through a move requires the list to actually reorder, which a
// stateless render can never show.
function Harness({
  initial = SAMPLE,
  onChange,
  ...rest
}: Partial<AccordionListProps<Route>> & {
  initial?: Route[];
  onChange?: (next: Route[]) => void;
}) {
  const [items, setItems] = useState(initial);
  return (
    <AccordionList<Route>
      items={items}
      onChange={(next) => {
        setItems(next);
        onChange?.(next);
      }}
      itemLabel={({ item }) => item.path}
      renderHeader={({ item }) => <span>{item.path}</span>}
      renderBody={({ item, onChange: onItem }) => (
        <input
          aria-label={`Upstream for ${item.path}`}
          value={item.upstream}
          onChange={(e) => onItem({ ...item, upstream: e.target.value })}
        />
      )}
      {...(rest as Partial<AccordionListProps<Route>>)}
    />
  );
}

function headers(): HTMLElement[] {
  return screen.getAllByRole("button").filter((b) => b.hasAttribute("aria-expanded"));
}

function headerFor(path: string): HTMLElement {
  const found = headers().find((h) => h.textContent?.includes(path));
  if (!found) throw new Error(`no accordion header for "${path}"`);
  return found;
}

describe("AccordionList", () => {
  it("does not auto-expand the first row", () => {
    render(<Harness />);
    expect(headers()).toHaveLength(2);
    expect(headers().map((header) => header.getAttribute("aria-expanded"))).toEqual([
      "false",
      "false",
    ]);
    expect(screen.queryByLabelText("Upstream for /users")).toBeNull();
  });

  it("alternates the row backgrounds", () => {
    const { container } = render(<Harness />);
    const rows = container.querySelectorAll("[data-accordion-row]");

    expect(rows).toHaveLength(2);
    expect(rows[0]).toHaveClass("bg-card");
    expect(rows[1]).toHaveClass("bg-muted/20");
  });

  it("expands one row at a time", () => {
    render(<Harness />);
    fireEvent.click(headerFor("/users"));
    expect(screen.getByLabelText("Upstream for /users")).toBeInTheDocument();

    fireEvent.click(headerFor("/events"));
    expect(screen.queryByLabelText("Upstream for /users")).toBeNull();
    expect(screen.getByLabelText("Upstream for /events")).toBeInTheDocument();
  });

  it("closes an open row on its own header", () => {
    render(<Harness />);
    fireEvent.click(headerFor("/users"));
    fireEvent.click(headerFor("/users"));
    expect(headerFor("/users")).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText("Upstream for /users")).toBeNull();
  });

  it("pairs each header with the panel it controls", () => {
    render(<Harness />);
    const header = headerFor("/users");
    fireEvent.click(header);
    const panel = document.getElementById(header.getAttribute("aria-controls")!);
    expect(panel).toHaveAttribute("aria-labelledby", header.id);
  });

  it("offers no actions until asked", () => {
    render(<Harness />);
    expect(screen.queryByRole("button", { name: /^(Move|Duplicate|Remove) / })).toBeNull();
    expect(screen.queryByRole("button", { name: /^Add/ })).toBeNull();
  });

  it("offers only the actions each allow flag turns on", () => {
    render(<Harness allowRemove />);
    expect(screen.getByRole("button", { name: "Remove /users" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Move /users down" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Duplicate /users" })).toBeNull();
  });

  it("never nests the row actions inside the disclosure button", () => {
    // Interactive content inside a <button> is invalid DOM with undefined click
    // targeting — every action would also toggle the row.
    render(<Harness allowReorder allowDuplicate allowRemove />);
    expect(within(headerFor("/users")).queryAllByRole("button")).toHaveLength(0);
    expect(screen.getByRole("button", { name: "Remove /users" })).toBeInTheDocument();
  });

  it("reorders through the destination index and disables the ends", () => {
    const onChange = vi.fn();
    render(<Harness allowReorder onChange={onChange} />);
    expect(screen.getByRole("button", { name: "Move /users up" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move /events down" })).toBeDisabled();

    fireEvent.click(screen.getByRole("button", { name: "Move /users down" }));
    expect(onChange).toHaveBeenLastCalledWith([SAMPLE[1], SAMPLE[0]]);
  });

  it("keeps the open row open when it moves", () => {
    // The index is the key, so a mutator that forgets to follow the item would
    // silently expand whichever row took its place.
    render(<Harness allowReorder />);
    fireEvent.click(headerFor("/events"));
    fireEvent.click(screen.getByRole("button", { name: "Move /events up" }));
    expect(headerFor("/events")).toHaveAttribute("aria-expanded", "true");
    expect(headerFor("/users")).toHaveAttribute("aria-expanded", "false");
  });

  it("duplicates an item as a copy, not a shared reference", () => {
    const onChange = vi.fn();
    render(<Harness allowDuplicate onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Duplicate /users" }));
    const next = onChange.mock.calls.at(-1)![0] as Route[];
    expect(next).toHaveLength(3);
    expect(next[1]).toEqual(next[0]);
    expect(next[1]).not.toBe(next[0]);
  });

  it("duplicates through cloneItem when one is supplied", () => {
    const cloneItem = vi.fn((item: Route) => ({ ...item, path: `${item.path}-copy` }));
    const onChange = vi.fn();
    render(<Harness allowDuplicate cloneItem={cloneItem} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Duplicate /users" }));
    expect((onChange.mock.calls.at(-1)![0] as Route[])[1]!.path).toBe("/users-copy");
  });

  it("removes the item the action names and closes its panel", () => {
    const onChange = vi.fn();
    render(<Harness allowRemove onChange={onChange} />);
    fireEvent.click(headerFor("/users"));
    fireEvent.click(screen.getByRole("button", { name: "Remove /users" }));
    expect(onChange).toHaveBeenLastCalledWith([SAMPLE[1]]);
    expect(headers()).toHaveLength(1);
    expect(screen.queryByLabelText("Upstream for /events")).toBeNull();
  });

  it("edits one item in place through the body slot", () => {
    const onChange = vi.fn();
    render(<Harness onChange={onChange} />);
    fireEvent.click(headerFor("/events"));
    fireEvent.change(screen.getByLabelText("Upstream for /events"), {
      target: { value: "bus-svc" },
    });
    expect(onChange).toHaveBeenLastCalledWith([SAMPLE[0], { path: "/events", upstream: "bus-svc" }]);
  });

  it("adds through the trailing row, seeded by onCreate", () => {
    const onChange = vi.fn();
    render(
      <Harness
        onCreate={() => ({ path: "/new", upstream: "" })}
        addLabel="Add route"
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Add route/ }));
    expect(onChange).toHaveBeenLastCalledWith([...SAMPLE, { path: "/new", upstream: "" }]);
    expect(headerFor("/new")).toHaveAttribute("aria-expanded", "true");
  });

  it("makes the add row the empty state at zero items", () => {
    render(
      <Harness
        initial={[]}
        onCreate={() => ({ path: "/new", upstream: "" })}
        addLabel="Add route"
        addDescription="A route forwards one path to one upstream."
        summary="No routes yet"
      />,
    );
    expect(headers()).toHaveLength(0);
    expect(screen.getByText("No routes yet")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Add route/ })).toHaveTextContent(
      "A route forwards one path to one upstream.",
    );
  });

  it("hides the add row and every action when read-only, but still opens rows", () => {
    render(
      <Harness
        readOnly
        allowReorder
        allowDuplicate
        allowRemove
        onCreate={() => ({ path: "/new", upstream: "" })}
        addLabel="Add route"
      />,
    );
    expect(screen.queryByRole("button", { name: /Add route/ })).toBeNull();
    expect(screen.queryByRole("button", { name: "Remove /users" })).toBeNull();
    fireEvent.click(headerFor("/users"));
    expect(screen.getByLabelText("Upstream for /users")).toBeInTheDocument();
  });

  it("roves focus across the headers and onto the add row", () => {
    render(<Harness onCreate={() => ({ path: "/new", upstream: "" })} addLabel="Add route" />);
    const add = screen.getByRole("button", { name: /Add route/ });
    headerFor("/users").focus();

    fireEvent.keyDown(headerFor("/users"), { key: "ArrowDown" });
    expect(document.activeElement).toBe(headerFor("/events"));

    fireEvent.keyDown(headerFor("/events"), { key: "ArrowDown" });
    expect(document.activeElement).toBe(add);

    fireEvent.keyDown(add, { key: "Home" });
    expect(document.activeElement).toBe(headerFor("/users"));

    fireEvent.keyDown(headerFor("/users"), { key: "End" });
    expect(document.activeElement).toBe(add);
  });

  it("defers to a controlled expanded index", () => {
    const onExpandedChange = vi.fn();
    render(<Harness expanded={1} onExpandedChange={onExpandedChange} />);
    expect(screen.getByLabelText("Upstream for /events")).toBeInTheDocument();

    fireEvent.click(headerFor("/users"));
    expect(onExpandedChange).toHaveBeenCalledWith(0);
    // Still on the row the owner chose — the component does not self-update.
    expect(screen.getByLabelText("Upstream for /events")).toBeInTheDocument();
  });

  it("renders consumer actions beside the built-in ones", () => {
    render(
      <Harness
        allowRemove
        renderActions={({ item }) => (
          <button type="button" aria-label={`Test ${item.path}`}>
            t
          </button>
        )}
      />,
    );
    expect(screen.getByRole("button", { name: "Test /users" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Remove /users" })).toBeInTheDocument();
  });

  it("renders persistent metadata outside the disclosure and action cluster", () => {
    render(
      <Harness
        allowRemove
        renderMeta={({ item }) => (
          <button type="button" aria-label={`Count for ${item.path}`}>
            3
          </button>
        )}
      />,
    );

    const meta = screen.getByRole("button", { name: "Count for /users" });
    expect(meta.closest("[data-accordion-row]")).not.toBeNull();
    expect(within(headerFor("/users")).queryByRole("button")).toBeNull();
  });
});
