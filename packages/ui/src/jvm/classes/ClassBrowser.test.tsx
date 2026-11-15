import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { APP_LOADER, CLASS_LOADERS, CLASSES, PLATFORM_CLASSES } from "../fixtures/classes";
import { ClassBrowser, type ClassBrowserProps } from "./ClassBrowser";

function renderBrowser(overrides: Partial<ClassBrowserProps> = {}) {
  const handlers = {
    onLoaderChange: vi.fn(),
    onQueryChange: vi.fn(),
    onIncludePlatformChange: vi.fn(),
    onSelectClass: vi.fn(),
  };
  render(
    <ClassBrowser
      loaders={CLASS_LOADERS}
      loader=""
      query=""
      includePlatform={false}
      classes={CLASSES}
      total={CLASSES.length}
      debounceMs={0}
      {...handlers}
      {...overrides}
    />,
  );
  return handlers;
}

describe("ClassBrowser", () => {
  it("lists the top package with its class count and keeps nested packages collapsed", () => {
    renderBrowser();
    const tree = screen.getByRole("tree", { name: "Loaded classes" });
    expect(within(tree).getByRole("treeitem", { name: "com" })).toHaveTextContent(/^com\(9\)/);
    expect(within(tree).getByRole("treeitem", { name: "com.example" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByText(`${CLASSES.length} of ${CLASSES.length} classes`)).toBeInTheDocument();
  });

  it("opens every package while a query is active and selects a class with its loader", () => {
    const { onSelectClass } = renderBrowser({ query: "OrderService", classes: [CLASSES[0]!], total: 1 });
    fireEvent.click(within(screen.getByRole("treeitem", { name: "com.example.orders.OrderService" })).getByText("OrderService"));
    expect(onSelectClass.mock.calls).toEqual([[{ name: "com.example.orders.OrderService", loader: APP_LOADER }]]);
  });

  it("does not select when a package row is clicked", () => {
    const { onSelectClass } = renderBrowser({ query: "Order", classes: CLASSES.slice(0, 2), total: 2 });
    fireEvent.click(within(screen.getByRole("treeitem", { name: "com.example.orders" })).getByText(/orders/));
    expect(onSelectClass).not.toHaveBeenCalled();
  });

  it("reveals an externally selected class inside collapsed packages", () => {
    renderBrowser({ selected: { name: "com.example.payments.PaymentClient$Retry", loader: APP_LOADER } });
    expect(screen.getByRole("treeitem", { name: "com.example.payments.PaymentClient$Retry" })).toHaveAttribute("aria-selected", "true");
  });

  it("reports a loader change, using the empty string for all loaders", () => {
    const { onLoaderChange } = renderBrowser({ loader: APP_LOADER });
    const select = screen.getByRole("combobox", { name: "Class loader" });
    expect(select).toHaveValue(APP_LOADER);
    expect(within(select).getAllByRole("option").map((option) => option.textContent)).toEqual([
      "All loaders",
      "Order application · 2841 classes",
      "Platform · 412 classes",
      "Bootstrap · 1670 classes",
    ]);
    fireEvent.change(select, { target: { value: "bootstrap" } });
    fireEvent.change(select, { target: { value: "" } });
    expect(onLoaderChange.mock.calls).toEqual([["bootstrap"], [""]]);
  });

  it("marks a virtual loader group in the loader list", () => {
    renderBrowser({ loaders: [{ ...CLASS_LOADERS[0]!, virtual: true }] });
    expect(screen.getByRole("option", { name: "Order application · 2841 classes · group" })).toBeInTheDocument();
  });

  it("reports the platform toggle", () => {
    const { onIncludePlatformChange } = renderBrowser();
    fireEvent.click(screen.getByRole("checkbox", { name: "Include platform classes" }));
    expect(onIncludePlatformChange).toHaveBeenCalledWith(true);
  });

  it("commits the filter text after the debounce, once, with the final text", async () => {
    const { onQueryChange } = renderBrowser({ debounceMs: 20 });
    const input = screen.getByRole("textbox", { name: "Filter classes" });
    fireEvent.change(input, { target: { value: "Ord" } });
    fireEvent.change(input, { target: { value: "Order" } });
    expect(onQueryChange).not.toHaveBeenCalled();
    await waitFor(() => expect(onQueryChange.mock.calls).toEqual([["Order"]]));
  });

  it("follows a filter changed from outside", () => {
    renderBrowser({ query: "Ledger" });
    expect(screen.getByRole("textbox", { name: "Filter classes" })).toHaveValue("Ledger");
  });

  it("shows the loader of each class when browsing every loader, with the host's badge", () => {
    renderBrowser({
      query: "Thread",
      classes: PLATFORM_CLASSES.slice(0, 1),
      total: 1,
      renderClassBadge: (ref) => <span data-testid="badge">{ref.name.length}</span>,
    });
    const row = screen.getByRole("treeitem", { name: "java.lang.Thread" });
    expect(within(row).getByText("bootstrap")).toBeInTheDocument();
    expect(within(row).getByTestId("badge")).toHaveTextContent("16");
  });

  it("hides the per-class loader once a loader is chosen", () => {
    renderBrowser({ loader: APP_LOADER, query: "Ledger", classes: [CLASSES[3]!], total: 1 });
    expect(within(screen.getByRole("treeitem", { name: "com.example.orders.Ledger" })).queryByText(APP_LOADER)).toBeNull();
  });

  it("offers the next page only while classes remain, and says how many are loaded", () => {
    const onLoadMore = vi.fn();
    renderBrowser({ total: 2841, onLoadMore });
    expect(screen.getByText(`${CLASSES.length} of 2841 classes`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Load more" }));
    expect(onLoadMore).toHaveBeenCalledOnce();
  });

  it("has no load-more control when every class is loaded", () => {
    renderBrowser();
    expect(screen.queryByRole("button", { name: "Load more" })).toBeNull();
  });

  it("disables load more while the next page is loading", () => {
    renderBrowser({ total: 2841, onLoadMore: vi.fn(), loadingMore: true });
    expect(screen.getByRole("button", { name: "Load more" })).toBeDisabled();
  });

  it("says nothing matched instead of showing an empty tree", () => {
    renderBrowser({ query: "Nope", classes: [], total: 0 });
    expect(screen.getByText("No loaded classes match.")).toBeInTheDocument();
    expect(screen.queryByRole("tree")).toBeNull();
  });

  it("shows the error slot instead of the tree", () => {
    renderBrowser({ error: <p role="alert">class search failed</p> });
    expect(screen.getByRole("alert")).toHaveTextContent("class search failed");
    expect(screen.queryByRole("tree")).toBeNull();
  });

  it("shows a loading state instead of the tree while the first page loads", () => {
    renderBrowser({ loading: true, classes: [], total: 0 });
    expect(screen.queryByRole("tree")).toBeNull();
    expect(screen.queryByText("No loaded classes match.")).toBeNull();
  });
});
