import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { CLASS_LOADERS } from "../fixtures/classes";
import { fakeJvmClient, type FakeJvmClient } from "../fixtures/fake-client";
import type { ExpressionPreset } from "../model/expressions";
import { expressionHistoryStorageKey } from "../ognl/use-expression-history";
import type { JvmStatus } from "../protocol/types";
import { ExpressionSurface, type ExpressionSurfaceProps, type ExpressionSurfaceState } from "./ExpressionSurface";
import { JvmProvider } from "./JvmProvider";

const GATE = "Allow running code in this JVM";
const RUNTIME = "@java.lang.Runtime@getRuntime()";

type Options = { status?: JvmStatus; initial?: ExpressionSurfaceState; client?: FakeJvmClient } & Partial<Omit<ExpressionSurfaceProps, "state" | "onStateChange">>;

function Harness({ client, initial, ...props }: { client: FakeJvmClient; initial: ExpressionSurfaceState } & Partial<ExpressionSurfaceProps>) {
  const [state, setState] = useState(initial);
  return (
    <JvmProvider client={client} scope="test">
      <ExpressionSurface state={state} onStateChange={setState} {...props} />
    </JvmProvider>
  );
}

function renderSurface({ status = { allowMutation: true }, initial = {}, client = fakeJvmClient({ status }), ...props }: Options = {}) {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } });
  render(
    <QueryClientProvider client={queryClient}>
      <Harness client={client} initial={initial} {...props} />
    </QueryClientProvider>,
  );
  return client;
}

async function allowAndRun() {
  fireEvent.click(await screen.findByRole("checkbox", { name: GATE }));
  fireEvent.click(screen.getByRole("button", { name: "Run" }));
}

afterEach(() => localStorage.clear());

