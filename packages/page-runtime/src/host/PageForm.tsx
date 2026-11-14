import { useEffect, useMemo, useRef, useState } from "react";
import type { FormDataProps } from "@flanksource/clicky-ui/components";
import type { FolderManifest, FrameMessage, JsonValue, RuntimePolicy, SourceProvider } from "../schema.ts";
import { formPageOpen, schemaExtensionSources, type FormExtensionSource } from "../form/form-page.ts";
import { formSourceUpdate } from "../form/source-update.ts";
import type { PageBridge } from "./bridge.ts";
import { PageFrame, type PageFrameProps } from "./PageFrame.tsx";
import { validateJson } from "./message-values.ts";

export type PageFormProps = Omit<PageFrameProps, "open" | "data" | "dataUpdates" | "onBridge" | "onMessage" | "onChange"> & {
  schema: JsonValue;
  value: JsonValue;
  /** Called with the whole form value on every edit; feed it back through `value` to keep the form controlled. */
  onChange: (value: JsonValue) => void;
  /** Runtime-compiled `FormExtension` modules: inline TSX, or a path served by `files` or `sourceProvider`. */
  extensions: FormExtensionSource[];
  /** The serializable `JsonSchemaForm` props; function-valued ones come from the extensions inside the frame. */
  formProps?: FormDataProps;
  manifest: FolderManifest;
  files?: Record<string, string>;
  sourceProvider?: SourceProvider;
  policy?: RuntimePolicy;
  /** Every frame message except `size` and the form's `change` event, which `PageForm` consumes. */
  onMessage?: (message: FrameMessage) => void;
  onBridge?: (bridge: PageBridge | null) => void;
};

/** Renders a `JsonSchemaForm`, with runtime-compiled extensions, inside a page-runtime frame sized to its content. */
export function PageForm({ schema, value, onChange, extensions, formProps, manifest, files, sourceProvider, policy, onMessage, onBridge, style, ...frame }: PageFormProps) {
  const sources = JSON.stringify([extensions, schemaExtensionSources(schema), manifest, files, sourceProvider, policy]);
  const open = useMemo(() => formPageOpen({ extensions, schema, manifest, ...(files ? { files } : {}), ...(sourceProvider ? { sourceProvider } : {}), ...(policy ? { policy } : {}) }), [sources]);
  const data = useMemo<JsonValue>(() => {
    const next: unknown = { schema, value, props: formProps ?? {} };
    validateJson(next);
    return next;
  }, [schema, value, formProps]);
  const [applied, setApplied] = useState(open);
  const [ready, setReady] = useState(false);
  const [height, setHeight] = useState<number>();
  const [bridge, setBridge] = useState<PageBridge | null>(null);
  const updating = useRef(false);
  const latest = useRef({ data, onChange, onMessage, onError: frame.onError });
  latest.current = { data, onChange, onMessage, onError: frame.onError };

  useEffect(() => {
    if (!ready || !bridge || updating.current || applied === open) return;
    const update = formSourceUpdate({ before: applied, after: open, data: latest.current.data });
    if (!update) { setApplied(open); return; }
    if (update.type === "open") { bridge.send(update); setReady(false); setApplied(open); return; }
    updating.current = true;
    void bridge.request(update).then(() => setApplied(open)).catch((error: unknown) => latest.current.onError(error instanceof Error ? error : new Error(String(error)))).finally(() => { updating.current = false; });
  }, [ready, bridge, applied, open]);

  const receive = (message: FrameMessage) => {
    if (message.type === "size") setHeight(message.height);
    else if (message.type === "emit" && message.event === "change") latest.current.onChange(message.payload);
    else {
      if (message.type === "status" && message.state === "ready") setReady(true);
      latest.current.onMessage?.(message);
    }
  };
  return <PageFrame {...frame} open={applied} data={data} style={{ ...style, ...(height === undefined ? {} : { height }) }} onMessage={receive} onBridge={(next) => { setBridge(next); if (!next) setReady(false); onBridge?.(next); }} />;
}
