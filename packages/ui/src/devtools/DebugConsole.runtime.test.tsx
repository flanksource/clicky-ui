import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { registerDebugRuntime } from "../data/debugRuntime";
import { DebugConsole } from "./DebugConsole";
import { DebugStore } from "./debugStore";
import { DebugClient } from "./debugClient";

const dispose: Array<() => void> = [];
const state = { getSnapshot: () => ({ status: "ready", error: null }), subscribe: () => () => {} };
afterEach(() => { for (const release of dispose.splice(0)) release(); });

it("shows independently registered Facet and Clicky runtimes and removes disposed frames", () => {
  dispose.push(registerDebugRuntime({ id: "facet", label: "Report.tsx", state, content: <p>Facet requests</p>, clear: vi.fn() }));
  const release = registerDebugRuntime({ id: "clicky", label: "Dashboard.tsx", state, content: <p>Clicky requests</p>, clear: vi.fn() });
  dispose.push(release);
  render(<DebugConsole state={new DebugStore().getSnapshot()} tab="runtimes" />);
  expect(screen.getByText("Facet requests")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("tab", { name: /Dashboard.tsx/ }));
  expect(screen.getByText("Clicky requests")).toBeInTheDocument();
  act(release);
  expect(screen.getByText("Facet requests")).toBeInTheDocument();
  expect(screen.queryByText("Clicky requests")).not.toBeInTheDocument();
});

it("clears runtime diagnostics with the other console captures", () => {
  const clear = vi.fn();
  dispose.push(registerDebugRuntime({ id: "facet", label: "Report.tsx", state, content: <p>Runtime requests</p>, clear }));
  const client = new DebugClient();
  vi.spyOn(client, "clear").mockResolvedValue();
  render(<DebugConsole state={new DebugStore().getSnapshot()} client={client} tab="runtimes" />);
  fireEvent.click(screen.getByRole("button", { name: "Clear captures" }));
  expect(clear).toHaveBeenCalledOnce();
});
