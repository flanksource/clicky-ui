import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MBEAN_NAMES } from "../fixtures/mbeans";
import { MBeanBrowser } from "./MBeanBrowser";

function renderBrowser(overrides: Partial<Parameters<typeof MBeanBrowser>[0]> = {}) {
  const onSelect = vi.fn();
  const onFilterChange = vi.fn();
  render(<MBeanBrowser names={MBEAN_NAMES} filter="" onFilterChange={onFilterChange} selected="" onSelect={onSelect} {...overrides} />);
  return { onSelect, onFilterChange };
}

describe("MBeanBrowser", () => {
  it("lists domains with counts and keeps type groups collapsed until filtered", () => {
    renderBrowser();
    expect(screen.getByText(`${MBEAN_NAMES.length} of ${MBEAN_NAMES.length} MBeans`)).toBeInTheDocument();
    const tree = screen.getByRole("tree", { name: "MBeans" });
    expect(within(tree).getByRole("treeitem", { name: "java.lang" })).toHaveTextContent("java.lang (3)");
    expect(within(tree).getByRole("treeitem", { name: "GarbageCollector" })).toHaveAttribute("aria-expanded", "false");
  });

  it("filters on the full ObjectName and opens matching groups", () => {
    renderBrowser({ filter: "http-nio" });
    expect(screen.getByText(`1 of ${MBEAN_NAMES.length} MBeans`)).toBeInTheDocument();
    expect(screen.getByRole("treeitem", { name: 'Catalina:name="http-nio-8080",type=GlobalRequestProcessor' })).toHaveTextContent("http-nio-8080");
  });

  it("selects an MBean by its exact ObjectName but not when a group is clicked", () => {
    const { onSelect } = renderBrowser({ filter: "Cache" });
    fireEvent.click(within(screen.getByRole("treeitem", { name: "acme.cache:name=orders,type=Cache" })).getByText("orders"));
    fireEvent.click(screen.getByRole("treeitem", { name: "Cache" }).firstElementChild!);
    expect(onSelect.mock.calls).toEqual([["acme.cache:name=orders,type=Cache"]]);
  });

  it("reveals an externally selected MBean inside a collapsed group", () => {
    renderBrowser({ selected: "java.lang:name=G1 Young Generation,type=GarbageCollector" });
    expect(screen.getByRole("treeitem", { name: "java.lang:name=G1 Young Generation,type=GarbageCollector" })).toHaveAttribute("aria-selected", "true");
  });

  it("shows the error slot instead of the tree", () => {
    renderBrowser({ error: <p role="alert">search failed</p> });
    expect(screen.getByRole("alert")).toHaveTextContent("search failed");
    expect(screen.queryByRole("tree")).toBeNull();
  });
});
