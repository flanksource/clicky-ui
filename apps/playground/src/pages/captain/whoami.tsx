import { CapabilityTopology } from "./_whoami/topology";

export const meta = {
  title: "Whoami — capability topology",
  description:
    "Provider, runtime, and model availability for Captain's live /whoami page",
  group: "Captain",
};

export default function WhoamiTopology() {
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

      <CapabilityTopology />
    </div>
  );
}
