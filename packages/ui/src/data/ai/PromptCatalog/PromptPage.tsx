import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "../../../components/button";
import { UiDiff, UiEye, UiFileCode, UiLock } from "../../../icons";
import { cn } from "../../../lib/utils";
import { Tabs, type TabItem } from "../../../layout/Tabs";
import { Modal } from "../../../overlay/Modal";
import type { ChatModel } from "../../chat/types";
import { CodeDiff } from "../../CodeDiff";
import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import type { PromptSpecDetail } from "../PromptPicker/types";
import { defaultEditLayer, layerLabel } from "./prompt-catalog-model";
import {
  PROMPT_PAGE_TAB,
  buildSavePayload,
  defaultFilePath,
  draftFor,
  draftRaw,
  errorMessage,
  initialSaveSource,
  isConflictError,
  isDraftDirty,
  isPromptPageDirty,
  pageTabs,
  type PromptDraft,
  type PromptSaveSource,
} from "./prompt-page-model";
import { PromptLayerStrip } from "./PromptLayerStrip";
import { PromptPageEditor } from "./PromptPageEditor";
import { PromptPageHeader } from "./PromptPageHeader";
import { PromptPagePreview } from "./PromptPagePreview";
import { PromptPageSaveBar } from "./PromptPageSaveBar";
import type {
  PromptCatalogEntry,
  PromptCatalogLayer,
  PromptPageAdapter,
  PromptPageTab,
} from "./types";

export type PromptPageProps = {
  entry: PromptCatalogEntry;
  adapter: PromptPageAdapter;
  models?: ChatModel[] | undefined;
  families?: SpecRuntimeFamily[] | undefined;
  onBack?: (() => void) | undefined;
  onSaved?:
    | ((detail: PromptSpecDetail, layer: PromptCatalogLayer) => void)
    | undefined;
  extraTabs?: PromptPageTab[] | undefined;
  initialLayerOrigin?: string | undefined;
  className?: string | undefined;
};

type LayerState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; detail: PromptSpecDetail };

type PendingTransition =
  | { type: "back" }
  | { type: "reload" }
  | { type: "layer"; origin: string };

const TAB_ICONS: Record<string, TabItem["icon"]> = {
  [PROMPT_PAGE_TAB.prompt]: UiFileCode,
  [PROMPT_PAGE_TAB.preview]: UiEye,
  [PROMPT_PAGE_TAB.diff]: UiDiff,
};

const EMPTY_DRAFT: PromptDraft = { mode: "raw", raw: "", value: undefined };

