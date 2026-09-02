export type RuntimeMode = "api" | "cli" | "agent" | "cmux";

export type RuntimeModel = {
  id: string;
  label: string;
  enabled: boolean;
  releaseDate?: string;
  capabilities?: string[];
  efforts?: string[];
};

export type RuntimeAdapter = {
  provider: string;
  providerLabel: string;
  mode: RuntimeMode;
  auth: string;
  identity?: string;
  binary?: string;
  ready: boolean;
  disabled: boolean;
  disabledBy?: string;
  isDefault?: boolean;
  modelCount: number;
  models: RuntimeModel[];
};

export type RuntimeSummary = {
  adapters: number;
  ready: number;
  models: number;
  disabled: number;
};

export type RuntimeProvider = {
  id: string;
  label: string;
  adapters: RuntimeAdapter[];
  modelCount: number;
  disabled: number;
};

export type ProviderIconName = "anthropic" | "openai" | "gemini" | "deepseek";

export function runtimeKey(adapter: RuntimeAdapter): string {
  return `${adapter.provider}:${adapter.mode}`;
}

export function runtimeLabel(adapter: RuntimeAdapter): string {
  return `${adapter.providerLabel} ${adapter.mode.toUpperCase()}`;
}

export function runtimeModelKey(
  adapter: RuntimeAdapter,
  modelId: string,
): string {
  return `${runtimeKey(adapter)}:${modelId}`;
}

export function providerIconName(providerId: string): ProviderIconName {
  switch (providerId) {
    case "anthropic":
    case "openai":
    case "gemini":
    case "deepseek":
      return providerId;
    default:
      throw new Error(`No provider logo is registered for ${providerId}`);
  }
}

export function summarizeRuntimes(adapters: RuntimeAdapter[]): RuntimeSummary {
  return adapters.reduce<RuntimeSummary>(
    (summary, adapter) => ({
      adapters: summary.adapters + 1,
      ready: summary.ready + Number(adapter.ready),
      models: summary.models + adapter.modelCount,
      disabled: summary.disabled + Number(adapter.disabled),
    }),
    { adapters: 0, ready: 0, models: 0, disabled: 0 },
  );
}

export function groupRuntimesByProvider(
  adapters: RuntimeAdapter[],
): RuntimeProvider[] {
  const providers = new Map<string, RuntimeProvider>();
  for (const adapter of adapters) {
    const provider = providers.get(adapter.provider);
    if (provider) {
      if (provider.label !== adapter.providerLabel) {
        throw new Error(
          `Runtime provider ${adapter.provider} has conflicting labels: ${provider.label} and ${adapter.providerLabel}`,
        );
      }
      provider.adapters.push(adapter);
      provider.modelCount += adapter.modelCount;
      provider.disabled += Number(adapter.disabled);
    } else {
      providers.set(adapter.provider, {
        id: adapter.provider,
        label: adapter.providerLabel,
        adapters: [adapter],
        modelCount: adapter.modelCount,
        disabled: Number(adapter.disabled),
      });
    }
  }
  return [...providers.values()];
}
