import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useBrowserRouter, useMemoryRouter, useRouter } from "./router";
import { RouterProvider } from "./RouterProvider";

function MemoryHarness() {
  const router = useMemoryRouter("/a");
  return (
    <div>
      <span data-testid="path">{router.pathname}</span>
      {router.renderLink({ to: "/b", children: "Go B", key: "b" })}
      <button onClick={() => router.navigate("/c")}>nav C</button>
    </div>
  );
}

function RouterConsumer() {
  const { pathname, renderLink } = useRouter();
  return (
    <div>
      <span data-testid="path">{pathname}</span>
      {renderLink({ to: "/x", children: "X", key: "x" })}
    </div>
  );
}

function BrowserSearchHarness() {
  const router = useBrowserRouter();
  return (
    <div>
      <span data-testid="search">{window.location.search}</span>
      <button onClick={() => router.navigate(`${window.location.pathname}?file=model.scad`)}>
        select file
      </button>
    </div>
  );
}

describe("useMemoryRouter", () => {
  it("updates pathname when its link is clicked, without touching window.location", () => {
    render(<MemoryHarness />);
    expect(screen.getByTestId("path").textContent).toBe("/a");
    const before = window.location.pathname;

    fireEvent.click(screen.getByRole("link", { name: "Go B" }));
    expect(screen.getByTestId("path").textContent).toBe("/b");
    expect(window.location.pathname).toBe(before);
  });

  it("updates pathname via imperative navigate", () => {
    render(<MemoryHarness />);
    fireEvent.click(screen.getByRole("button", { name: "nav C" }));
    expect(screen.getByTestId("path").textContent).toBe("/c");
  });
});

describe("useRouter", () => {
  it("falls back to a browser adapter whose <a href> navigates client-side", () => {
    render(<RouterConsumer />);
    // jsdom's default location is http://localhost/ → pathname "/".
    expect(screen.getByTestId("path").textContent).toBe("/");
    const link = screen.getByRole("link", { name: "X" });
    expect(link.getAttribute("href")).toBe("/x");

    // A primary click navigates via the History API (no full-page reload).
    fireEvent.click(link);
    expect(window.location.pathname).toBe("/x");
    expect(screen.getByTestId("path").textContent).toBe("/x");
  });

  it("returns the provided adapter when wrapped in RouterProvider", () => {
    function Provided() {
      const adapter = useMemoryRouter("/provided");
      return (
        <RouterProvider adapter={adapter}>
          <RouterConsumer />
        </RouterProvider>
      );
    }
    render(<Provided />);
    expect(screen.getByTestId("path").textContent).toBe("/provided");
  });

  it("re-renders browser consumers when only the query string changes", () => {
    window.history.replaceState(window.history.state, "", "/customize");
    render(<BrowserSearchHarness />);

    fireEvent.click(screen.getByRole("button", { name: "select file" }));

    expect(screen.getByTestId("search")).toHaveTextContent("?file=model.scad");
  });
});
