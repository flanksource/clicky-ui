import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { FILTER_INPUT_DEBOUNCE_MS } from "../../../components/filter-bar-context";
import { QueryBar } from "./QueryBar";

it.each([
  { service: "worker", disabled: true },
  { service: "constructor", disabled: false },
  { service: "__proto__", disabled: false },
])("keeps $service selectable unless it is pinned", async ({ service, disabled }) => {
  const onChange = vi.fn();
  render(<QueryBar
    value={{ source: "lab" }}
    pinned={{ services: { worker: "include" } }}
    sources={[{ id: "lab", name: "Lab", type: "opensearch" }]}
    runs={[]}
    result={{ traces: [], total: 0, services: ["constructor", "__proto__"], rootOperations: [], attributes: [] }}
    onChange={onChange}
    onError={vi.fn()}
  />);

  fireEvent.focus(screen.getByRole("combobox", { name: "Service" }));
  const option = screen.getByRole("option", { name: name => name.includes(service) });
  expect(option.getAttribute("aria-disabled") === "true").toBe(disabled);
  expect(option).toHaveAttribute("aria-selected", String(disabled));
  if (disabled) {
    expect(option).toHaveTextContent("Pinned by this page");
    return;
  }

  vi.useFakeTimers();
  try {
    fireEvent.click(option);
    await act(() => vi.advanceTimersByTimeAsync(FILTER_INPUT_DEBOUNCE_MS));
    expect(onChange).toHaveBeenCalledExactlyOnceWith({
      services: { worker: "include", [service]: "include" }, offset: undefined,
    });
  } finally {
    vi.useRealTimers();
  }
});
