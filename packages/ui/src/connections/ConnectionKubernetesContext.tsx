import { useEffect, useState } from "react";
import type { FieldControl } from "../components/json-schema-form-types";
import { UiNetwork } from "../icons";
import { stripTrailingSlashes } from "../lib/string";
import { DropdownMenu } from "../overlay/DropdownMenu";
import { ConnectionKubernetesField } from "./ConnectionKubernetesField";
import {
  connectionKubernetesSelection,
  kubernetesURL,
} from "./connectionKubernetesSelection";
import type { ConnectionJsonFetcher } from "./connectionSchemaFormExtensions";

type KubernetesKey = "kubeconfig" | "kubecontext";

const FIELDS: Array<{ key: KubernetesKey; label: string; component: string }> = [
  { key: "kubeconfig", label: "Kubeconfig file", component: "k8s-kubeconfig-selector" },
  { key: "kubecontext", label: "Kubecontext", component: "k8s-context-selector" },
];

export type ConnectionKubernetesContextProps = {
  /** The connection being edited; kubeconfig/kubecontext live under `properties`. */
  rootValue: Record<string, unknown>;
  onRootChange: (next: Record<string, unknown>) => void;
  /** Where the commons-db connections service is mounted, e.g. `/api/v1`. */
  apiBase: string;
  fetcher: ConnectionJsonFetcher;
};

/**
 * The Kubernetes context a connection resolves through, as one compact
 * click-to-edit control for a form header: it names the selected kubecontext
 * (or the kubeconfig's current one) and opens the kubeconfig / kubecontext
 * pickers on click. Pair it with `connectionSchemaFormExtensions({ kubernetes:
 * "external" })` so the form does not render the same fields again.
 */
export function ConnectionKubernetesContext({
  rootValue,
  onRootChange,
  apiBase,
  fetcher,
}: ConnectionKubernetesContextProps) {
  const base = `${stripTrailingSlashes(apiBase)}/connections`;
  const selection = connectionKubernetesSelection(rootValue);
  const [current, setCurrent] = useState<string>();
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setError("");
    fetcher<{ currentContext?: string }>(
      kubernetesURL(`${base}/contexts`, { kubeconfig: selection.kubeconfig ?? "" }),
    )
      .then((result) => {
        if (active) setCurrent(result.currentContext);
      })
      .catch((cause: unknown) => {
        if (active) setError(cause instanceof Error ? cause.message : String(cause));
      });
    return () => {
      active = false;
    };
  }, [base, fetcher, selection.kubeconfig]);

  const setProperty = (key: KubernetesKey, next: unknown) => {
    const properties = { ...(rootValue.properties as Record<string, unknown> | undefined) };
    if (typeof next === "string" && next) properties[key] = next;
    else delete properties[key];
    onRootChange({ ...rootValue, properties });
  };

  const contextName = selection.kubecontext || current;
  const label = contextName ?? (error ? "Kubernetes unavailable" : "Current context");
  const summary = [
    `Kubecontext: ${selection.kubecontext || `${current ?? "unknown"} (current)`}`,
    `Kubeconfig: ${selection.kubeconfig || "$KUBECONFIG"}`,
    ...(error ? [error] : []),
  ].join("\n");

  return (
    <DropdownMenu
      role="dialog"
      label={
        <span className="flex min-w-0 items-center gap-1.5">
          <span className="max-w-48 truncate font-mono text-xs">{label}</span>
          {selection.kubeconfig && (
            <span className="max-w-32 truncate text-xs text-muted-foreground">
              {selection.kubeconfig.split("/").pop()}
            </span>
          )}
        </span>
      }
      icon={UiNetwork}
      variant="ghost"
      size="sm"
      align="right"
      title={summary}
      menuLabel="Edit Kubernetes context"
      menuClassName="w-96 max-w-[calc(100vw-2rem)] space-y-3 p-3"
    >
      {() =>
        FIELDS.map(({ key, label: fieldLabel, component }) => {
          const field: FieldControl = {
            key,
            kind: "string",
            label: fieldLabel,
            required: false,
            schema: { type: "string", title: fieldLabel, "x-clicky-component": component },
            value: selection[key] ?? "",
            onChange: (next) => setProperty(key, next),
          };
          return (
            <div key={key} className="space-y-1">
              <span className="text-xs font-medium">{fieldLabel}</span>
              <ConnectionKubernetesField
                field={field}
                context={{ rootValue, onRootChange }}
                base={base}
                fetcher={fetcher}
              />
            </div>
          );
        })
      }
    </DropdownMenu>
  );
}
