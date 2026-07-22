// End-to-end guard for remote pagination through the real rpc stack: the
// shared story fixtures declare limit/offset roles, OperationCatalog turns them
// into a DataTable footer, and advancing a page re-executes the operation
// against the backend rather than slicing rows in the browser.

import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OperationCatalog } from "./OperationCatalog";
import { FAKE_CLIENT, anchorLink } from "./rpc-story.fixtures";
import { WIDGETS_FIXTURE } from "./rpc-story-fixtures/widgets.fixture";
import type { OperationsApiClient } from "./useOperations";

function renderWidgets() {
  const executeSpy = vi.fn(FAKE_CLIENT.executeCommand);
  const client: OperationsApiClient = { ...FAKE_CLIENT, executeCommand: executeSpy };
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });

  render(
    <QueryClientProvider client={queryClient}>
      <OperationCatalog
        definition={{ key: "widgets", title: "Widgets", description: "Remote-paged widgets." }}
        entities={["widget"]}
        surfaceKey="widgets"
        client={client}
        renderLink={anchorLink}
      />
    </QueryClientProvider>,
  );

  return { executeSpy };
}

/** Query params of the most recent list call. */
function lastListParams(spy: ReturnType<typeof vi.fn>): Record<string, string> | undefined {
  const listCalls = spy.mock.calls.filter((call) => call[0] === "/api/v1/widgets");
  return listCalls[listCalls.length - 1]?.[2] as Record<string, string> | undefined;
}

describe("OperationCatalog — remote pagination", () => {
  it("renders a pagination footer reporting the backend's total", async () => {
    renderWidgets();

    // "Page 1 of N" only appears when response.pagination.total is present.
    const total = WIDGETS_FIXTURE.listRows.length;
    const expectedPages = Math.ceil(total / 25);
    await waitFor(() =>
      expect(screen.getByText(`Page 1 of ${expectedPages}`)).toBeInTheDocument(),
    );
  });

  it("renders only one page of rows, not the whole row set", async () => {
    renderWidgets();

    await waitFor(() => expect(screen.getByRole("table")).toBeInTheDocument());
    const bodyRows = within(screen.getByRole("table")).getAllByRole("row");

    // 25 data rows + 1 header row; the fixture holds far more than that.
    expect(bodyRows.length).toBeLessThanOrEqual(26);
    expect(WIDGETS_FIXTURE.listRows.length).toBeGreaterThan(26);
  });

  it("re-executes the operation with a new offset when the page advances", async () => {
    const { executeSpy } = renderWidgets();

    await waitFor(() => expect(screen.getByText(/Page 1 of/)).toBeInTheDocument());
    const firstPageParams = lastListParams(executeSpy);
    expect(firstPageParams?.offset ?? "0").toBe("0");

    fireEvent.click(screen.getByRole("button", { name: "Next page" }));

    // The offset moving is what proves paging is remote: a client-side slice
    // would never touch the backend again.
    await waitFor(() => expect(lastListParams(executeSpy)?.offset).toBe("25"));
    await waitFor(() => expect(screen.getByText(/Page 2 of/)).toBeInTheDocument());
  });
});