describe("ExpressionSurface", () => {
  it("keeps Run disabled until the operator opts in, then evaluates the preset's OGNL and shows its graph", async () => {
    const client = renderSurface();
    fireEvent.click(screen.getByRole("button", { name: /^Runtime/ }));
    expect(screen.getByRole("textbox", { name: "OGNL expression" })).toHaveValue(RUNTIME);
    const run = screen.getByRole("button", { name: "Run" });
    expect(run).toBeDisabled();
    await allowAndRun();
    expect(await screen.findByText("@com.example.orders.model.Order")).toBeInTheDocument();
    expect(client.mutations).toEqual([{ method: "evaluateOgnl", request: { expression: RUNTIME } }]);
  });

  it("explains that the agent refuses mutations and never runs", async () => {
    const client = renderSurface({ status: { allowMutation: false }, initial: { expression: RUNTIME } });
    expect(await screen.findByText(/Runtime changes are disabled for this JVM/)).toBeInTheDocument();
    expect(screen.queryByRole("checkbox", { name: GATE })).toBeNull();
    expect(screen.getByRole("button", { name: "Run" })).toBeDisabled();
    expect(client.mutations).toEqual([]);
  });

  it("runs without a consent step when the host does not require it", async () => {
    const client = renderSurface({ requireConsent: false, initial: { expression: RUNTIME } });
    await waitFor(() => expect(screen.getByRole("button", { name: "Run" })).toBeEnabled());
    expect(screen.queryByRole("checkbox", { name: GATE })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    await waitFor(() => expect(client.mutations).toHaveLength(1));
  });

  it("keeps Run disabled and offers no gate when the host does not permit mutations", async () => {
    renderSurface({ canMutate: false, initial: { expression: RUNTIME } });
    await screen.findByRole("button", { name: "Run" });
    expect(screen.queryByRole("checkbox", { name: GATE })).toBeNull();
    expect(screen.getByRole("button", { name: "Run" })).toBeDisabled();
  });

  it("reports an evaluation error and does not record the expression in the history", async () => {
    renderSurface({ initial: { expression: "#root.throw" } });
    await allowAndRun();
    expect(await screen.findByText("Evaluation failed")).toBeInTheDocument();
    expect(screen.getAllByText(/source is null for getProperty/).length).toBeGreaterThan(0);
    expect(screen.queryByRole("region", { name: "History" })).toBeNull();
  });

  it("records a successful expression in the history, newest first and deduplicated", async () => {
    renderSurface({ initial: { expression: RUNTIME } });
    await allowAndRun();
    const history = await screen.findByRole("region", { name: "History" });
    expect(within(history).getAllByRole("button", { name: RUNTIME })).toHaveLength(1);
    fireEvent.click(screen.getByRole("button", { name: "Run" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Run" })).toBeEnabled());
    expect(within(screen.getByRole("region", { name: "History" })).getAllByRole("button", { name: RUNTIME })).toHaveLength(1);
  });

  it("persists the history under the host's key and restores it in a new session", async () => {
    renderSurface({ initial: { expression: RUNTIME }, historyKey: "agent-7" });
    await allowAndRun();
    await screen.findByRole("region", { name: "History" });
    expect(JSON.parse(localStorage.getItem(expressionHistoryStorageKey("agent-7", "ognl")) ?? "null")).toEqual([RUNTIME]);
  });

  it("restores a stored history without running anything", () => {
    localStorage.setItem(expressionHistoryStorageKey("agent-7", "ognl"), JSON.stringify(["#root.size()"]));
    const client = renderSurface({ historyKey: "agent-7" });
    expect(within(screen.getByRole("region", { name: "History" })).getByRole("button", { name: "#root.size()" })).toBeInTheDocument();
    expect(client.mutations).toEqual([]);
  });

  it("switches to Groovy with a clean editor, runs the script and shows stdout and elapsed time", async () => {
    const client = renderSurface({ initial: { expression: RUNTIME } });
    fireEvent.click(screen.getByRole("radio", { name: "Groovy" }));
    const editor = screen.getByRole("textbox", { name: "Groovy script" });
    expect(editor).toHaveValue("");
    fireEvent.change(editor, { target: { value: "println 'hi'" } });
    await allowAndRun();
    expect(await screen.findByRole("region", { name: "Standard output" })).toHaveTextContent("Inspecting order ORD-1042");
    expect(screen.getByText("18 ms")).toBeInTheDocument();
    expect(client.mutations).toEqual([{ method: "evaluateGroovy", request: { source: "println 'hi'" } }]);
  });

  it("evaluates in the class loader the operator picks", async () => {
    const client = renderSurface({ initial: { expression: RUNTIME } });
    fireEvent.change(await screen.findByRole("combobox", { name: "Class loader" }), { target: { value: CLASS_LOADERS[0]!.hash } });
    await allowAndRun();
    await waitFor(() => expect(client.mutations).toEqual([{ method: "evaluateOgnl", request: { expression: RUNTIME, loader: CLASS_LOADERS[0]!.hash } }]));
  });

  it("offers host presets for the current language", () => {
    const presets: ExpressionPreset[] = [{ label: "Pool stats", expression: "#pool.stats()", language: "ognl" }];
    renderSurface({ presets });
    expect(screen.getByRole("button", { name: /^Pool stats/ })).toBeInTheDocument();
  });

  it("drills into a node by evaluating its path against the expression that produced the result", async () => {
    const base = fakeJvmClient();
    const requests: string[] = [];
    const client: FakeJvmClient = {
      ...base,
      evaluateOgnl: async (request) => {
        requests.push(request.expression);
        return { graph: { id: "r", label: "result", children: [{ id: "r.id", label: "id", path: ".id", value: "ORD-1042" }] } };
      },
    };
    renderSurface({ client, initial: { expression: RUNTIME } });
    await allowAndRun();
    fireEvent.click(await screen.findByRole("button", { name: "id" }));
    await waitFor(() => expect(requests).toEqual([RUNTIME, `(${RUNTIME}).id`]));
    expect(screen.getByRole("textbox", { name: "OGNL expression" })).toHaveValue(`(${RUNTIME}).id`);
  });
});
