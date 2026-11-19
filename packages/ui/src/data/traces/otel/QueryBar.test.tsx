import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { SearchResult, SearchValues } from "./api";
import { QueryBar } from "./QueryBar";

const pin = "oipa.plan.guid=P1";
const own = "db.system=postgresql";
const result: SearchResult = { traces: [], total: 0, services: [], rootOperations: [], attributes: [{ value: own, count: 3 }] };

function bar(value: SearchValues, pinned?: SearchValues) {
  const onChange = vi.fn();
  render(<QueryBar value={value} sources={[{ id: "lab", name: "Lab", type: "opensearch" }]} runs={[]} result={result} allowRecords={false} onChange={onChange} onError={vi.fn()} {...(pinned ? { pinned } : {})} />);
  return onChange;
}

describe("a pinned attribute", () => {
  it("is listed as selected and cannot be toggled off", () => {
    bar({ source: "lab", attributes: { [pin]: "include" } }, { attributes: { [pin]: "include" } });
    const input = screen.getByRole("combobox", { name: "Attributes" });
    expect(input).toHaveValue("+1");
    fireEvent.focus(input);
    expect(screen.getByRole("option", { name: (name) => name.includes(pin) })).toHaveAttribute("aria-disabled", "true");
  });

  it("is kept in the attributes whenever another one is chosen", async () => {
    const onChange = bar({ source: "lab", attributes: { [pin]: "include" } }, { attributes: { [pin]: "include" } });
    const input = screen.getByRole("combobox", { name: "Attributes" });
    fireEvent.focus(input);
    fireEvent.click(screen.getByRole("option", { name: (name) => name.includes(own) }));
    fireEvent.keyDown(input, { key: "Escape" });
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls.at(-1)![0]).toEqual({ attributes: { [pin]: "include", [own]: "include" }, offset: undefined });
  });

  it("is kept when the attributes are cleared", async () => {
    const onChange = bar({ source: "lab", attributes: { [pin]: "include", [own]: "include" } }, { attributes: { [pin]: "include" } });
    fireEvent.click(screen.getByRole("button", { name: /clear/i }));
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(onChange.mock.calls.at(-1)![0]).toEqual({ attributes: { [pin]: "include" }, offset: undefined });
  });

  it("is not locked when the page pins nothing", () => {
    bar({ source: "lab", attributes: { [pin]: "include" } });
    fireEvent.focus(screen.getByRole("combobox", { name: "Attributes" }));
    expect(screen.getByRole("option", { name: (name) => name.includes(pin) })).not.toHaveAttribute("aria-disabled", "true");
  });
});
