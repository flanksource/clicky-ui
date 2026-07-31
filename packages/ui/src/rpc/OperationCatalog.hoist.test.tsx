// Guards the portal seam that lets an app shell host the catalog's collection
// action bar while preserving inline rendering when no target is supplied.

import { describe, expect, it } from "vitest";
import { useState } from "react";
import { render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OperationCatalog } from "./OperationCatalog";
import { FAKE_CLIENT, anchorLink } from "./rpc-story.fixtures";

const CREATE = "Create";
function Harness({ hoist }: { hoist: boolean }) {
  const [actionsHost, setActionsHost] = useState<HTMLElement | null>(null);
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <div data-testid="shell-actions" ref={hoist ? setActionsHost : undefined} />
      <div data-testid="catalog-host">
        <OperationCatalog
          definition={{ key: "widgets", title: "Widgets", description: "Widgets." }}
          entities={["widget"]}
          surfaceKey="widgets"
          client={FAKE_CLIENT}
          renderLink={anchorLink}
          actionsContainer={actionsHost}
        />
      </div>
    </QueryClientProvider>
  );
}

describe("OperationCatalog action hoisting", () => {
  it("renders the action bar inside the catalog when no portal target is given", async () => {
    render(<Harness hoist={false} />);

    const catalog = screen.getByTestId("catalog-host");
    await waitFor(() =>
      expect(within(catalog).getByRole("button", { name: CREATE })).toBeInTheDocument(),
    );
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

});
