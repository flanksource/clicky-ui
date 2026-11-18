import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { JsonSchemaForm } from "./JsonSchemaForm";
import type { FieldOption, JsonSchemaObject, LookupFetcher } from "./json-schema-form-types";

const API_BASE = "/api/v1";
const MAIN = "connection://pg/main";

// The create form as the service serves it, cut to plain inputs: the url source widgets are covered by CreateConnectionDialog.
const CREATE_SCHEMA: JsonSchemaObject = {
  type: "object",
  required: ["name", "type", "url"],
  properties: {
    name: { type: "string", title: "Name" },
    type: { type: "string", title: "Type", enum: ["postgres", "redis"] },
    url: { type: "string", title: "URL" },
  },
};

const OPTIONS: FieldOption[] = [
  { value: MAIN, label: "main", icon: "postgres", description: "db.internal:5432", group: "Postgres", badges: [{ label: "svc" }] },
  { value: "connection://cache/sessions", label: "sessions", icon: "redis", group: "Redis" },
];

function schemaFor(types?: string[]): JsonSchemaObject {
  return {
    type: "object",
    properties: {
      db: {
        type: "string",
        title: "Database",
        format: "connection",
        ...(types ? { "x-connection-types": types } : {}),
        "x-clicky-lookup": { url: "/api/v1/lookup/t0/db", filter: "connection" },
      },
    },
  };
}

const lookupFetcher: LookupFetcher = async () => OPTIONS;

function Harness({ schema, connectionApiBase, onChange }: { schema: JsonSchemaObject; connectionApiBase?: string; onChange: (v: Record<string, unknown>) => void }) {
  const [value, setValue] = useState<Record<string, unknown>>({});
  return (
    <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
      <JsonSchemaForm
        schema={schema}
        value={value}
        onChange={(next) => {
          setValue(next);
          onChange(next);
        }}
        lookupFetcher={lookupFetcher}
        showPreferencesMenu={false}
        {...(connectionApiBase ? { connectionApiBase } : {})}
      />
    </QueryClientProvider>
  );
}

afterEach(() => vi.unstubAllGlobals());

describe("a format: connection lookup field", () => {
  it("renders the connection picker: rows grouped by the server's type, committing the connection:// ref", async () => {
    const onChange = vi.fn();
    render(<Harness schema={schemaFor()} onChange={onChange} />);
    fireEvent.focus(screen.getByRole("combobox"));

    const main = await screen.findByRole("option", { name: /main/ });
    expect(within(main).getByText("db.internal:5432")).toBeInTheDocument();
    expect(within(main).getByText("svc")).toBeInTheDocument();
    const headers = Array.from(screen.getByRole("listbox").querySelectorAll('div[role="presentation"]')).map((node) => node.textContent);
    expect(headers).toEqual(["Postgres", "Redis"]);

    fireEvent.mouseDown(main);
    expect(onChange).toHaveBeenLastCalledWith({ db: MAIN });
  });

  it("offers no create footer unless the form was given a connectionApiBase", async () => {
    render(<Harness schema={schemaFor(["postgres"])} onChange={vi.fn()} />);
    fireEvent.focus(screen.getByRole("combobox"));
    await screen.findByRole("option", { name: /main/ });

    expect(screen.queryByRole("button", { name: /New .*connection/ })).toBeNull();
  });

  it("creates through the connections service from the typed footer and selects the new ref", async () => {
    const posted: unknown[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        const key = `${(init?.method ?? "GET").toUpperCase()} ${url}`;
        const ok = (body: unknown, type = "application/json") =>
          new Response(JSON.stringify(body), { status: 200, headers: { "Content-Type": type } });
        if (key === `GET ${API_BASE}/connection`) return ok(CREATE_SCHEMA, "application/schema+json");
        if (key === `POST ${API_BASE}/connection`) {
          posted.push(JSON.parse(String(init?.body)));
          return ok({ id: "n1", name: "reports", namespace: "analytics", type: "postgres" });
        }
        if (url.startsWith(`${API_BASE}/connections/contexts`)) return ok({ currentContext: "kind-dev", contexts: [] });
        if (url.startsWith(`${API_BASE}/connections/namespaces`)) return ok(["analytics"]);
        if (url.startsWith(`${API_BASE}/connections/secrets`)) return ok([]);
        throw new Error(`unexpected request ${key}`);
      }),
    );
    const onChange = vi.fn();
    render(<Harness schema={schemaFor(["postgres"])} connectionApiBase={API_BASE} onChange={onChange} />);
    fireEvent.focus(screen.getByRole("combobox"));
    await screen.findByRole("option", { name: /main/ });

    fireEvent.click(screen.getByRole("button", { name: "New Postgres connection…" }));

    const dialog = await screen.findByRole("dialog", { name: /New Postgres connection/ });
    const name = await within(dialog).findByLabelText(/^Name\b/);
    fireEvent.change(name, { target: { value: "reports" } });
    fireEvent.change(within(dialog).getByLabelText(/^URL\b/), { target: { value: "postgres://db:5432/app" } });
    fireEvent.click(within(dialog).getByRole("button", { name: "Create and select" }));

    await waitFor(() => expect(onChange).toHaveBeenLastCalledWith({ db: "connection://analytics/reports" }));
    expect(posted).toHaveLength(1);
    expect(posted[0]).toMatchObject({ name: "reports", type: "postgres", url: "postgres://db:5432/app" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });
});
