import { useCallback, useEffect, useState } from "react";
import { Combobox } from "../components/Combobox";
import { InputField } from "../components/InputField";
import { Button } from "../components/button";
import { UiFileCog, UiNetwork, UiFolder } from "../icons";
import { LocalPathPicker } from "../components/LocalPathPicker";
import {
  isLocalHostname,
  type LocalPathLoader,
} from "../components/local-path";
import type {
  FieldControl,
  PostExtensionContext,
} from "../components/json-schema-form-types";
import type { ConnectionJsonFetcher } from "./connectionSchemaFormExtensions";
import {
  connectionKubernetesSelection,
  kubernetesURL,
} from "./connectionKubernetesSelection";

export function ConnectionKubernetesField({
  field,
  context,
  base,
  fetcher,
}: {
  field: FieldControl;
  context: PostExtensionContext | undefined;
  base: string;
  fetcher: ConnectionJsonFetcher;
}) {
  const selection = connectionKubernetesSelection(context?.rootValue);
  const [contexts, setContexts] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const isContext =
    field.schema["x-clicky-component"] === "k8s-context-selector";
  useEffect(() => {
    if (!isContext) return;
    let active = true;
    setLoading(true);
    setError("");
    setContexts([]);
    fetcher<{ contexts: string[] }>(
      kubernetesURL(`${base}/contexts`, {
        kubeconfig: selection.kubeconfig ?? "",
      }),
    )
      .then((result) => {
        if (active) setContexts(result.contexts);
      })
      .catch((cause: unknown) => {
        if (active)
          setError(cause instanceof Error ? cause.message : String(cause));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [base, fetcher, isContext, selection.kubeconfig]);
  const load: LocalPathLoader = useCallback(
    async (path, signal) => {
      const response = await fetch(
        `${base}/files?path=${encodeURIComponent(path)}`,
        { signal },
      );
      if (!response.ok) throw new Error(await response.text());
      return response.json();
    },
    [base],
  );
  const value = typeof field.value === "string" ? field.value : "";
  const changeFile = (path: string) => {
    if (!context?.onRootChange) {
      field.onChange(path);
      return;
    }
    const properties = context.rootValue?.properties as
      | Record<string, unknown>
      | undefined;
    context.onRootChange({
      ...context.rootValue,
      properties: { ...properties, kubeconfig: path },
    });
  };
  if (isContext)
    return (
      <div className="space-y-2">
        <Combobox
          ariaLabel="Kubecontext"
          label={
            <UiNetwork className="size-4 text-muted-foreground" aria-hidden />
          }
          value={value}
          options={[
            { value: "", label: "Use current context" },
            ...contexts.map((name) => ({ value: name, label: name })),
          ]}
          onChange={field.onChange}
          loading={loading}
          allowCustomValue
        />
        {error && (
          <details className="text-sm text-destructive break-all">
            <summary role="alert">
              Could not load contexts. Check the kubeconfig file path or browse
              for a file.
            </summary>
            <p className="mt-2 text-xs">{error}</p>
          </details>
        )}
        {!loading && !error && value && !contexts.includes(value) && (
          <p role="alert" className="text-sm text-destructive">
            Context “{value}” is not in this kubeconfig. Choose a context or
            check the file.
          </p>
        )}
      </div>
    );
  return (
    <div className="flex min-w-0 items-center gap-2">
      <InputField
        value={value}
        onChange={changeFile}
        aria-label="Kubeconfig file"
        className="min-w-0 flex-1"
        prefix={
          <UiFileCog className="size-4 text-muted-foreground" aria-hidden />
        }
      />
      {typeof window !== "undefined" &&
        isLocalHostname(window.location.hostname) && (
          <Button
            type="button"
            variant="outline"
            aria-label="Browse kubeconfig files"
            title="Browse kubeconfig files"
            onClick={() => setOpen(true)}
          >
            <UiFolder className="size-4" aria-hidden />
          </Button>
        )}
      {open && (
        <LocalPathPicker
          open={open}
          onClose={() => setOpen(false)}
          initialPath={value}
          load={load}
          onSelect={changeFile}
        />
      )}
    </div>
  );
}
