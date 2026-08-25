import { modeForBackend, type SpecRuntimeFamily } from "./runtime-mode";

export type RuntimeFieldSupport = (path: string) => boolean;

export const SUPPORT_ALL_RUNTIME_FIELDS: RuntimeFieldSupport = () => true;

export function runtimeFieldSupport(
  families: SpecRuntimeFamily[],
  backend: string,
): RuntimeFieldSupport {
  const selected = modeForBackend(families, backend);
  if (!selected) {
    throw new Error(
      `runtime backend ${JSON.stringify(backend)} is missing from the catalog`,
    );
  }
  if (!selected.arguments) return SUPPORT_ALL_RUNTIME_FIELDS;

  const selectedSources = argumentSources(selected.arguments);
  const knownSources = argumentSources(
    families.flatMap((family) =>
      family.modes.flatMap((mode) => mode.arguments ?? []),
    ),
  );
  return (path) =>
    !knownSources.some((source) => relatedPath(source, path)) ||
    selectedSources.some((source) => relatedPath(source, path));
}

function argumentSources(
  mappings: NonNullable<SpecRuntimeFamily["modes"][number]["arguments"]>,
): string[] {
  return mappings.flatMap((mapping) =>
    (mapping.source ?? "")
      .split("|")
      .map((source) => source.trim())
      .filter(Boolean),
  );
}

function relatedPath(source: string, path: string): boolean {
  return (
    source === path ||
    source.startsWith(`${path}.`) ||
    path.startsWith(`${source}.`)
  );
}
