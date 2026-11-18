import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { SpecRuntimeFamily } from "../../data/runtime/runtime-mode";
import { CommentAgentPicker, type CommentAgentPickerProps } from "./CommentAgentPicker";
import type { CommentAgent, CommentAgentSettings, GavelAgentSession } from "./gavel-delivery";
import type { GavelAgents } from "./useGavelAgents";

afterEach(cleanup);

const project = { kind: "project" } as const;
const layers: CommentAgentSettings["settings"]["layers"] = [
  { kind: "user", file: ".gavel.yaml", location: "/home/example/.gavel.yaml", config: {} },
  { kind: "project", location: "db", config: {} },
];
const settings: CommentAgentSettings["settings"] = { positions: [{ kind: "project", dir: "/work/site", files: [], db: true }], layers, provenance: {} };

/** A project that has its own .gavel.yaml: gavel takes saves in that file, never the database layer. */
const fileLayers: CommentAgentSettings["settings"]["layers"] = [
  { kind: "user", file: ".gavel.yaml", location: "/home/example/.gavel.yaml", config: {} },
  { kind: "project", file: ".gavel.yaml", location: "/work/site/.gavel.yaml", config: {} },
];
const fileSettings: CommentAgentSettings["settings"] = { positions: [{ kind: "project", dir: "/work/site", files: [".gavel.yaml"], db: false }], layers: fileLayers, provenance: {} };
const projectFile = { kind: "project", file: ".gavel.yaml" } as const;

type AgentsOptions = { agent?: CommentAgent; provenance?: CommentAgentSettings["agent"]["provenance"]; ready?: boolean; error?: string | null; fileBacked?: boolean; session?: string } & Partial<Pick<GavelAgents, "save" | "setEnabled" | "setEdits">>;

function fakeAgents(options: AgentsOptions = {}): GavelAgents {
  const agent = options.agent ?? {};
  return {
    agent: { agent, provenance: options.provenance ?? {}, found: options.agent !== undefined },
    settings: options.fileBacked ? fileSettings : settings,
    session: options.session,
    ownLayer: options.fileBacked ? projectFile : project,
    enabled: agent.enabled === true,
    edits: agent.edits ?? "direct",
    ready: options.ready ?? true,
    error: options.error ?? null,
    save: options.save ?? vi.fn(async () => ({ settings: options.fileBacked ? fileSettings : settings, agent: { agent, provenance: {}, found: true } })),
    setEnabled: options.setEnabled ?? vi.fn(async () => {}),
    setEdits: options.setEdits ?? vi.fn(async () => {}),
  };
}

const families: SpecRuntimeFamily[] = [{ id: "claude", label: "Claude", provider: "anthropic", modes: [{ id: "agent", label: "Agent", defaultModel: "example-agent", provider: "anthropic" }] }];

function renderPicker(agents: GavelAgents, props: Partial<CommentAgentPickerProps> = {}) {
  return render(<CommentAgentPicker agents={agents} {...props} />);
}

const row = (field: string) => {
  const element = document.querySelector<HTMLElement>(`[data-field="${field}"]`);
  if (!element) throw new Error(`no row for ${field}`);
  return within(element);
};

