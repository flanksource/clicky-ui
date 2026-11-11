import { act, cleanup, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { beginEditWrite, editState, useSvgDraft } from "./edit-state";

afterEach(() => { cleanup(); editState.stay(); editState.clearError(); });

it("retains the draft and destination after a failed save, then permits explicit discard", async () => {
  const save = vi.fn(async () => false);
  const discard = vi.fn(() => true);
  renderHook(() => useSvgDraft({ page: "drawing", dirty: true, saving: false, canSave: true, save, discard }));
  const decision = editState.confirm();
  await act(() => editState.resolve(true));
  expect(editState.snapshot().draft?.dirty).toBe(true);
  expect(editState.snapshot().leaving).not.toBeNull();
  await act(() => editState.resolve(false));
  expect(await decision).toBe(true);
  expect(discard).toHaveBeenCalledOnce();
});

it("prevents navigation during persistence and exposes the actual failure", () => {
  const finish = beginEditWrite();
  expect(editState.confirm()).toBe(false);
  const error = new Error("Source changed on disk");
  finish(error);
  expect(editState.snapshot()).toMatchObject({ writes: 0, saved: false, error });
});
