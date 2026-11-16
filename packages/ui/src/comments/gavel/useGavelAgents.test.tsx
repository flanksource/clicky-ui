import { act, renderHook, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { Comment } from "../comment-types";
import type { GavelCommentsClient } from "./client";
import type { CommentAgent, CommentAgentSettings, RunDeliverTarget } from "./gavel-delivery";
import { useAdoptRunSession, useAgentSessions, useGavelAgents } from "./useGavelAgents";

const target = "gavel://project/site/files/docs/README.md";
const run: RunDeliverTarget = { kind: "run", prompt: "editor-comments", groupKey: "g-1" };
const project = { kind: "project" } as const;
const projectFile = { kind: "project", file: ".gavel.yaml" } as const;

const dbPosition = { kind: "project" as const, dir: "/work/site", files: [], db: true };
const filePosition = { kind: "project" as const, dir: "/work/site", files: [".gavel.yaml"], db: false };

function resolved(agent: CommentAgent, provenance: CommentAgentSettings["agent"]["provenance"] = {}, position: CommentAgentSettings["settings"]["positions"][number] = dbPosition, session?: string): CommentAgentSettings {
  return { settings: { positions: [position], layers: [], provenance: {} }, agent: { agent, provenance, found: true }, ...(session ? { session } : {}) };
}

/** A gavel whose settings resolve to the agent each call is queued with. */
function fakeClient(options: { initial: CommentAgent; provenance?: CommentAgentSettings["agent"]["provenance"]; saves?: CommentAgent[]; position?: CommentAgentSettings["settings"]["positions"][number]; session?: string }) {
  const saves = [...(options.saves ?? [])];
  const client = {
    scope: "gavel://project/site",
    commentAgent: vi.fn(async () => resolved(options.initial, options.provenance, options.position, options.session)),
    saveCommentAgent: vi.fn(async () => resolved(saves.shift() ?? {}, {}, options.position)),
  };
  return { client: client as unknown as GavelCommentsClient, calls: client };
}

async function loaded(client: GavelCommentsClient, runTarget: RunDeliverTarget | null = run) {
  const hook = renderHook((props: { run: RunDeliverTarget | null }) => useGavelAgents({ client, target, ...(props.run ? { run: props.run } : {}) }), { initialProps: { run: runTarget } });
  await waitFor(() => expect(hook.result.current.ready).toBe(true));
  return hook;
}

describe("useGavelAgents", () => {
  it("reads the target's resolved comment agent with the layer each field came from", async () => {
    const provenance = { enabled: { layer: "project" }, prompt: { layer: "user" } };
    const { client, calls } = fakeClient({ initial: { enabled: true, prompt: "editor-comments" }, provenance });
    const { result } = await loaded(client);
    expect(result.current.enabled).toBe(true);
    expect(result.current.agent?.provenance).toEqual(provenance);
    expect(result.current.settings).toEqual({ positions: [dbPosition], layers: [], provenance: {} });
    expect(calls.commentAgent).toHaveBeenCalledWith(target);
  });

  it("loads nothing until the host names a target", () => {
    const { client, calls } = fakeClient({ initial: {} });
    const { result } = renderHook(() => useGavelAgents({ client, target: undefined }));
    expect([result.current.ready, result.current.agent]).toEqual([false, undefined]);
    expect(calls.commentAgent).not.toHaveBeenCalled();
  });

  it("reports the live session new threads are routed to, which takes precedence over the rule", async () => {
    const { result } = await loaded(fakeClient({ initial: { enabled: true }, session: "claude-site-1" }).client);
    expect(result.current.session).toBe("claude-site-1");
    const none = await loaded(fakeClient({ initial: {} }).client);
    expect(none.result.current.session).toBeUndefined();
  });

  describe("turning auto-run on", () => {
    it("patches enabled plus the run's prompt and group when the entry sets neither", async () => {
      const { client, calls } = fakeClient({ initial: {}, saves: [{ enabled: true, prompt: "editor-comments", group: "g-1" }] });
      const { result } = await loaded(client);
      expect(result.current.enabled).toBe(false);
      await act(() => result.current.setEnabled(true));
      expect(calls.saveCommentAgent).toHaveBeenCalledWith({ uri: target, layer: project, agent: { enabled: true, prompt: "editor-comments", group: "g-1" } });
      expect(result.current.enabled).toBe(true);
    });

    it("patches only enabled when the entry already names a prompt and group, so a CLI-set run is not overwritten", async () => {
      const { client, calls } = fakeClient({ initial: { enabled: false, prompt: "cli-prompt", group: "cli-group" }, saves: [{ enabled: true, prompt: "cli-prompt", group: "cli-group" }] });
      const { result } = await loaded(client);
      await act(() => result.current.setEnabled(true));
      expect(calls.saveCommentAgent.mock.calls).toEqual([[{ uri: target, layer: project, agent: { enabled: true } }]]);
    });

    it("adds only the run fields the entry leaves unset", async () => {
      const { client, calls } = fakeClient({ initial: { prompt: "cli-prompt" } });
      const { result } = await loaded(client);
      await act(() => result.current.setEnabled(true));
      expect(calls.saveCommentAgent).toHaveBeenCalledWith({ uri: target, layer: project, agent: { enabled: true, group: "g-1" } });
    });

    it("refuses before the host has a run target, and saves nothing", async () => {
      const { client, calls } = fakeClient({ initial: {} });
      const { result } = await loaded(client, null);
      await expect(result.current.setEnabled(true)).rejects.toThrow(/run target/);
      expect(calls.saveCommentAgent).not.toHaveBeenCalled();
    });
  });

  describe("turning auto-run off", () => {
    it("patches enabled: false and nothing else, so the entry's other fields survive and an inherited default cannot switch it back on", async () => {
      const { client, calls } = fakeClient({ initial: { enabled: true, prompt: "cli-prompt" }, saves: [{ enabled: false, prompt: "cli-prompt" }] });
      const { result } = await loaded(client, null);
      await act(() => result.current.setEnabled(false));
      expect(calls.saveCommentAgent.mock.calls).toEqual([[{ uri: target, layer: project, agent: { enabled: false } }]]);
      expect(result.current.enabled).toBe(false);
    });

    it("never deletes the entry, which would also drop what the CLI set on it", async () => {
      const { client, calls } = fakeClient({ initial: { enabled: true } });
      const { result } = await loaded(client);
      await act(() => result.current.setEnabled(false));
      expect(calls.saveCommentAgent.mock.calls.map(([call]) => call.agent)).not.toContain(null);
    });
  });

  describe("the edit mode", () => {
    it("reads how the agent edits and defaults to direct edits", async () => {
      const proposing = await loaded(fakeClient({ initial: { enabled: true, edits: "propose" } }).client);
      expect(proposing.result.current.edits).toBe("propose");
      const unset = await loaded(fakeClient({ initial: { enabled: true } }).client);
      expect(unset.result.current.edits).toBe("direct");
    });

    it.each([
      { name: "on", initial: { enabled: true, prompt: "cli-prompt", group: "cli-group" } },
      { name: "off", initial: { enabled: false, prompt: "cli-prompt" } },
      { name: "unset", initial: {} },
    ])("patches edits alone while auto-run is $name, so nothing the CLI set is rewritten and auto-run is not switched", async ({ initial }) => {
      const { client, calls } = fakeClient({ initial, saves: [{ ...initial, edits: "propose" }] });
      const { result } = await loaded(client);
      await act(() => result.current.setEdits("propose"));
      expect(calls.saveCommentAgent.mock.calls).toEqual([[{ uri: target, layer: project, agent: { edits: "propose" } }]]);
      expect([result.current.enabled, result.current.edits]).toEqual([initial.enabled === true, "propose"]);
    });

    it("chooses the edit mode without a run target", async () => {
      const { client, calls } = fakeClient({ initial: {}, saves: [{ edits: "direct" }] });
      const { result } = await loaded(client, null);
      await act(() => result.current.setEdits("direct"));
      expect(calls.saveCommentAgent).toHaveBeenCalledWith({ uri: target, layer: project, agent: { edits: "direct" } });
    });
  });

  it("does not re-derive the run fields over the entry's own when the run target changes", async () => {
    const next = { ...run, prompt: "other-prompt", runOptions: { spec: { model: "codex-example" } } };
    const { client, calls } = fakeClient({ initial: { enabled: true, prompt: "cli-prompt", group: "cli-group" } });
    const { rerender } = await loaded(client);
    rerender({ run: next });
    await Promise.resolve();
    expect(calls.saveCommentAgent).not.toHaveBeenCalled();
  });

  describe("the layer saves go to", () => {
    it("is the project's database layer when the project has no settings file", async () => {
      const { result } = await loaded(fakeClient({ initial: {} }).client);
      expect(result.current.ownLayer).toEqual(project);
    });

    it("is the project's .gavel.yaml when the project has one, which gavel requires over the database layer", async () => {
      const { client, calls } = fakeClient({ initial: {}, position: filePosition, saves: [{ enabled: true }, { edits: "propose" }, { enabled: false }] });
      const { result } = await loaded(client);
      expect(result.current.ownLayer).toEqual(projectFile);
      await act(() => result.current.setEnabled(true));
      await act(() => result.current.setEdits("propose"));
      await act(() => result.current.setEnabled(false));
      expect(calls.saveCommentAgent.mock.calls.map(([call]) => call.layer)).toEqual([projectFile, projectFile, projectFile]);
    });

    it("is reported as an error, and refuses to save, when the chain offers nowhere to save", async () => {
      const { client, calls } = fakeClient({ initial: {}, position: { ...dbPosition, db: false } });
      const { result } = await loaded(client);
      expect(result.current.ownLayer).toBeUndefined();
      expect(result.current.error).toMatch(/cannot be saved/);
      await act(() => result.current.setEdits("propose"));
      expect(calls.saveCommentAgent).not.toHaveBeenCalled();
    });
  });

  it("saves a patch at any layer, sending only what changed, and returns what gavel then resolves", async () => {
    const { client, calls } = fakeClient({ initial: {}, saves: [{ enabled: true, assign: true }] });
    const { result } = await loaded(client);
    let saved: CommentAgentSettings | undefined;
    await act(async () => { saved = await result.current.save({ layer: { kind: "user" }, page: false, agent: { assign: true, prompt: null } }); });
    expect(calls.saveCommentAgent).toHaveBeenCalledWith({ uri: target, layer: { kind: "user" }, page: false, agent: { assign: true, prompt: null } });
    expect(saved?.agent.agent).toEqual({ enabled: true, assign: true });
    expect(result.current.agent?.agent).toEqual({ enabled: true, assign: true });
  });

  it("saves to the project layer when the caller names none, and lets a caller delete the whole entry with null", async () => {
    const { client, calls } = fakeClient({ initial: {} });
    const { result } = await loaded(client);
    await act(async () => { await result.current.save({ agent: { assign: false } }); });
    await act(async () => { await result.current.save({ agent: null }); });
    expect(calls.saveCommentAgent.mock.calls.map(([call]) => [call.layer, call.agent])).toEqual([[project, { assign: false }], [project, null]]);
  });

  it("reports a failed save and keeps the previous state", async () => {
    const { client, calls } = fakeClient({ initial: {} });
    calls.saveCommentAgent.mockRejectedValueOnce(new Error("403 only humans can change comment agents"));
    const { result } = await loaded(client);
    await act(() => result.current.setEnabled(true));
    expect([result.current.enabled, result.current.error]).toEqual([false, "403 only humans can change comment agents"]);
  });

  it("reports a failed read instead of showing a default agent", async () => {
    const { client, calls } = fakeClient({ initial: {} });
    calls.commentAgent.mockRejectedValueOnce(new Error("comment agent settings are not available"));
    const { result } = renderHook(() => useGavelAgents({ client, target }));
    await waitFor(() => expect(result.current.error).toBe("comment agent settings are not available"));
    expect([result.current.ready, result.current.agent]).toEqual([false, undefined]);
  });
});

describe("useAgentSessions", () => {
  const session = (id: string) => ({ id, source: "claude", title: id, inCmux: true });

  const renderSessions = (agentSessions: ReturnType<typeof vi.fn>) => {
    const client = { agentSessions } as unknown as GavelCommentsClient;
    return renderHook(() => useAgentSessions(client));
  };

  it("loads the sessions and reloads them on demand", async () => {
    const agentSessions = vi.fn().mockResolvedValueOnce([session("s-1")]).mockResolvedValueOnce([session("s-1"), session("s-2")]);
    const { result } = renderSessions(agentSessions);
    await waitFor(() => expect(result.current.sessions?.map((entry) => entry.id)).toEqual(["s-1"]));
    await act(() => result.current.refresh());
    expect(result.current.sessions?.map((entry) => entry.id)).toEqual(["s-1", "s-2"]);
  });

  it("reports a failed reload without dropping the sessions it already has", async () => {
    const agentSessions = vi.fn().mockResolvedValueOnce([session("s-1")]).mockRejectedValueOnce(new Error("Cannot reach gavel"));
    const { result } = renderSessions(agentSessions);
    await waitFor(() => expect(result.current.sessions).toHaveLength(1));
    await act(() => result.current.refresh());
    expect([result.current.sessions?.length, result.current.error]).toEqual([1, "Cannot reach gavel"]);
  });
});

describe("useAdoptRunSession", () => {
  const before = { id: "c-1", agentRun: { sessionId: "old", requestedAt: "2026-11-01T10:00:00Z", state: "done" as const } };
  const queued = { id: "c-1", agentRun: { requestedAt: "2026-11-01T10:05:00Z", state: "queued" as const } };
  const recorded = { id: "c-1", agentRun: { sessionId: "s-new", requestedAt: "2026-11-01T10:05:00Z", state: "sent" as const } };
  const render = (comments: Pick<Comment, "id" | "agentRun">[], adopt = vi.fn()) => {
    const hook = renderHook((props: { comments: Pick<Comment, "id" | "agentRun">[] }) => useAdoptRunSession({ comments: props.comments, adopt }), { initialProps: { comments } });
    return { ...hook, adopt };
  };

  it("adopts the session gavel records on the delivered thread after the hand-off, not one a previous run left", () => {
    const { result, rerender, adopt } = render([before]);
    act(() => result.current.watch(["c-1"]));
    expect(adopt).not.toHaveBeenCalled();
    rerender({ comments: [queued] });
    expect(adopt).not.toHaveBeenCalled();
    rerender({ comments: [recorded] });
    expect(adopt.mock.calls).toEqual([["s-new"]]);
  });

  it("adopts once, even when more updates follow", () => {
    const { result, rerender, adopt } = render([before]);
    act(() => result.current.watch(["c-1"]));
    rerender({ comments: [recorded] });
    rerender({ comments: [{ ...recorded, agentRun: { ...recorded.agentRun, state: "done" as const } }] });
    expect(adopt).toHaveBeenCalledTimes(1);
  });

  it("adopts from a batch's first thread that gets a session", () => {
    const other = { id: "c-2" };
    const { result, rerender, adopt } = render([before, other]);
    act(() => result.current.watch(["c-1", "c-2"]));
    rerender({ comments: [before, { id: "c-2", agentRun: { sessionId: "s-new", requestedAt: "2026-11-01T10:06:00Z", state: "sent" as const } }] });
    expect(adopt.mock.calls).toEqual([["s-new"]]);
  });

  it("stops watching a thread whose hand-off failed, so a later unrelated session is not adopted", () => {
    const { result, rerender, adopt } = render([before]);
    act(() => result.current.watch(["c-1"]));
    rerender({ comments: [{ id: "c-1", agentRun: { requestedAt: "2026-11-01T10:05:00Z", state: "error" as const, error: "no capacity" } }] });
    rerender({ comments: [recorded] });
    expect(adopt).not.toHaveBeenCalled();
  });

  it("adopts nothing after the watch is cancelled", () => {
    const { result, rerender, adopt } = render([before]);
    act(() => result.current.watch(["c-1"]));
    act(() => result.current.cancel());
    rerender({ comments: [recorded] });
    expect(adopt).not.toHaveBeenCalled();
  });
});
