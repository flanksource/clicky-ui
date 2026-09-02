import { useEffect, useState } from "react";
import type { AIPromptRunValue } from "../PromptRunEditor/model";
import type {
  ResolvedRuntimeProfile,
  RuntimePreset,
  RuntimeProfile,
  RuntimeProfileResolveRequest,
} from "../runtime-profile";
import { presetsOf } from "./model";
import {
  afterSave,
  detachedValue,
  editDraft,
  isDraftDirty,
  pickerStateFor,
  profileForRef,
  saveAsNewDraft,
  selectProfile,
  type RuntimeProfileLayer,
  type RuntimeProfilePickerState,
} from "./RuntimeProfilePicker.model";

export type RuntimeProfilePickerBusy = "save" | "create" | "detach";

export type RuntimeProfilePickerController = {
  state: RuntimeProfilePickerState;
  dirty: boolean;
  pending: { ref: string | undefined } | undefined;
  busy: RuntimeProfilePickerBusy | undefined;
  error: string | undefined;
  notice: string | undefined;
  canSave: boolean;
  canCreate: boolean;
  select: (ref: string | undefined) => void;
  confirmPending: () => void;
  cancelPending: () => void;
  setLayer: (layer: RuntimeProfileLayer) => void;
  editDraft: (draft: RuntimeProfile) => void;
  save: () => Promise<void>;
  saveAsNew: () => Promise<void>;
  detach: () => Promise<void>;
};

const DETACH_NOTICE =
  "Detached from the authored profile spec; presets were not resolved.";

export function useRuntimeProfilePicker({
  value,
  onChange,
  profiles,
  presets,
  onSaveProfile,
  onCreateProfile,
  onResolveProfile,
  newId = () => crypto.randomUUID(),
}: {
  value: AIPromptRunValue;
  onChange: (value: AIPromptRunValue) => void;
  profiles: RuntimeProfile[];
  presets: RuntimePreset[];
  onSaveProfile?: ((profile: RuntimeProfile) => Promise<RuntimeProfile>) | undefined;
  onCreateProfile?: ((profile: RuntimeProfile) => Promise<RuntimeProfile>) | undefined;
  onResolveProfile?:
    | ((request: RuntimeProfileResolveRequest) => Promise<ResolvedRuntimeProfile>)
    | undefined;
  newId?: (() => string) | undefined;
}): RuntimeProfilePickerController {
  const [state, setState] = useState(() => pickerStateFor(value, profiles));
  const [pending, setPending] = useState<{ ref: string | undefined }>();
  const [busy, setBusy] = useState<RuntimeProfilePickerBusy>();
  const [error, setError] = useState<string>();
  const [notice, setNotice] = useState<string>();
  const saved = profileForRef(value.runtimeProfile, profiles);
  const dirty = isDraftDirty(state, profiles);

  useEffect(() => {
    const refChanged = value.runtimeProfile !== state.selectedRef;
    const draftMissing = saved !== undefined && state.draft?.id !== saved.id && !dirty;
    if (!refChanged && !draftMissing) return;
    setState(pickerStateFor(value, profiles));
    setPending(undefined);
  }, [value.runtimeProfile, saved]);

  const apply = (ref: string | undefined) => {
    const profile = profileForRef(ref, profiles);
    setState({
      selectedRef: profile?.id,
      draft: profile ? structuredClone(profile) : undefined,
      layer: "run",
    });
    setPending(undefined);
    setError(undefined);
    setNotice(undefined);
    onChange(selectProfile(value, profile));
  };

  const run = async (
    kind: RuntimeProfilePickerBusy,
    action: () => Promise<void>,
  ) => {
    setBusy(kind);
    setError(undefined);
    setNotice(undefined);
    try {
      await action();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(undefined);
    }
  };

  const persist = async (
    handler: (profile: RuntimeProfile) => Promise<RuntimeProfile>,
    draft: RuntimeProfile,
  ) => {
    const persisted = await handler(draft);
    const next = afterSave(value, state, persisted);
    setState(next.state);
    if (next.value !== value) onChange(next.value);
  };

  return {
    state,
    dirty,
    pending,
    busy,
    error,
    notice,
    canSave: onSaveProfile !== undefined,
    canCreate: onCreateProfile !== undefined,
    select: (ref) => {
      if (ref === state.selectedRef) return;
      if (dirty) setPending({ ref });
      else apply(ref);
    },
    confirmPending: () => {
      if (pending) apply(pending.ref);
    },
    cancelPending: () => setPending(undefined),
    setLayer: (layer) => setState((current) => ({ ...current, layer })),
    editDraft: (draft) => setState((current) => editDraft(current, draft)),
    save: () =>
      run("save", async () => {
        if (!onSaveProfile || !state.draft) return;
        await persist(onSaveProfile, state.draft);
      }),
    saveAsNew: () =>
      run("create", async () => {
        if (!onCreateProfile || !state.draft) return;
        await persist(
          onCreateProfile,
          saveAsNewDraft(state.draft, profiles, newId()),
        );
      }),
    detach: () =>
      run("detach", async () => {
        const draft = state.draft;
        if (!draft) return;
        const resolved = onResolveProfile
          ? (
              await onResolveProfile({
                profile: draft,
                presets: presetsOf(draft, presets).found,
              })
            ).resolved.spec
          : draft.spec;
        onChange(detachedValue(value, resolved));
        setState({ selectedRef: undefined, draft: undefined, layer: "run" });
        if (!onResolveProfile) setNotice(DETACH_NOTICE);
      }),
  };
}
