export interface KubernetesSelection {
  kubeconfig?: string;
  kubecontext?: string;
}

export function connectionKubernetesSelection(
  root?: Record<string, unknown>,
): KubernetesSelection {
  const properties = root?.properties as Record<string, unknown> | undefined;
  return {
    ...(typeof properties?.kubeconfig === "string"
      ? { kubeconfig: properties.kubeconfig }
      : {}),
    ...(typeof properties?.kubecontext === "string"
      ? { kubecontext: properties.kubecontext }
      : {}),
  };
}

export function kubernetesURL(
  path: string,
  selection: KubernetesSelection,
): string {
  const [pathname, query] = path.split("?", 2);
  const params = new URLSearchParams(query);
  if (selection.kubeconfig) params.set("kubeconfig", selection.kubeconfig);
  if (selection.kubecontext) params.set("kubecontext", selection.kubecontext);
  return params.size ? `${pathname}?${params}` : path;
}
