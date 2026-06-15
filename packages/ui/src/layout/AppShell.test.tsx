import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AppShell } from "./AppShell";

describe("AppShell", () => {
  it("renders the brand, nav, search, actions and content slots", () => {
    render(
      <AppShell
        brand={<span>Brand</span>}
        nav={<span>Nav</span>}
        search={<input aria-label="search" />}
        actions={<button>Action</button>}
      >
        <p>content</p>
      </AppShell>,
    );
    expect(screen.getByText("Brand")).toBeTruthy();
    expect(screen.getByText("Nav")).toBeTruthy();
    expect(screen.getByLabelText("search")).toBeTruthy();
    expect(screen.getByRole("button", { name: "Action" })).toBeTruthy();
    expect(screen.getByText("content")).toBeTruthy();
  });

  it("renders the toolbar row only when a toolbar is provided", () => {
    const { rerender } = render(
      <AppShell>
        <p>c</p>
      </AppShell>,
    );
    expect(screen.queryByTestId("toolbar")).toBeNull();
    rerender(
      <AppShell toolbar={<span data-testid="toolbar">tools</span>}>
        <p>c</p>
      </AppShell>,
    );
    expect(screen.getByTestId("toolbar")).toBeTruthy();
  });
});
