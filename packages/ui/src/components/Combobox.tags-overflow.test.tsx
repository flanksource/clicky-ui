import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Combobox } from "./Combobox";

const FILES = ["docs/top.md", "hack/main.go", "internal/cli/flags.go", "internal/cli/kinds.go", "internal/cli/run.go"];
const ROW_CAPACITY = 2;

// jsdom does no layout, so simulate a control row that fits ROW_CAPACITY
// tags beside the "+N more" chip and the input; anything past them wraps.
function stubRowLayout() {
  vi.spyOn(HTMLElement.prototype, "offsetTop", "get").mockImplementation(function (this: HTMLElement) {
    const row = this.closest("[data-jsf-control]");
    if (!row || this.parentElement !== row) return 0;
    const flow = [...row.children].filter((child) => child.matches("[data-combobox-tag], [data-combobox-more], input"));
    const index = flow.indexOf(this);
    const tags = flow.filter((child) => child.matches("[data-combobox-tag]")).length;
    const slots = tags < FILES.length ? ROW_CAPACITY + 2 : ROW_CAPACITY + 1;
    return index >= slots ? 30 : 0;
  });
}

afterEach(() => vi.restoreAllMocks());

describe("Combobox tags overflow", () => {
  it("keeps the tags to one line and lists the rest in a scrolling dropdown", () => {
    stubRowLayout();
    const onChange = vi.fn();
    const { container } = render(
      <Combobox multiple variant="tags" value={FILES} onChange={onChange} options={FILES.map((value) => ({ value, label: value }))} />,
    );

    const row = container.querySelector("[data-jsf-control]")!;
    expect([...row.querySelectorAll(":scope > [data-combobox-tag]")].map((tag) => tag.getAttribute("data-combobox-tag"))).toEqual(
      FILES.slice(0, ROW_CAPACITY),
    );

    fireEvent.click(screen.getByRole("button", { name: `Show ${FILES.length - ROW_CAPACITY} more selected` }));
    const more = screen.getByRole("dialog", { name: "More selected" });
    expect(within(more).getAllByText(/\//).map((tag) => tag.textContent)).toEqual(FILES.slice(ROW_CAPACITY));
    expect(more.querySelector("[data-combobox-more-list]")?.className).toContain("overflow-y-auto");

    fireEvent.click(within(more).getByRole("button", { name: `Remove ${FILES[4]}` }));
    expect(onChange).toHaveBeenCalledWith(FILES.slice(0, 4));
  });

  it("shows every tag and no chip when they fit on one line", () => {
    const { container } = render(
      <Combobox multiple variant="tags" value={FILES} onChange={vi.fn()} options={FILES.map((value) => ({ value, label: value }))} />,
    );

    expect(container.querySelectorAll("[data-combobox-tag]")).toHaveLength(FILES.length);
    expect(screen.queryByRole("button", { name: /more selected/ })).toBeNull();
  });
});
