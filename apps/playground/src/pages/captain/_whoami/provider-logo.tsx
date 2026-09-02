import { ResourceIcon as ProviderIcon } from "@flanksource/icons/icon";

import { providerIconName, type RuntimeProvider } from "./topology-model";

export function ProviderLogo({ provider }: { provider: RuntimeProvider }) {
  return (
    <span
      data-provider-icon={provider.id}
      className="grid size-8 shrink-0 place-items-center rounded-md border border-border bg-background"
    >
      <ProviderIcon
        primary={providerIconName(provider.id)}
        className="size-5"
        alt=""
      />
    </span>
  );
}
