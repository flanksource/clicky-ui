import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import type { GavelCommentsClient, GavelMentionable } from "./client";
import { useCommentMentionables } from "./useCommentMentionables";

const first = "gavel://project/site/files/a.md";
const second = "gavel://project/site/files/b.md";
const agentList: GavelMentionable[] = [
  { id: "agent", name: "agent", kind: "agent" },
  { id: "claude", name: "claude", kind: "agent" },
  { id: "claude-site-1", name: "claude-site-1", kind: "agent" },
];

function fakeClient(mentionables: (target: string) => Promise<GavelMentionable[]>) {
  const fn = vi.fn(mentionables);
  return { client: { mentionables: fn } as unknown as GavelCommentsClient, calls: fn };
}

it("lists what the target's comments can be addressed to, as the composer's mentionables", async () => {
  const { client, calls } = fakeClient(async () => agentList);
  const { result } = renderHook(() => useCommentMentionables({ client, target: first }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(calls).toHaveBeenCalledWith(first);
  expect(result.current.mentionables).toEqual([
    { id: "agent", name: "agent", kind: "agent" },
    { id: "claude", name: "claude", kind: "agent" },
    { id: "claude-site-1", name: "claude-site-1", kind: "agent" },
  ]);
});

it("keeps a person a user mention and an agent an agent mention", async () => {
  const { client } = fakeClient(async () => [{ id: "ada", name: "Ada", kind: "user" }, { id: "claude", name: "claude", kind: "agent" }]);
  const { result } = renderHook(() => useCommentMentionables({ client, target: first }));
  await waitFor(() => expect(result.current.loading).toBe(false));
  expect(result.current.mentionables.map((entry) => [entry.id, entry.kind])).toEqual([["ada", "user"], ["claude", "agent"]]);
});

it("lists nothing, and does not load, until the host names a target", () => {
  const { client, calls } = fakeClient(async () => agentList);
  const { result } = renderHook(() => useCommentMentionables({ client, target: undefined }));
  expect([result.current.loading, result.current.mentionables]).toEqual([false, []]);
  expect(calls).not.toHaveBeenCalled();
});

it("reloads for another target and drops an answer that arrives for the previous one", async () => {
  let release: (list: GavelMentionable[]) => void = () => undefined;
  const slow = new Promise<GavelMentionable[]>((resolve) => { release = resolve; });
  const { client, calls } = fakeClient((target) => (target === first ? slow : Promise.resolve([{ id: "agent", name: "agent", kind: "agent" }])));
  const hook = renderHook(({ target }: { target: string }) => useCommentMentionables({ client, target }), { initialProps: { target: first } });
  hook.rerender({ target: second });
  await waitFor(() => expect(hook.result.current.mentionables).toHaveLength(1));
  await act(async () => { release(agentList); await slow; });
  expect(hook.result.current.mentionables).toHaveLength(1);
  expect(calls.mock.calls.map(([target]) => target)).toEqual([first, second]);
});

it("reloads on demand, so a session started since the first load can be mentioned", async () => {
  const lists = [[agentList[0]!], agentList];
  const { client } = fakeClient(async () => lists.shift()!);
  const { result } = renderHook(() => useCommentMentionables({ client, target: first }));
  await waitFor(() => expect(result.current.mentionables).toHaveLength(1));
  await act(() => result.current.refresh());
  expect(result.current.mentionables).toHaveLength(3);
});

it("reports a failed load instead of offering no mentions", async () => {
  const { client } = fakeClient(async () => { throw new Error("Gavel returned an invalid mentionables response"); });
  const { result } = renderHook(() => useCommentMentionables({ client, target: first }));
  await waitFor(() => expect(result.current.error).toBe("Gavel returned an invalid mentionables response"));
  expect([result.current.loading, result.current.mentionables]).toEqual([false, []]);
});
