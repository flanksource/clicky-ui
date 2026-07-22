// Guards the portal seams that let an app shell host the catalog's own button
// clusters: the collection action bar (Create) and the table/endpoint switcher.
// Both must keep working inline when no target is supplied, so existing
// consumers are unaffected.

import { describe, expect, it } from "vitest";
import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OperationCatalog } from "./OperationCatalog";
import { FAKE_CLIENT, anchorLink } from "./rpc-story.fixtures";

const CREATE = "Create";
const VIEW_TOGGLE = "Table view";

function Harness({ hoist }: { hoist: boolean }) {
  const [actionsHost, setActionsHost] = useState<HTMLElement | null>(null);
  const [toggleHost, setToggleHost] = useState<HTMLElement | null>(null);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <div data-testid="shell-actions" ref={hoist ? setActionsHost : undefined} />
      <div data-testid="shell-toggle" ref={hoist ? setToggleHost : undefined} />
      <div data-testid="catalog-host">
        <OperationCatalog
          definition={{ key: "widgets", title: "Widgets", description: "Widgets." }}
          entities={["widget"]}
          surfaceKey="widgets"
          client={FAKE_CLIENT}
          renderLink={anchorLink}
          actionsContainer={actionsHost}
          viewToggleContainer={toggleHost}
        />
      </div>
    </QueryClientProvider>
  );
}

describe("OperationCatalog action hoisting", () => {
  it("renders both clusters inside the catalog when no portal target is given", async () => {
    render(<Harness hoist={false} />);

    const catalog = screen.getByTestId("catalog-host");
    await waitFor(() =>
      expect(within(catalog).getByRole("button", { name: CREATE })).toBeInTheDocument(),
    );
    expect(within(catalog).getByRole("button", { name: VIEW_TOGGLE })).toBeInTheDocument();
    expect(within(screen.getByTestId("shell-actions")).queryByRole("button")).toBeNull();
  });

  it("portals the action bar into the host container when one is given", async () => {
    render(<Harness hoist />);

    const shellActions = screen.getByTestId("shell-actions");
    await waitFor(() =>
      expect(within(shellActions).getByRole("button", { name: CREATE })).toBeInTheDocument(),
    );
    // It moved rather than duplicated.
    expect(
      within(screen.getByTestId("catalog-host")).queryByRole("button", { name: CREATE }),
    ).toBeNull();
  });

  it("portals the view switcher into its own host container", async () => {
    render(<Harness hoist />);

    const shellToggle = screen.getByTestId("shell-toggle");
    await waitFor(() =>
      expect(within(shellToggle).getByRole("button", { name: VIEW_TOGGLE })).toBeInTheDocument(),
    );
    expect(
      within(screen.getByTestId("catalog-host")).queryByRole("button", { name: VIEW_TOGGLE }),
    ).toBeNull();
  });

  it("keeps the switcher wired to the catalog's view state after hoisting", async () => {
    render(<Harness hoist />);

    const shellToggle = screen.getByTestId("shell-toggle");
    await waitFor(() =>
      expect(within(shellToggle).getByRole("button", { name: VIEW_TOGGLE })).toBeInTheDocument(),
    );
    // aria-pressed reflects catalog-local state, so a portaled button that
    // still reports the live view proves the wiring survived the move.
    expect(within(shellToggle).getByRole("button", { name: VIEW_TOGGLE })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(
      within(shellToggle).getByRole("button", { name: "Endpoint list view" }),
    ).toHaveAttribute("aria-pressed", "false");
  });
});
