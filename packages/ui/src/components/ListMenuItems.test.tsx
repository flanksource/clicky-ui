import { useState } from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ListMenu, ListMenuHeader, ListMenuItem, ListMenuSection } from "./ListMenu";
import { ListMenuItems } from "./ListMenuItems";

const ROW_HEIGHT = 40;
const VIEWPORT_HEIGHT = 240;
const items = Array.from({ length: 200 }, (_, index) => ({ id: `item-${index}`, label: `Item ${index}` }));
const itemKey = (item: (typeof items)[number]) => item.id;

function Example({ virtualize = true, rows = items }: { virtualize?: boolean; rows?: typeof items }) {
  const [selected, setSelected] = useState(new Set<string>());
  return (
    <ListMenu virtualize={virtualize ? { estimateRowHeight: ROW_HEIGHT, overscan: 2 } : false}>
      <ListMenuSection>
        <ListMenuHeader>
          <button onClick={() => setSelected(new Set(rows.map(itemKey)))}>Select all {rows.length}</button>
          <span>{selected.size} selected</span>
        </ListMenuHeader>
        <ListMenuItems items={rows} getItemKey={itemKey}>
          {item => <ListMenuItem data-testid="item" selected={selected.has(item.id)}>{item.label}</ListMenuItem>}
        </ListMenuItems>
      </ListMenuSection>
    </ListMenu>
  );
}

beforeEach(() => {
  vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
    const height = this.dataset.slot === "list-menu-scroll" ? VIEWPORT_HEIGHT : ROW_HEIGHT;
    const scroll = document.querySelector<HTMLElement>('[data-slot="list-menu-scroll"]');
    const top = this.dataset.slot === "list-menu-items" ? Number(this.parentElement?.dataset.offset ?? 0) - (scroll?.scrollTop ?? 0) : 0;
    return { width: 320, height, top, left: 0, bottom: top + height, right: 320, x: 0, y: top, toJSON: () => ({}) };
  });
  vi.spyOn(HTMLElement.prototype, "offsetHeight", "get").mockReturnValue(ROW_HEIGHT);
  vi.spyOn(HTMLElement.prototype, "offsetWidth", "get").mockReturnValue(320);
});

afterEach(() => vi.restoreAllMocks());

describe("ListMenuItems", () => {
  it("mounts only the viewport and overscan while select-all still covers every item", async () => {
    render(<Example />);
    await waitFor(() => expect(screen.getAllByTestId("item").length).toBeLessThan(20));
    expect(screen.getByText("Item 0")).toBeTruthy();
    expect(screen.queryByText("Item 199")).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Select all 200" }));
    expect(screen.getByText("200 selected")).toBeTruthy();
  });

  it("replaces rows on scroll and preserves the offset when equal data is replaced", async () => {
    const { container, rerender } = render(<Example />);
    const scroll = container.querySelector<HTMLElement>('[data-slot="list-menu-scroll"]');
    expect(scroll).not.toBeNull();
    fireEvent.scroll(scroll!, { target: { scrollTop: ROW_HEIGHT * 100 } });
    await waitFor(() => expect(screen.getByText("Item 100")).toBeTruthy());
    expect(screen.queryByText("Item 0")).toBeNull();
    rerender(<Example rows={[...items]} />);
    expect(scroll!.scrollTop).toBe(ROW_HEIGHT * 100);
    expect(screen.getByText("Item 100")).toBeTruthy();
    expect(screen.getAllByTestId("item").length).toBeLessThan(20);
  });

  it("renders the complete collection when virtualization is disabled", () => {
    render(<Example virtualize={false} />);
    expect(screen.getAllByTestId("item")).toHaveLength(items.length);
  });

  it("does not mount rows in groups outside the shared viewport", async () => {
    const { container } = render(
      <ListMenu virtualize={{ estimateRowHeight: ROW_HEIGHT, overscan: 2 }}>
        {[0, items.length * ROW_HEIGHT].map((offset, group) => (
          <ListMenuSection key={group} data-offset={offset}>
            <ListMenuHeader>Group {group}</ListMenuHeader>
            <ListMenuItems items={items} getItemKey={itemKey}>
              {item => <ListMenuItem>{`Group ${group}: ${item.label}`}</ListMenuItem>}
            </ListMenuItems>
          </ListMenuSection>
        ))}
      </ListMenu>,
    );
    expect(screen.getByText("Group 0: Item 0")).toBeTruthy();
    expect(screen.queryByText("Group 1: Item 0")).toBeNull();
    const scroll = container.querySelector<HTMLElement>('[data-slot="list-menu-scroll"]');
    fireEvent.scroll(scroll!, { target: { scrollTop: items.length * ROW_HEIGHT } });
    await waitFor(() => expect(screen.getByText("Group 1: Item 0")).toBeTruthy());
    expect(screen.queryByText("Group 0: Item 0")).toBeNull();
  });

  it("does not briefly mount distant rows when initially empty groups receive their data", () => {
    const renderDistant = vi.fn((item: (typeof items)[number]) => <ListMenuItem>{item.label}</ListMenuItem>);
    const content = (rows: typeof items) => (
      <ListMenu virtualize={{ estimateRowHeight: ROW_HEIGHT, overscan: 2 }}>
        <ListMenuSection data-offset={0}>
          <ListMenuHeader>First</ListMenuHeader>
          <ListMenuItems items={rows} getItemKey={itemKey}>
            {item => <ListMenuItem>{item.label}</ListMenuItem>}
          </ListMenuItems>
        </ListMenuSection>
        <ListMenuSection data-offset={rows.length * ROW_HEIGHT}>
          <ListMenuHeader>Distant</ListMenuHeader>
          <ListMenuItems items={rows} getItemKey={itemKey}>{renderDistant}</ListMenuItems>
        </ListMenuSection>
      </ListMenu>
    );
    const { rerender } = render(content([]));
    rerender(content(items));
    expect(renderDistant).not.toHaveBeenCalled();
  });
});
