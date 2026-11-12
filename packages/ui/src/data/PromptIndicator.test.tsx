import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PromptSnapshot } from "../hooks/use-prompts";
import { orderPrompts } from "./PromptBanner.model";
import { PromptIndicator } from "./PromptIndicator";

const schema = { type: "object" as const, properties: { region: { type: "string" as const, enum: ["eu-west-1", "us-east-1"] } } };

const pendingRegion: PromptSnapshot = { id: "p-region", kind: "form", title: "Choose deployment region", state: "pending", schema };
const pendingTarget: PromptSnapshot = { id: "p-target", kind: "form", title: "Pick the purge target", state: "pending", schema };
const answered: PromptSnapshot = { id: "p-done", title: "Previous region", state: "answered", value: { region: "us-east-1" }, schema };
const cancelled: PromptSnapshot = { id: "p-cancelled", title: "Abandoned region", state: "cancelled", cancelled: true, schema };

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

/** Each EventSource emits `frames` in order, one per tick, so a test can add a prompt mid-stream. */
function stubPromptStream(...frames: PromptSnapshot[][]) {
  class FakeEventSource {
    private listeners: Record<string, ((event: MessageEvent) => void)[]> = {};
    constructor() {
      frames.forEach((prompts, i) => setTimeout(() => this.emit(prompts), i * 10));
    }
    addEventListener(type: string, callback: (event: MessageEvent) => void) {
      (this.listeners[type] ??= []).push(callback);
    }
    close() {}
    private emit(prompts: PromptSnapshot[]) {
      for (const callback of this.listeners.prompts ?? []) callback(new MessageEvent("prompts", { data: JSON.stringify(prompts) }));
    }
  }
  vi.stubGlobal("EventSource", FakeEventSource);
}

const indicator = () => screen.getByRole("button", { name: /pending|Prompts/ });
const panel = () => screen.getByRole("dialog", { name: "Prompts" });

describe("PromptIndicator", () => {
  it("counts the pending prompts in amber, pulsing", async () => {
    stubPromptStream([pendingRegion, pendingTarget, answered]);
    render(<PromptIndicator basePath="/api/todos" />);
    const button = await screen.findByRole("button", { name: "2 pending" });
    expect(button.querySelector("[data-prompt-pulse]")).not.toBeNull();
    expect(button.className).toContain("text-amber-600");
  });

  it("reads a muted Prompts with nothing pending", async () => {
    stubPromptStream([answered]);
    render(<PromptIndicator basePath="/api/todos" />);
    await waitFor(() => expect(indicator()).toHaveAccessibleName("Prompts"));
    expect(indicator().className).toContain("text-muted-foreground");
    expect(indicator().querySelector("[data-prompt-pulse]")).toBeNull();
  });

  it("opens a panel listing pending prompts first, then answered and closed ones", async () => {
    stubPromptStream([answered, cancelled, pendingRegion]);
    render(<PromptIndicator basePath="/api/todos" />);
    fireEvent.click(await screen.findByRole("button", { name: "1 pending" }));
    const titles = within(panel()).getAllByTestId("prompt-list-title").map((title) => title.textContent);
    expect(titles).toEqual([pendingRegion.title, answered.title, cancelled.title]);
  });

  it("opens the answer dialog from a pending prompt in the panel and closes the panel", async () => {
    stubPromptStream([pendingRegion, answered]);
    render(<PromptIndicator basePath="/api/todos" />);
    fireEvent.click(await screen.findByRole("button", { name: "1 pending" }));
    expect(within(panel()).queryByRole("button", { name: new RegExp(answered.title) })).toBeNull();
    fireEvent.click(within(panel()).getByRole("button", { name: new RegExp(pendingRegion.title) }));
    expect(await screen.findByRole("dialog", { name: pendingRegion.title })).toBeInTheDocument();
    expect(screen.queryByRole("dialog", { name: "Prompts" })).toBeNull();
  });

  it("with autoOpen, opens each newly pending prompt's dialog once", async () => {
    stubPromptStream([pendingRegion], [pendingRegion, pendingTarget]);
    render(<PromptIndicator basePath="/api/todos" autoOpen />);
    fireEvent.keyDown(await screen.findByRole("dialog", { name: pendingRegion.title }), { key: "Escape" });
    fireEvent.keyDown(await screen.findByRole("dialog", { name: pendingTarget.title }), { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
    await new Promise((resolve) => setTimeout(resolve, 30));
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(indicator()).toHaveAccessibleName("2 pending");
  });

  it("closes the open answer dialog when the prompt API moves to another base path", async () => {
    stubPromptStream([pendingRegion]);
    const { rerender } = render(<PromptIndicator basePath="/api/todos" />);
    fireEvent.click(await screen.findByRole("button", { name: "1 pending" }));
    fireEvent.click(within(panel()).getByRole("button", { name: new RegExp(pendingRegion.title) }));
    expect(await screen.findByRole("dialog", { name: pendingRegion.title })).toBeInTheDocument();

    rerender(<PromptIndicator basePath="/api/runs/r2" />);

    expect(screen.queryByRole("dialog", { name: pendingRegion.title })).toBeNull();
  });

  it("keeps the next prompt's dialog open when an earlier, already closed prompt's answer lands", async () => {
    let finish: (value: { ok: boolean; text: () => Promise<string> }) => void = () => {};
    vi.stubGlobal("fetch", vi.fn(() => new Promise((resolve) => { finish = resolve; })));
    stubPromptStream([pendingRegion, pendingTarget]);
    render(<PromptIndicator basePath="/api/todos" autoOpen />);

    const first = await screen.findByRole("dialog", { name: pendingRegion.title });
    fireEvent.click(within(first).getByText("Submit"));
    fireEvent.keyDown(first, { key: "Escape" });
    expect(await screen.findByRole("dialog", { name: pendingTarget.title })).toBeInTheDocument();

    finish({ ok: true, text: async () => "" });
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(screen.getByRole("dialog", { name: pendingTarget.title })).toBeInTheDocument();
  });

  it("leaves the dialog closed until asked without autoOpen", async () => {
    stubPromptStream([pendingRegion]);
    render(<PromptIndicator basePath="/api/todos" />);
    await screen.findByRole("button", { name: "1 pending" });
    expect(screen.queryByRole("dialog")).toBeNull();
  });
});

describe("orderPrompts", () => {
  it("puts pending prompts first, then answered, then closed, keeping each group's order", () => {
    expect(orderPrompts([cancelled, answered, pendingRegion, pendingTarget]).map((p) => p.id)).toEqual([
      pendingRegion.id, pendingTarget.id, answered.id, cancelled.id,
    ]);
  });
});