describe("CommentAgentPicker edits", () => {
  it("saves how the agent edits while auto-run is off, without touching auto-run", async () => {
    const agents = fakeAgents({ agent: { edits: "direct" } });
    renderPicker(agents);
    const propose = screen.getByRole("radio", { name: "Propose patches" });
    expect(propose.hasAttribute("disabled")).toBe(false);
    expect(screen.getByRole("radio", { name: "Edit directly" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(propose);
    await waitFor(() => expect(agents.setEdits).toHaveBeenCalledWith("propose"));
    expect(agents.setEnabled).not.toHaveBeenCalled();
    expect(screen.getByRole("switch", { name: "Auto-run new comments" }).getAttribute("aria-checked")).toBe("false");
  });

  it("shows the saved edit mode and explains what proposing means", () => {
    renderPicker(fakeAgents({ agent: { enabled: false, edits: "propose" } }));
    expect(screen.getByRole("radio", { name: "Propose patches" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByText(/answers with a patch/)).toBeTruthy();
  });
});

describe("CommentAgentPicker auto-run and assign", () => {
  it("turns auto-run on and off through the hook", async () => {
    const agents = fakeAgents({ agent: { enabled: true } });
    renderPicker(agents);
    fireEvent.click(screen.getByRole("switch", { name: "Auto-run new comments" }));
    await waitFor(() => expect(agents.setEnabled).toHaveBeenCalledWith(false));
  });

  it("disables auto-run, saying why, when the host has no run to start", () => {
    renderPicker(fakeAgents(), { autoRunUnavailable: "Open a page to set its auto-run" });
    const toggle = screen.getByRole("switch", { name: "Auto-run new comments" });
    expect(toggle.hasAttribute("disabled")).toBe(true);
    expect(toggle.closest("[title]")?.getAttribute("title") ?? toggle.getAttribute("title")).toBe("Open a page to set its auto-run");
  });

  it("offers assign only while auto-run is on and saves it at the project layer", async () => {
    const { unmount } = renderPicker(fakeAgents({ agent: { enabled: false } }));
    expect(screen.getByRole("switch", { name: "Show the agent as the thread's assignee" }).hasAttribute("disabled")).toBe(true);
    unmount();
    const agents = fakeAgents({ agent: { enabled: true } });
    renderPicker(agents);
    fireEvent.click(screen.getByRole("switch", { name: "Show the agent as the thread's assignee" }));
    await waitFor(() => expect(agents.save).toHaveBeenCalledWith({ agent: { assign: true } }));
  });
});

describe("CommentAgentPicker provenance", () => {
  const provenance = { enabled: { layer: "/home/example/.gavel.yaml" }, edits: { layer: "db:project:", page: "docs/README.md" }, prompt: { layer: "db:project:" }, group: { layer: "/home/example/.gavel.yaml" } };
  const agent: CommentAgent = { enabled: true, edits: "propose", prompt: "review", group: "g-1", instructions: "be brief" };

  it("badges every field with the layer it was resolved from, and says when a layer sets none", () => {
    renderPicker(fakeAgents({ agent, provenance }), { grouping: { value: "page", onChange: vi.fn() } });
    expect(row("enabled").getByText(".gavel.yaml")).toBeTruthy();
    expect(row("edits").getByText("DB (page)")).toBeTruthy();
    expect(row("prompt").getByText("DB")).toBeTruthy();
    expect(row("group").getByText(".gavel.yaml")).toBeTruthy();
    for (const field of ["assign", "presets", "spec", "variables", "instructions"]) expect(row(field).getByText("default")).toBeTruthy();
  });

  it("offers to inherit only a value the project layer itself sets, and saves the field as null", async () => {
    const agents = fakeAgents({ agent, provenance });
    renderPicker(agents);
    expect(within(document.querySelector<HTMLElement>('[data-field="enabled"]')!).queryByRole("button", { name: "Inherit enabled" })).toBeNull();
    fireEvent.click(row("prompt").getByRole("button", { name: "Inherit prompt" }));
    await waitFor(() => expect(agents.save).toHaveBeenCalledWith({ agent: { prompt: null } }));
  });

  describe("with a project that has its own .gavel.yaml", () => {
    const fileProvenance = { enabled: { layer: "/home/example/.gavel.yaml" }, prompt: { layer: "/work/site/.gavel.yaml", page: "docs/README.md" } };

    it("offers to inherit a value the project's file sets, and not one a layer above it sets", () => {
      renderPicker(fakeAgents({ agent, provenance: fileProvenance, fileBacked: true }));
      expect(row("prompt").getByText(".gavel.yaml (page)")).toBeTruthy();
      expect(row("prompt").getByRole("button", { name: "Inherit prompt" })).toBeTruthy();
      expect(row("enabled").queryByRole("button", { name: "Inherit enabled" })).toBeNull();
    });

    it("saves the inherit patch without naming a layer, leaving the hook to save into the project file", async () => {
      const agents = fakeAgents({ agent, provenance: fileProvenance, fileBacked: true });
      renderPicker(agents);
      fireEvent.click(row("prompt").getByRole("button", { name: "Inherit prompt" }));
      await waitFor(() => expect(agents.save).toHaveBeenCalledWith({ agent: { prompt: null } }));
      expect(agents.ownLayer).toEqual(projectFile);
    });

    it("offers no inherit for a value the database layer would hold, since the project's own layer is its file", () => {
      renderPicker(fakeAgents({ agent, provenance: { prompt: { layer: "/home/example/.gavel.yaml" } }, fileBacked: true }));
      expect(screen.queryAllByRole("button", { name: /^Inherit/ })).toHaveLength(0);
    });
  });

  it("says which live session new threads go to, ahead of the rule", () => {
    renderPicker(fakeAgents({ agent: { enabled: true }, session: "claude-site-1" }));
    expect(screen.getByTestId("agent-session-route").textContent).toMatch(/claude-site-1/);
  });

  it("says nothing about a live session when none routes the threads", () => {
    renderPicker(fakeAgents({ agent: { enabled: true } }));
    expect(screen.queryByTestId("agent-session-route")).toBeNull();
  });

  it("shows each run field's current value beside its chip", () => {
    renderPicker(fakeAgents({ agent, provenance }));
    expect(row("prompt").getByText("review")).toBeTruthy();
    expect(row("instructions").getByText("be brief")).toBeTruthy();
  });
});

describe("CommentAgentPicker run settings", () => {
  const prompts = [
    { id: "editor-comments", label: "Editor comments" },
    { id: "review", label: "Review", description: "Reviews the page" },
  ];

  it("saves only the fields the form changed", async () => {
    const agents = fakeAgents({ agent: { enabled: true, prompt: "review", instructions: "be brief" } });
    renderPicker(agents, { prompts, runtimes: { models: [], families } });
    const save = screen.getByRole("button", { name: "Save run settings" });
    expect(save.hasAttribute("disabled")).toBe(true);
    fireEvent.change(screen.getByLabelText("Instructions"), { target: { value: "be thorough" } });
    fireEvent.change(screen.getByLabelText("Prompt"), { target: { value: "editor-comments" } });
    fireEvent.click(save);
    await waitFor(() => expect(agents.save).toHaveBeenCalledWith({ agent: { prompt: "editor-comments", instructions: "be thorough" } }));
  });

  it("saves an emptied instructions field as null so it inherits", async () => {
    const agents = fakeAgents({ agent: { instructions: "be brief" } });
    renderPicker(agents);
    fireEvent.change(screen.getByLabelText("Instructions"), { target: { value: "" } });
    fireEvent.click(screen.getByRole("button", { name: "Save run settings" }));
    await waitFor(() => expect(agents.save).toHaveBeenCalledWith({ agent: { instructions: null } }));
  });

  it("keeps a prompt the catalog does not list selectable, and says so", () => {
    renderPicker(fakeAgents({ agent: { prompt: "legacy-prompt" } }), { prompts });
    expect((screen.getByLabelText("Prompt") as HTMLSelectElement).value).toBe("legacy-prompt");
    expect(screen.getByRole("option", { name: "legacy-prompt (not in the catalog)" })).toBeTruthy();
  });

  it("offers no model editor until the host supplies runtime options", () => {
    renderPicker(fakeAgents());
    expect(screen.queryByRole("group", { name: /runtime/i })).toBeNull();
    expect(screen.getByLabelText("Instructions")).toBeTruthy();
  });
});

describe("CommentAgentPicker loading and errors", () => {
  it("says the agent is loading, and offers no controls, until the hook is ready", () => {
    renderPicker({ ...fakeAgents({ ready: false }), agent: undefined, settings: undefined });
    expect(screen.getByRole("status").textContent).toBe("Loading the comment agent…");
    expect(screen.queryByRole("switch")).toBeNull();
  });

  it("shows a failed read as the only content", () => {
    renderPicker({ ...fakeAgents({ ready: false, error: "comment agent settings are not available" }), agent: undefined, settings: undefined });
    expect(screen.getByRole("alert").textContent).toBe("comment agent settings are not available");
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("shows the hook's save error while keeping the controls", () => {
    renderPicker(fakeAgents({ agent: { edits: "direct" }, error: "403 only humans can change comment agents" }));
    expect(screen.getByRole("alert").textContent).toBe("403 only humans can change comment agents");
    expect(screen.getByRole("radio", { name: "Propose patches" })).toBeTruthy();
  });

  it("shows a save that throws, such as turning auto-run on without a run target", async () => {
    const agents = fakeAgents({ setEnabled: vi.fn(async () => { throw new Error("The host has not reported a run target yet"); }) });
    renderPicker(agents);
    fireEvent.click(screen.getByRole("switch", { name: "Auto-run new comments" }));
    expect((await screen.findByRole("alert")).textContent).toBe("The host has not reported a run target yet");
  });
});

describe("CommentAgentPicker grouping", () => {
  it("reports the chosen session grouping", () => {
    const onChange = vi.fn();
    renderPicker(fakeAgents(), { grouping: { value: "shared", onChange } });
    expect(screen.getByRole("radio", { name: "Shared" }).getAttribute("aria-checked")).toBe("true");
    fireEvent.click(screen.getByRole("radio", { name: "Per page" }));
    expect(onChange).toHaveBeenCalledWith("page");
  });
});

describe("CommentAgentPicker sessions", () => {
  const live: GavelAgentSession = { id: "s-live", source: "codex", title: "Review changes", model: "example-model", cwd: "/work/example", status: "active", inCmux: true, context: { usedTokens: 50_000, windowTokens: 200_000 } };
  const ended: GavelAgentSession = { id: "s-ended", source: "claude", title: "welcome threads", status: "ended", resumable: true, managed: true, inCmux: false };
  const sessions = (overrides: Partial<NonNullable<CommentAgentPickerProps["sessions"]>> = {}): NonNullable<CommentAgentPickerProps["sessions"]> => ({ items: [live, ended], state: "ready", onSelect: vi.fn(), ...overrides });

  it("lists live and resumable sessions with their status, folder and context use, and reports the one chosen", () => {
    const list = sessions();
    renderPicker(fakeAgents(), { sessions: list });
    expect(screen.getByText("active")).toBeTruthy();
    expect(screen.getByText("resumes")).toBeTruthy();
    expect(screen.queryByText("ended")).toBeNull();
    expect(screen.getByText("example")).toBeTruthy();
    expect(screen.getByText("25%")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Use session welcome threads" }));
    expect(list.onSelect).toHaveBeenCalledWith(ended);
  });

  it("marks the chosen session, and a new session when none is chosen", () => {
    const onNew = vi.fn();
    const { rerender } = renderPicker(fakeAgents(), { sessions: sessions({ selectedId: "s-live", onNew }) });
    expect(screen.getByRole("button", { name: "Use session Review changes" }).getAttribute("aria-pressed")).toBe("true");
    expect(screen.getByRole("button", { name: "New session" }).getAttribute("aria-pressed")).toBe("false");
    fireEvent.click(screen.getByRole("button", { name: "New session" }));
    expect(onNew).toHaveBeenCalledOnce();
    rerender(<CommentAgentPicker agents={fakeAgents()} sessions={sessions({ onNew })} />);
    expect(screen.getByRole("button", { name: "New session" }).getAttribute("aria-pressed")).toBe("true");
  });

  it.each([
    { state: "loading" as const, text: "Loading active sessions…" },
    { state: "ready" as const, text: "No active sessions." },
  ])("says so while the sessions are $state with none to show", ({ state, text }) => {
    renderPicker(fakeAgents(), { sessions: sessions({ items: [], state }) });
    expect(screen.getByText(text)).toBeTruthy();
  });

  it("shows neither a loading nor an empty message once the sessions failed to load", () => {
    renderPicker(fakeAgents(), { sessions: sessions({ items: [], state: "error", error: "Cannot reach gavel" }) });
    expect(screen.queryByText("No active sessions.")).toBeNull();
    expect(screen.getByText("Cannot reach gavel")).toBeTruthy();
  });

  it("assigns every open thread to a chosen or a new session, and disables that at zero", () => {
    const assignAll = { count: 3, onSession: vi.fn(), onNew: vi.fn() };
    const { unmount } = renderPicker(fakeAgents(), { sessions: sessions({ assignAll }) });
    fireEvent.click(screen.getByRole("button", { name: "Assign all to welcome threads" }));
    expect(assignAll.onSession).toHaveBeenCalledWith(ended);
    fireEvent.click(screen.getByRole("button", { name: "Assign all to a new session" }));
    expect(assignAll.onNew).toHaveBeenCalledOnce();
    expect(screen.getByText("3 open threads")).toBeTruthy();
    unmount();
    renderPicker(fakeAgents(), { sessions: sessions({ assignAll: { ...assignAll, count: 0 } }) });
    expect(screen.getAllByRole("button", { name: /^Assign all to / }).every((button) => button.hasAttribute("disabled"))).toBe(true);
    expect(screen.getByText("No open threads")).toBeTruthy();
  });
});
