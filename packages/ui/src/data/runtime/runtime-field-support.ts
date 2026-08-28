import { modeForBackend, type SpecRuntimeFamily } from "./runtime-mode";

export type RuntimeFieldSupport = (path: string) => boolean;

const RUNTIME_SCHEMA_SECTIONS = [
  "model",
  "prompt",
  "workspace",
  "sandbox",
  "permissions",
  "environment",
  "cli",
] as const;

export type RuntimeSchemaSection = (typeof RUNTIME_SCHEMA_SECTIONS)[number];

export const SUPPORT_ALL_RUNTIME_FIELDS: RuntimeFieldSupport = () => true;

export function runtimeFieldSupport(
  families: SpecRuntimeFamily[],
  backend: string,
  preferredFamily?: string | undefined,
): RuntimeFieldSupport {
  const selected = modeForBackend(families, backend, preferredFamily);
  if (!selected) {
    throw new Error(
      `runtime backend ${JSON.stringify(backend)} is missing from the catalog`,
    );
  }
  const schema = selected.schema;
  if (!schema) return SUPPORT_ALL_RUNTIME_FIELDS;
  return (path) => schemaHasPath(schema, path);
}

export function runtimeFieldSection(
  families: SpecRuntimeFamily[],
  backend: string,
  path: string,
  preferredFamily?: string | undefined,
): RuntimeSchemaSection | undefined {
  const selected = modeForBackend(families, backend, preferredFamily);
  if (!selected) {
    throw new Error(
      `runtime backend ${JSON.stringify(backend)} is missing from the catalog`,
    );
  }
  if (!selected.schema) return undefined;
  const section = runtimeSchemaPropertyAtPath(selected.schema, path)?.[
    "x-clicky-section"
  ];
  if (section == null || section === "") return undefined;
  if (!isRuntimeSchemaSection(section)) {
    throw new Error(
      `runtime field ${JSON.stringify(path)} has invalid x-clicky-section ${JSON.stringify(section)}`,
    );
  }
  return section;
}

function isRuntimeSchemaSection(value: unknown): value is RuntimeSchemaSection {
  return RUNTIME_SCHEMA_SECTIONS.some((section) => section === value);
}

function schemaHasPath(
  schema: NonNullable<SpecRuntimeFamily["modes"][number]["schema"]>,
  path: string,
): boolean {
  return runtimeSchemaPropertyAtPath(schema, path) != null;
}

export function runtimeSchemaPropertyAtPath(
  schema: NonNullable<SpecRuntimeFamily["modes"][number]["schema"]>,
  path: string,
) {
  let current = schema;
  for (const part of path.split(".")) {
    const property = current.properties?.[part];
    if (!property) return undefined;
    current = property;
  }
  return current;
}
