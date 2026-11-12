import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { connectionSchemaFixture } from "../test/connections.test-utils";
import { CreateConnectionDialog, type CreateConnectionDialogProps } from "./CreateConnectionDialog";

const API_BASE = "/api/v1";
const DRAFT = { name: "reports", namespace: "analytics", url: "postgres://db.internal:5432/app" };
const CREATED = { id: "c-1", ...DRAFT, type: "postgres" };

function json(body: unknown, contentType = "application/json"): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": contentType } });
}

let requests: string[] = [];
let posted: unknown;

// The commons-db connections service, answered at the network boundary.
function mockService(created: unknown = CREATED) {
  requests = [];
  posted = undefined;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const key = `${(init?.method ?? "GET").toUpperCase()} ${url}`;
      requests.push(key);
      if (key === `GET ${API_BASE}/connection`) return json(connectionSchemaFixture, "application/schema+json");
      if (key === `POST ${API_BASE}/connection`) {
        posted = JSON.parse(String(init?.body));
        return json(created);
      }
      if (url.startsWith(`${API_BASE}/connections/contexts`)) return json({ currentContext: "kind-dev", contexts: ["kind-dev"] });
      if (url.startsWith(`${API_BASE}/connections/namespaces`)) return json(["analytics", "default"]);
      if (url.startsWith(`${API_BASE}/connections/secrets`)) return json([]);
      throw new Error(`unexpected request ${key}`);
    }),
  );
}

function renderDialog(props: Partial<CreateConnectionDialogProps> = {}) {
  const onCreated = vi.fn();
  const onClose = vi.fn();
  render(
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <CreateConnectionDialog
        apiBase={API_BASE}
        type="postgres"
        initialValue={DRAFT}
        onCreated={onCreated}
        onClose={onClose}
        {...props}
      />
    </QueryClientProvider>,
  );
  return { onCreated, onClose };
}

beforeEach(() => mockService());
afterEach(() => vi.unstubAllGlobals());

describe("CreateConnectionDialog", () => {
  it("posts the typed draft to the connections service and reports the created connection:// ref", async () => {
    const { onCreated } = renderDialog();

    const dialog = await screen.findByRole("dialog", { name: /New Postgres connection/ });
    fireEvent.click(await within(dialog).findByRole("button", { name: "Create and select" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledTimes(1));
    expect(onCreated).toHaveBeenCalledWith("connection://analytics/reports");
    expect(posted).toMatchObject({ ...DRAFT, type: "postgres" });
    expect(requests).toContain(`POST ${API_BASE}/connection`);
  });

  it("names a connection without a namespace by its bare ref", async () => {
    mockService({ id: "c-2", name: "scratch", type: "postgres" });
    const { onCreated } = renderDialog({ initialValue: { name: "scratch", url: DRAFT.url } });

    fireEvent.click(await screen.findByRole("button", { name: "Create and select" }));

    await waitFor(() => expect(onCreated).toHaveBeenCalledWith("connection://scratch"));
  });

  it("fixes the type: the type picker is not offered", async () => {
    renderDialog();
    const dialog = await screen.findByRole("dialog", { name: /New Postgres connection/ });
    await within(dialog).findByRole("button", { name: "Create and select" });

    expect(within(dialog).queryByText("Type")).toBeNull();
  });

  it("puts the Kubernetes context in the title instead of the form", async () => {
    renderDialog();

    const dialog = await screen.findByRole("dialog", { name: /New Postgres connection/ });

    expect(await within(dialog).findByText("kind-dev")).toBeInTheDocument();
  });

  it("refuses to create a name and namespace the picker already lists", async () => {
    const { onCreated } = renderDialog({ existing: ["connection://analytics/reports"] });

    const dialog = await screen.findByRole("dialog", { name: /New Postgres connection/ });
    const create = await within(dialog).findByRole("button", { name: "Create and select" });

    expect(within(dialog).getByText(/“reports” already exists in analytics/)).toBeInTheDocument();
    expect(create).toBeDisabled();
    fireEvent.click(create);
    expect(onCreated).not.toHaveBeenCalled();
    expect(requests).not.toContain(`POST ${API_BASE}/connection`);
  });

  it("fails loudly when the service answers without a connection to select", async () => {
    mockService({ ok: true });
    const { onCreated } = renderDialog();

    fireEvent.click(await screen.findByRole("button", { name: "Create and select" }));

    expect(await screen.findByText(/did not return the created connection/)).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
  });
});
