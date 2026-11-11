import { useEffect } from "react";
import { ActionError, Badge, Button, Modal, useToast } from "@flanksource/clicky-ui";
import { editState, useEditState } from "./edit-state";

export function EditStatus() {
  const state = useEditState();
  const { toast, dismiss } = useToast();
  useEffect(() => {
    if (!state.error || state.leaving) return;
    const id = toast({ tone: "danger", message: state.error instanceof Error ? state.error.message : String(state.error), durationMs: 0 });
    return () => dismiss(id);
  }, [state.error, state.leaving, toast, dismiss]);
  useEffect(() => { if (state.saved) toast({ tone: "success", message: "Changes saved" }); }, [state.saved, toast]);
  useEffect(() => {
    if (!state.leaving) return;
    const register = () => window.__REACT_GRAB__?.registerPlugin({ name: "playground-navigation", theme: { toolbar: { enabled: false } } });
    register();
    window.addEventListener("react-grab:init", register);
    return () => { window.removeEventListener("react-grab:init", register); window.__REACT_GRAB__?.unregisterPlugin("playground-navigation"); };
  }, [state.leaving]);
  const dirty = state.draft?.dirty;
  const saving = state.writes > 0 || state.draft?.saving;
  useEffect(() => {
    if (!dirty && !saving) return;
    const unload = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", unload);
    return () => window.removeEventListener("beforeunload", unload);
  }, [dirty, saving]);
  useEffect(() => { if (!state.saved) return; const timer = setTimeout(editState.clearError, 2500); return () => clearTimeout(timer); }, [state.saved]);
  return <>
    {(dirty || saving || state.error || state.saved) ? <div role={state.error ? "alert" : "status"} className="flex flex-wrap items-center gap-2 border-b border-border bg-card px-3 py-2 text-sm">
      {dirty && <Badge tone="warning">Unsaved SVG edits</Badge>}
      <span>{saving ? "Saving changes…" : state.error ? "Changes could not be saved" : dirty ? "Unsaved changes" : "Changes saved"}</span>
      {dirty && !saving && <><Button size="sm" disabled={!state.draft?.canSave} onClick={() => { void state.draft?.save(); }}>Save</Button><Button size="sm" variant="outline" onClick={() => { void state.draft?.discard(); }}>Discard</Button></>}
      {state.error ? <ActionError error={state.error} /> : null}
    </div> : null}
    <Modal open={state.leaving !== null} onClose={editState.stay} title="Unsaved SVG changes" size="sm" footer={<div className="flex gap-2"><Button variant="ghost" disabled={Boolean(saving)} onClick={editState.stay}>Stay</Button><Button variant="outline" disabled={Boolean(saving)} onClick={() => { void editState.resolve(false); }}>Discard and leave</Button><Button disabled={Boolean(saving) || !state.draft?.canSave} onClick={() => { void editState.resolve(true); }}>Save and leave</Button></div>}>
      <p>Save or discard your SVG changes before leaving this editor.</p>
      {state.error ? <ActionError error={state.error} className="mt-3" /> : null}
    </Modal>
  </>;
}
