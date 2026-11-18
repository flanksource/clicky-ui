import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { fakeJvmClient, type FakeJvmClient } from "../fixtures/fake-client";
import type { JvmDiagnosticsClient } from "../protocol/client";
import type { JvmStatus } from "../protocol/types";
import { JvmProvider } from "./JvmProvider";
import { LoggingSurface, type LoggingSurfaceProps, type LoggingSurfaceState } from "./LoggingSurface";

type Options = { status?: JvmStatus; initial?: LoggingSurfaceState; client?: (client: FakeJvmClient) => JvmDiagnosticsClient } & Partial<LoggingSurfaceProps>;

function Harness({ client, initial, ...props }: { client: JvmDiagnosticsClient; initial: LoggingSurfaceState } & Partial<LoggingSurfaceProps>) {
  const [state, setState] = useState(initial);
  return (
    <JvmProvider client={client} scope="test">
      <LoggingSurface state={state} onStateChange={setState} {...props} />
    </JvmProvider>
  );
}

function renderSurface({ status = { allowMutation: true }, initial = {}, client: override, ...props }: Options = {}) {
  const client = fakeJvmClient({ status });
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={queryClient}>
      <Harness client={override ? override(client) : client} initial={initial} {...props} />
    </QueryClientProvider>,
  );
  return client;
}

const rowOf = (name: string) => screen.getByRole("button", { name: `Edit level of ${name}` }).closest("tr") as HTMLElement;

async function editLevel(logger: string, level: string) {
  const edit = await screen.findByRole("button", { name: `Edit level of ${logger}` });
  await waitFor(() => expect(edit).toBeEnabled());
  fireEvent.click(edit);
  fireEvent.change(await screen.findByRole("combobox"), { target: { value: level } });
  fireEvent.click(screen.getByRole("button", { name: "Set level" }));
}

describe("LoggingSurface", () => {
  it("lists the JVM's loggers with effective levels", async () => {
    renderSurface();
    await screen.findByRole("button", { name: "Edit level of com.example.orders.OrderService" });
    expect(within(rowOf("com.example.orders.OrderService")).getByText("(inherit) → FINE")).toBeInTheDocument();
    expect(screen.getByText("7 of 7 loggers")).toBeInTheDocument();
  });

  it("applies and reports the lifted filter", async () => {
    renderSurface({ initial: { q: "catalina" } });
    expect(await screen.findByText("2 of 7 loggers")).toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox", { name: "Filter loggers" }), { target: { value: "payments" } });
    expect(await screen.findByText("1 of 7 loggers")).toBeInTheDocument();
  });

  it("requires the operator's consent, then sets the level and shows it", async () => {
    const client = renderSurface();
    expect(await screen.findByRole("button", { name: "Edit level of com.example" })).toBeDisabled();
    fireEvent.click(await screen.findByRole("checkbox", { name: "Allow logger changes" }));
    await editLevel("com.example", "WARNING");
    await waitFor(() => expect(client.mutations).toEqual([{ method: "setLoggerLevel", request: { name: "com.example", level: "WARNING" } }]));
    await waitFor(() => expect(within(rowOf("com.example")).getByText("WARNING")).toBeInTheDocument());
  });

  it("sends null when the logger is set to inherit", async () => {
    const client = renderSurface({ requireConsent: false });
    await editLevel("com.example.orders", "__inherit__");
    await waitFor(() => expect(client.mutations).toEqual([{ method: "setLoggerLevel", request: { name: "com.example.orders", level: null } }]));
  });

  it("edits the root logger by its raw name", async () => {
    const client = renderSurface({ requireConsent: false });
    await editLevel("<root>", "SEVERE");
    await waitFor(() => expect(client.mutations).toEqual([{ method: "setLoggerLevel", request: { name: "", level: "SEVERE" } }]));
  });

  it("keeps the dialog open with the agent's error when the write fails", async () => {
    renderSurface({
      requireConsent: false,
      client: (client) => ({
        ...client,
        setLoggerLevel: async () => {
          throw new Error("Unknown logger com.example");
        },
      }),
    });
    await editLevel("com.example", "FINE");
    expect(await screen.findByRole("alert")).toHaveTextContent("Unknown logger com.example");
  });

  it("explains that the agent refuses mutations and keeps Edit disabled", async () => {
    renderSurface({ status: { allowMutation: false } });
    expect(await screen.findByText(/Runtime changes are disabled for this JVM/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit level of com.example" })).toBeDisabled();
  });

  it("keeps Edit disabled when the host does not permit mutations", async () => {
    renderSurface({ canMutate: false, requireConsent: false });
    expect(await screen.findByRole("button", { name: "Edit level of com.example" })).toBeDisabled();
    expect(screen.queryByRole("checkbox", { name: "Allow logger changes" })).toBeNull();
  });

  it("surfaces a failed inventory read", async () => {
    renderSurface({
      client: (client) => ({
        ...client,
        loggers: async () => {
          throw new Error("agent unreachable");
        },
      }),
    });
    expect(await screen.findByText("Logger inventory unavailable")).toBeInTheDocument();
  });
});
