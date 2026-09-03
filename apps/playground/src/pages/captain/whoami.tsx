import { useState } from "react";

import { ReviewVariant } from "../../review/ReviewComponents";
import {
  CapabilityMatrix,
  ProviderLanes,
  ResolutionPath,
} from "./_whoami/approaches";
import { CapabilityTopology } from "./_whoami/topology";

export const meta = {
  title: "Whoami — capability topology",
  description:
    "Provider, runtime, and model availability for Captain's live /whoami page",
  group: "Captain",
};

export default function WhoamiTopology() {
  const [visible, setVisible] = useState(() =>
    new Set(["topology", "matrix", "lanes", "resolution"]),
  );
  const discard = (id: string) =>
    setVisible((current) => {
      const next = new Set(current);
      next.delete(id);
      return next;
    });

  return (
    <div className="space-y-density-6">
      <header className="max-w-4xl space-y-density-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary">
          Captain · /whoami
        </p>
        <h1 className="text-2xl font-semibold tracking-tight">
          Capability topology
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse providers, runtime modes, and models in one hierarchy. Each
          level has an independent availability checkbox, so global provider
          policy, runtime modes, and individual model exclusions remain visible.
        </p>
        <p className="text-sm text-muted-foreground">
          The fixture mirrors the live catalog shape and totals without copying
          local credentials. Select a node to inspect its resolved values; use
          its checkbox to include or exclude it from Captain's effective
          catalog.
        </p>
      </header>

      {visible.has("topology") && (
        <ReviewVariant
          id="whoami-topology"
          title="A · Policy topology"
          verdict="Best for editing inheritance. Provider, runtime, and model policy stay visible as one expandable hierarchy with a resolved-value inspector."
          selected
          onDiscard={() => discard("topology")}
        >
          <CapabilityTopology />
        </ReviewVariant>
      )}
      {visible.has("matrix") && (
        <ReviewVariant
          id="whoami-matrix"
          title="B · Capability matrix"
          verdict="Best for fleet comparison. Providers are rows and runtime modes are stable columns, making missing or disabled adapters immediately obvious."
          onDiscard={() => discard("matrix")}
        >
          <CapabilityMatrix />
        </ReviewVariant>
      )}
      {visible.has("lanes") && (
        <ReviewVariant
          id="whoami-provider-lanes"
          title="C · Provider lanes"
          verdict="Best for ownership and setup. Each provider becomes a self-contained lane containing its authentication, runtime adapters, and representative models."
          onDiscard={() => discard("lanes")}
        >
          <ProviderLanes />
        </ReviewVariant>
      )}
      {visible.has("resolution") && (
        <ReviewVariant
          id="whoami-resolution-path"
          title="D · Resolution path"
          verdict="Best for explaining one choice. It traces a selected model through provider policy, runtime readiness, model policy, and the resulting Captain catalog entry."
          onDiscard={() => discard("resolution")}
        >
          <ResolutionPath />
        </ReviewVariant>
      )}
    </div>
  );
}
