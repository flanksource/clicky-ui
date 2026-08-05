import { useEffect, useState } from "react";
import type { ChatModel } from "../chat/types";
import {
  familiesFromRuntimeCatalog,
  type RuntimeCatalogFamily,
  type SpecRuntimeFamily,
} from "../runtime/runtime-mode";

export type ChatWindowCatalogOptions = {
  models?: ChatModel[] | undefined;
  modelsApi?: string | null | undefined;
  runtimesApi?: string | null | undefined;
};

export type ChatWindowCatalogs = {
  models: ChatModel[];
  runtimeFamilies?: SpecRuntimeFamily[] | undefined;
  loading: boolean;
  error: string | null;
  retry: () => void;
};

export function useChatWindowCatalogs({
  models: providedModels,
  modelsApi,
  runtimesApi,
}: ChatWindowCatalogOptions): ChatWindowCatalogs {
  const [models, setModels] = useState<ChatModel[]>(providedModels ?? []);
  const [runtimes, setRuntimes] = useState<RuntimeCatalogFamily[]>();
  const [modelsLoading, setModelsLoading] = useState(false);
  const [runtimesLoading, setRuntimesLoading] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);
  const [runtimesError, setRuntimesError] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (providedModels) setModels(providedModels);
  }, [providedModels]);

  useEffect(() => {
    if (providedModels || !modelsApi) return;
    let active = true;
    setModelsLoading(true);
    setModelsError(null);
    void loadCatalog<ChatModel[]>(modelsApi, "models")
      .then((data) => {
        if (active) setModels(data);
      })
      .catch((cause) => {
        if (active) setModelsError(errorMessage("model", cause));
      })
      .finally(() => {
        if (active) setModelsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt, modelsApi, providedModels]);

  useEffect(() => {
    if (!runtimesApi) return;
    let active = true;
    setRuntimesLoading(true);
    setRuntimesError(null);
    void loadCatalog<RuntimeCatalogFamily[]>(runtimesApi, "runtimes")
      .then((data) => {
        if (active) setRuntimes(data);
      })
      .catch((cause) => {
        if (active) setRuntimesError(errorMessage("runtime", cause));
      })
      .finally(() => {
        if (active) setRuntimesLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attempt, runtimesApi]);

  return {
    models,
    ...(runtimes
      ? { runtimeFamilies: familiesFromRuntimeCatalog(runtimes) }
      : {}),
    loading: modelsLoading || runtimesLoading,
    error: [modelsError, runtimesError].filter(Boolean).join(" ") || null,
    retry: () => setAttempt((current) => current + 1),
  };
}

async function loadCatalog<T>(endpoint: string, label: string): Promise<T> {
  const response = await fetch(endpoint);
  if (!response.ok) throw new Error(`${label} ${response.status}`);
  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    throw new Error(`${label} response must be an array`);
  }
  return data as T;
}

function errorMessage(kind: string, cause: unknown): string {
  const detail = cause instanceof Error ? cause.message : String(cause);
  return `Unable to load ${kind} availability (${detail}). Check Captain and retry.`;
}
