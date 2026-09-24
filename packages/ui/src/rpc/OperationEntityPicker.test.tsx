import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClickyRow } from "../data/Clicky";
import {
  OperationEntityPicker,
  type OperationEntityPickerProps,
} from "./OperationEntityPicker";
import { lockedScopeEntries } from "./OperationEntityPicker.model";
import {
  SCHEMES_LOOKUP,
  SCHEMES_PATH,
  executeSchemes,
  lookupSchemes,
  schemesClient as fixtureClient,
} from "./operationEntityPicker.fixtures";

function schemesClient() {
  const executeCommand = vi.fn(executeSchemes);
  const lookupFilters = vi.fn(lookupSchemes);
  return { client: fixtureClient({ executeCommand, lookupFilters }), executeCommand, lookupFilters };
}
import { getClickyRowId } from "./rowNavigation";
import type { OpenAPIParameter } from "./types";

type HostProps = Omit<OperationEntityPickerProps, "open" | "onClose" | "title">;

// Host is the picker field a consumer builds: a Browse… button that opens the
// dialog and closes it when the picker asks.
function Host(props: HostProps) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        Browse…
      </button>
      <OperationEntityPicker
        {...props}
        open={open}
        onClose={() => setOpen(false)}
        title="Choose a scheme"
      />
    </>
  );
}

function renderHost(props: HostProps) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <Host {...props} />
    </QueryClientProvider>,
  );
}

async function openDialog() {
  fireEvent.click(screen.getByRole("button", { name: "Browse…" }));
  const dialog = await screen.findByRole("dialog", { name: "Choose a scheme" });
  await within(dialog).findByText("Acme Mining");
  return dialog;
}

const checkbox = (id: string) =>
  screen.getByRole("checkbox", { name: `Select row ${id}` }) as HTMLInputElement;

describe("OperationEntityPicker", () => {
  beforeEach(() => vi.clearAllMocks());

  it("enables Select once a row is checked, then hands back the id and row and closes", async () => {
    const { client } = schemesClient();
    const onSelect = vi.fn();
    renderHost({ client, surfaceKey: "schemes", onSelect });

    await openDialog();
    const select = screen.getByRole("button", { name: "Select" });
    expect(select).toBeDisabled();

    fireEvent.click(screen.getByText("Example Retail"));
    expect(screen.getByText("1 selected")).toBeInTheDocument();
    fireEvent.click(select);

    await waitFor(() => expect(onSelect).toHaveBeenCalledTimes(1));
    const [ids, rows] = onSelect.mock.calls[0] as [string[], ClickyRow[]];
    expect({ ids, rowIds: rows.map(getClickyRowId) }).toEqual({
      ids: ["G0000012"],
      rowIds: ["G0000012"],
    });
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Choose a scheme" })).toBeNull(),
    );
  });

  it("sends locked values on list and lookup requests and shows them only as a scope line", async () => {
    const { client, executeCommand, lookupFilters } = schemesClient();
    renderHost({
      client,
      surfaceKey: "schemes",
      onSelect: vi.fn(),
      lockedValues: { product: "gl-guid" },
    });

    const dialog = await openDialog();

    expect(executeCommand).toHaveBeenCalledWith(
      SCHEMES_PATH,
      "get",
      { product: "gl-guid" },
      { Accept: "application/json+clicky" },
    );
    expect(lookupFilters).toHaveBeenCalledWith(
      SCHEMES_PATH,
      "get",
      { product: "gl-guid" },
      { Accept: "application/json+clicky" },
    );
    expect(
      await within(dialog).findByText("Scoped to: Product = Group Life"),
    ).toBeInTheDocument();
    // Status stays an editable filter; the locked product never becomes one.
    expect(within(dialog).getByLabelText("Status")).toBeInTheDocument();
    expect(within(dialog).queryByLabelText("Product")).toBeNull();
  });

  it("pre-checks `selected` on open and resets to it every time the dialog reopens", async () => {
    const { client } = schemesClient();
    renderHost({
      client,
      surfaceKey: "schemes",
      mode: "multi",
      selected: ["G0000011"],
      onSelect: vi.fn(),
    });

    await openDialog();
    expect([checkbox("G0000011").checked, checkbox("G0000012").checked]).toEqual([true, false]);

    fireEvent.click(checkbox("G0000012"));
    expect(screen.getByText("2 selected")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    await waitFor(() =>
      expect(screen.queryByRole("dialog", { name: "Choose a scheme" })).toBeNull(),
    );

    await openDialog();
    expect([checkbox("G0000011").checked, checkbox("G0000012").checked]).toEqual([true, false]);
  });

  it("hands the catalog a flex slot so the table scrolls inside the non-expanded dialog", async () => {
    const { client } = schemesClient();
    renderHost({ client, surfaceKey: "schemes", onSelect: vi.fn() });

    const dialog = await openDialog();
    const catalog = dialog.querySelector('[data-slot="operation-catalog"]');

    // The non-expanded Modal has only a max-height, so an h-full catalog under
    // a block wrapper would grow past the clipped body, hiding scroll and pager.
    expect(catalog?.parentElement).toHaveClass("flex", "min-h-0", "flex-1", "flex-col");
    expect(catalog).toHaveClass("flex-1");
  });

  it("keeps the dialog open and shows the error when onSelect rejects", async () => {
    const { client } = schemesClient();
    renderHost({
      client,
      surfaceKey: "schemes",
      onSelect: async () => {
        throw new Error("scheme is archived");
      },
    });

    await openDialog();
    fireEvent.click(screen.getByText("Acme Mining"));
    fireEvent.click(screen.getByRole("button", { name: "Select" }));

    expect(await screen.findByText(/scheme is archived/)).toBeInTheDocument();
    expect(screen.getByRole("dialog", { name: "Choose a scheme" })).toBeInTheDocument();
  });
});

describe("lockedScopeEntries", () => {
  const parameters: OpenAPIParameter[] = [
    { name: "product", in: "query" },
    { name: "client_type", in: "query" },
    { name: "region", in: "query" },
  ];

  it("labels each locked value from lockedLabels, then the lookup, then the raw key", () => {
    expect(
      lockedScopeEntries({
        lockedValues: { product: "gl-guid", client_type: "13", region: "SZ" },
        lockedLabels: { client_type: "Type" },
        parameters,
        lookup: SCHEMES_LOOKUP,
      }),
    ).toEqual([
      { key: "product", label: "Product", value: "Group Life" },
      { key: "client_type", label: "Type", value: "13" },
      { key: "region", label: "region", value: "SZ" },
    ]);
  });
});
