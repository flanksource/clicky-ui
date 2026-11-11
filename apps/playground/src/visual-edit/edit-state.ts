import { useEffect, useRef, useSyncExternalStore } from "react";

export type SvgDraft = { page: string; dirty: boolean; saving: boolean; canSave: boolean; save(): Promise<boolean>; discard(): boolean | Promise<boolean> };
type State = { draft: SvgDraft | null; writes: number; error: unknown; saved: boolean; leaving: { run(): void; cancel?(): void } | null };
let state: State = { draft: null, writes: 0, error: null, saved: false, leaving: null };
const listeners = new Set<() => void>();
function update(patch: Partial<State>) { state = { ...state, ...patch }; for (const listener of listeners) listener(); }
export const editState = {
  subscribe(listener: () => void) { listeners.add(listener); return () => { listeners.delete(listener); }; },
  snapshot: () => state,
  clearError: () => update({ error: null, saved: false }),
  leave(run: () => void) {
    if (state.writes || state.draft?.saving) return false;
    if (!state.draft?.dirty) return true;
    update({ leaving: { run } }); return false;
  },
  confirm() {
    if (state.writes || state.draft?.saving) return false;
    if (!state.draft?.dirty) return true;
    state.leaving?.cancel?.();
    return new Promise<boolean>(resolve => update({ leaving: { run: () => resolve(true), cancel: () => resolve(false) } }));
  },
  stay: () => { state.leaving?.cancel?.(); update({ leaving: null }); },
  async resolve(save: boolean) {
    const leaving = state.leaving;
    const draft = state.draft;
    if (!draft || !leaving) return;
    try {
      if (!(await (save ? draft.save() : draft.discard()))) return;
    } catch (error) { update({ error }); return; }
    update({ draft: null, leaving: null }); leaving.run();
  },
};
export function beginEditWrite() {
  update({ writes: state.writes + 1, error: null, saved: false });
  return (error?: unknown) => {
    update({ writes: state.writes - 1, error: error ?? null, saved: error === undefined });
  };
}
export function useSvgDraft(draft: SvgDraft) {
  const current = useRef(draft);
  current.current = draft;
  useEffect(() => {
    const registered = { ...current.current, save: () => current.current.save(), discard: () => current.current.discard() };
    update({ draft: registered });
    return () => { if (state.draft === registered) update({ draft: null }); };
  }, [draft.page, draft.dirty, draft.saving, draft.canSave]);
}
export function useEditState() { return useSyncExternalStore(editState.subscribe, editState.snapshot); }