// PromptPage is the dedicated view of one prompt: what runs and from which
// layer, the layer chain, and an editor for the layer the user picks — raw or
// structured — with preview, diff against the built-in, and a save that
// refuses to clobber a layer that moved on since it was loaded.
export function PromptPage({
  entry,
  adapter,
  models,
  families,
  onBack,
  onSaved,
  extraTabs,
  initialLayerOrigin,
  className,
}: PromptPageProps) {
  const [selectedOrigin, setSelectedOrigin] = useState<string | undefined>(
    () =>
      initialLayerOrigin ??
      defaultEditLayer(entry)?.origin ??
      entry.layers[0]?.origin,
  );
  const selectedLayer = useMemo(
    () => entry.layers.find((layer) => layer.origin === selectedOrigin),
    [entry, selectedOrigin],
  );
  const [state, setState] = useState<LayerState>({ status: "idle" });
  const [draft, setDraft] = useState<PromptDraft>(EMPTY_DRAFT);
  const [saveSource, setSaveSource] = useState<PromptSaveSource>("inline");
  const [path, setPath] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [conflict, setConflict] = useState(false);
  const [pendingTransition, setPendingTransition] =
    useState<PendingTransition | null>(null);
  const [tab, setTab] = useState<string>(PROMPT_PAGE_TAB.prompt);
  const [reloadToken, setReloadToken] = useState(0);

  const readOnly = !selectedLayer?.editable;
  const draftDirty =
    state.status === "ready" && isDraftDirty(draft, state.detail);
  const dirty =
    state.status === "ready" && selectedLayer
      ? isPromptPageDirty({
          draft,
          detail: state.detail,
          source: saveSource,
          path,
          entry,
          layer: selectedLayer,
        })
      : false;

  const applyDetail = useCallback(
    (detail: PromptSpecDetail, layer: PromptCatalogLayer) => {
      setState({ status: "ready", detail });
      setDraft(draftFor(detail));
      setSaveSource(initialSaveSource(detail));
      setPath(defaultFilePath(entry, layer, detail));
      setSaveError("");
      setConflict(false);
    },
    [entry],
  );

  // The load is keyed on the layer's identity, not the entry object: a host
  // that refetches its catalog while the user is editing must not reset the
  // draft. The latest adapter/entry are read through a ref for the same reason.
  const latest = useRef({ adapter, entry, applyDetail });
  latest.current = { adapter, entry, applyDetail };
  const layerKey = selectedLayer
    ? `${selectedLayer.origin}\u0000${selectedLayer.scope ?? ""}`
    : "";
  useEffect(() => {
    const layer = latest.current.entry.layers.find(
      (candidate) =>
        `${candidate.origin}\u0000${candidate.scope ?? ""}` === layerKey,
    );
    if (!layer) {
      setState({ status: "idle" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    latest.current.adapter.loadDetail(latest.current.entry, layer).then(
      (detail) => {
        if (!cancelled) latest.current.applyDetail(detail, layer);
      },
      (cause: unknown) => {
        if (!cancelled)
          setState({
            status: "error",
            message: errorMessage(cause, "failed to load prompt"),
          });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [layerKey, reloadToken]);

  useEffect(() => {
    if (!dirty) return;
    const guard = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", guard);
    return () => window.removeEventListener("beforeunload", guard);
  }, [dirty]);

  const reload = () => setReloadToken((token) => token + 1);

  function runTransition(transition: PendingTransition) {
    setPendingTransition(null);
    if (transition.type === "back") {
      onBack?.();
      return;
    }
    if (transition.type === "reload") {
      reload();
      return;
    }
    setSelectedOrigin(transition.origin);
  }

  function requestTransition(transition: PendingTransition) {
    if (dirty) {
      setPendingTransition(transition);
      return;
    }
    runTransition(transition);
  }

  async function persist(
    build: (
      detail: PromptSpecDetail,
    ) => Parameters<PromptPageAdapter["saveDetail"]>[2],
    failure: string,
  ) {
    if (state.status !== "ready" || !selectedLayer) return;
    setSaving(true);
    setSaveError("");
    setConflict(false);
    try {
      const next = await adapter.saveDetail(
        entry,
        selectedLayer,
        build(state.detail),
      );
      applyDetail(next, selectedLayer);
      onSaved?.(next, selectedLayer);
    } catch (cause) {
      const message = errorMessage(cause, failure);
      setSaveError(message);
      setConflict(isConflictError(message));
    } finally {
      setSaving(false);
    }
  }

  const save = () =>
    persist(
      (detail) => buildSavePayload(draft, detail, saveSource, path),
      "save failed",
    );
  const remove = () =>
    persist(
      (detail) => ({ source: "default", baseRaw: detail.raw }),
      "remove failed",
    );

  const render = adapter.render;
  const tabs = pageTabs({
    canPreview: render !== undefined,
    canDiff: entry.defaultRaw !== undefined,
    extraTabs,
  }).map((item) => {
    const icon = TAB_ICONS[item.id];
    return icon ? { ...item, icon } : item;
  });
  const activeTab = tabs.some((item) => item.id === tab)
    ? tab
    : PROMPT_PAGE_TAB.prompt;
  const currentRaw =
    state.status === "ready"
      ? draftDirty
        ? draftRaw(draft)
        : state.detail.raw
      : "";

  function selectLayer(layer: PromptCatalogLayer) {
    if (layer.origin === selectedOrigin) return;
    requestTransition({ type: "layer", origin: layer.origin });
  }

  function renderPanel() {
    if (state.status === "loading" || state.status === "idle") {
      return <p className="text-sm text-muted-foreground">Loading prompt…</p>;
    }
    if (state.status === "error") {
      return (
        <div
          role="alert"
          className="flex items-center gap-2 text-sm text-destructive"
        >
          <span>{state.message}</span>
          <Button type="button" size="sm" variant="outline" onClick={reload}>
            Retry
          </Button>
        </div>
      );
    }
    if (activeTab === PROMPT_PAGE_TAB.prompt) {
      return (
        <PromptPageEditor
          detail={state.detail}
          draft={draft}
          onChange={setDraft}
          readOnly={readOnly}
          models={models}
          families={families}
          {...(entry.effective.backend
            ? { effectiveBackend: entry.effective.backend }
            : {})}
          {...(entry.effective.model
            ? { effectiveModel: entry.effective.model }
            : {})}
        />
      );
    }
    if (activeTab === PROMPT_PAGE_TAB.preview && render) {
      return (
        <PromptPagePreview
          entry={entry}
          render={(input) => render(entry, input)}
          draftRaw={draftDirty ? currentRaw : undefined}
        />
      );
    }
    if (activeTab === PROMPT_PAGE_TAB.diff && entry.defaultRaw !== undefined) {
      return (
        <CodeDiff
          original={entry.defaultRaw}
          modified={currentRaw}
          language="markdown"
        />
      );
    }
    return extraTabs?.find((item) => item.id === activeTab)?.content ?? null;
  }

  return (
    <>
      <div className={cn("flex h-full min-h-0 flex-col", className)}>
        <PromptPageHeader
          entry={entry}
          selectedLayer={selectedLayer}
          {...(onBack
            ? { onBack: () => requestTransition({ type: "back" }) }
            : {})}
        />
        <PromptLayerStrip
          entry={entry}
          selectedOrigin={selectedOrigin}
          onSelect={selectLayer}
        />
        {readOnly && selectedLayer ? (
          <div
            role="note"
            className="mx-density-4 mb-2 flex items-center gap-2 rounded-md border border-border bg-muted px-3 py-2 text-xs"
          >
            <UiLock className="shrink-0 text-muted-foreground" />
            <span>
              {layerLabel(selectedLayer.origin)} is read-only from here —{" "}
              <span className="font-mono">{selectedLayer.path}</span>. Edit it
              directly or pick an editable layer.
            </span>
          </div>
        ) : null}
        <Tabs
          tabs={tabs}
          value={activeTab}
          onChange={setTab}
          className="px-density-4"
        />
        <div className="min-h-0 flex-1 overflow-y-auto px-density-4 py-density-3">
          {renderPanel()}
        </div>
        {state.status === "ready" && !readOnly ? (
          <PromptPageSaveBar
            source={saveSource}
            onSourceChange={setSaveSource}
            path={path}
            onPathChange={setPath}
            dirty={dirty}
            saving={saving}
            canRemove={state.detail.source !== "default"}
            error={saveError}
            conflict={conflict}
            onSave={save}
            onRemove={remove}
            onReload={() => requestTransition({ type: "reload" })}
          />
        ) : null}
      </div>
      {pendingTransition ? (
        <Modal
          open
          onClose={() => setPendingTransition(null)}
          title="Discard unsaved prompt changes?"
          size="sm"
          expandable={false}
          footer={
            <div className="flex w-full justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setPendingTransition(null)}
              >
                Keep editing
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => runTransition(pendingTransition)}
              >
                Discard changes
              </Button>
            </div>
          }
        >
          <p className="text-sm text-muted-foreground">
            Your prompt content, save location, or file path changes will be
            lost.
          </p>
        </Modal>
      ) : null}
    </>
  );
}
