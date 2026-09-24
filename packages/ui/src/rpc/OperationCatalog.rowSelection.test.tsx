import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Component, useState, type ComponentProps, type ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ClickyRow } from "../data/Clicky";
import { OperationCatalog } from "./OperationCatalog";
import { RouterProvider } from "./RouterProvider";
import type { RenderLink } from "./EndpointList";
import type { OperationCatalogRowSelection } from "./operationCatalogRowSelection";
import { getClickyRowId } from "./rowNavigation";
import { schemesClient } from "./operationEntityPicker.fixtures";
import type { OperationsApiClient } from "./useOperations";

const renderLink: RenderLink = ({ to, children, key }) => (
  <a key={key} href={to}>
    {children}
  </a>
);

type Picked = { ids: string[]; rows: ClickyRow[] };

function Picker({
  client,
  mode,
  onPicked,
  catalogProps,
}: {
  client: OperationsApiClient;
  mode: OperationCatalogRowSelection["mode"];
  onPicked: (picked: Picked) => void;
  catalogProps?: Partial<ComponentProps<typeof OperationCatalog>>;
}) {
  const [ids, setIds] = useState<string[]>([]);
  return (
    <OperationCatalog
      definition={{ key: "schemes", title: "Schemes", description: "" }}
      entities={[]}
      surfaceKey="schemes"
      client={client}
      renderLink={renderLink}
      urlState={false}
      rowSelection={{
        mode,
        selectedRowIds: ids,
        onSelectionChange: (next, rows) => {
          setIds(next);
          onPicked({ ids: next, rows });
        },
      }}
      {...catalogProps}
    />
  );
}

function renderWithRouter(ui: ReactNode) {
  const navigate = vi.fn();
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider adapter={{ pathname: "/", renderLink, navigate }}>
        {ui}
      </RouterProvider>
    </QueryClientProvider>,
  );
  return navigate;
}

const checkbox = (id: string) =>
  screen.getByRole("checkbox", { name: `Select row ${id}` }) as HTMLInputElement;

describe("OperationCatalog rowSelection", () => {
  beforeEach(() => vi.clearAllMocks());

  it("single mode keeps at most one checked row", async () => {
    const client = schemesClient();
    const onPicked = vi.fn();
    renderWithRouter(<Picker client={client} mode="single" onPicked={onPicked} />);

    await screen.findByText("Acme Mining");
    fireEvent.click(checkbox("G0000011"));
    fireEvent.click(checkbox("G0000012"));

    expect([checkbox("G0000011").checked, checkbox("G0000012").checked]).toEqual([false, true]);
    const last = onPicked.mock.calls.at(-1)?.[0] as Picked;
    expect({ ids: last.ids, rowIds: last.rows.map(getClickyRowId) }).toEqual({
      ids: ["G0000012"],
      rowIds: ["G0000012"],
    });

    // No header checkbox can select several rows at once in single mode.
    expect(screen.queryByRole("checkbox", { name: "Select all visible rows" })).toBeNull();
  });

  it("multi mode keeps every checked row", async () => {
    const client = schemesClient();
    const onPicked = vi.fn();
    renderWithRouter(<Picker client={client} mode="multi" onPicked={onPicked} />);

    await screen.findByText("Acme Mining");
    fireEvent.click(checkbox("G0000011"));
    fireEvent.click(checkbox("G0000012"));

    expect(onPicked.mock.calls.at(-1)?.[0].ids).toEqual(["G0000011", "G0000012"]);
    expect(
      screen.getByRole("checkbox", { name: "Select all visible rows" }),
    ).toBeInTheDocument();
  });

  it("a row click toggles its checkbox instead of navigating to the detail page", async () => {
    const client = schemesClient();
    const navigate = renderWithRouter(
      <Picker client={client} mode="single" onPicked={vi.fn()} />,
    );

    fireEvent.click(await screen.findByText("Acme Mining"));

    expect(checkbox("G0000011").checked).toBe(true);
    expect(navigate).not.toHaveBeenCalled();
  });

  it("without rowSelection the same row click navigates (control for the test above)", async () => {
    const client = schemesClient();
    const navigate = renderWithRouter(
      <OperationCatalog
        definition={{ key: "schemes", title: "Schemes", description: "" }}
        entities={[]}
        surfaceKey="schemes"
        client={client}
        renderLink={renderLink}
        urlState={false}
      />,
    );

    fireEvent.click(await screen.findByText("Acme Mining"));

    expect(navigate).toHaveBeenCalledWith("/schemes/G0000011");
    expect(screen.queryByRole("checkbox", { name: "Select row G0000011" })).toBeNull();
  });

  it("hides the surface action bar while picking", async () => {
    const client = schemesClient();
    renderWithRouter(<Picker client={client} mode="multi" onPicked={vi.fn()} />);

    await screen.findByText("Acme Mining");

    expect(screen.queryByRole("button", { name: "Create" })).toBeNull();
  });

  it("marks unavailable rows and refuses to check them", async () => {
    const client = schemesClient();
    const onPicked = vi.fn();
    renderWithRouter(
      <OperationCatalog
        definition={{ key: "schemes", title: "Schemes", description: "" }}
        entities={[]}
        surfaceKey="schemes"
        client={client}
        renderLink={renderLink}
        urlState={false}
        rowSelection={{
          mode: "multi",
          selectedRowIds: [],
          onSelectionChange: onPicked,
          unavailableRows: {
            isUnavailable: (row) => getClickyRowId(row) === "G0000012",
            label: "Attached",
            columnLabel: "Context",
          },
        }}
      />,
    );

    fireEvent.click(await screen.findByText("Example Retail"));

    expect(screen.getByText("Attached")).toBeInTheDocument();
    expect(checkbox("G0000012").disabled).toBe(true);
    expect(onPicked).not.toHaveBeenCalled();
  });

  it("fails loudly when the picked surface has no list operation", async () => {
    const client: OperationsApiClient = {
      getOpenAPISpec: async () => ({
        openapi: "3.0.0",
        info: { title: "test", version: "1" },
        paths: {
          "/api/v1/schemes/{id}": {
            get: {
              operationId: "scheme_get",
              "x-clicky": { surface: "schemes", verb: "get", scope: "entity" },
              responses: {},
            },
          },
        },
      }),
      executeCommand: vi.fn(),
    };
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});

    try {
      renderWithRouter(
        <Boundary>
          <Picker client={client} mode="single" onPicked={vi.fn()} />
        </Boundary>,
      );
      expect(await screen.findByRole("alert")).toHaveTextContent(
        'rowSelection needs a list operation, but surface "schemes" has none',
      );
    } finally {
      consoleError.mockRestore();
    }
  });
});

class Boundary extends Component<{ children: ReactNode }, { error?: Error }> {
  override state: { error?: Error } = {};
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  override render() {
    return this.state.error ? (
      <div role="alert">{this.state.error.message}</div>
    ) : (
      this.props.children
    );
  }
}
