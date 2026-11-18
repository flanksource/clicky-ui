import { parse } from "yaml";
import type { JsonValue } from "@flanksource/page-runtime/schema";

type Json = Record<string, JsonValue>;

export type OipaConditionsBundle = { file: string; schema: Json; value: Json; files: Record<string, string> };

const COMMON_REF = /^common\.schema\.yaml(#.*)$/;

/** Reads one file under the env's products folder (PLAYGROUND_OIPA_PRODUCTS_DIR), which the playground server serves. */
async function readEnvFile(path: string): Promise<string> {
  const response = await fetch(`/__playground/oipa-conditions/${path}`);
  const body = await response.text();
  if (!response.ok) throw new Error(`${path}: ${response.status} ${body}`);
  return body;
}

async function readYaml(path: string): Promise<Json> {
  const parsed: unknown = parse(await readEnvFile(path));
  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) throw new Error(`${path} is not a YAML mapping`);
  return parsed as Json;
}

/** Rewrites `common.schema.yaml#/$defs/x` to `#/$defs/x`: the form resolves local refs only. */
function localizeRefs(node: JsonValue): JsonValue {
  if (Array.isArray(node)) return node.map(localizeRefs);
  if (typeof node !== "object" || node === null) return node;
  return Object.fromEntries(
    Object.entries(node).map(([key, value]) => {
      const local = key === "$ref" && typeof value === "string" ? COMMON_REF.exec(value)?.[1] : undefined;
      return [key, local ?? localizeRefs(value)];
    }),
  );
}

/** The family schema with common's `$defs` merged in; a def both files define is an error, not an override. */
export function bundleFamilySchema(args: { family: Json; common: Json }): Json {
  const own = (args.family.$defs ?? {}) as Json;
  const shared = (args.common.$defs ?? {}) as Json;
  const clash = Object.keys(own).filter((name) => name in shared);
  if (clash.length > 0) throw new Error(`family schema and common.schema.yaml both define ${clash.join(", ")}`);
  return localizeRefs({ ...args.family, $defs: { ...shared, ...own } }) as Json;
}

/** A product file with its family schema bundled with common, and the extension modules that schema declares. */
export async function loadOipaConditions(file: string): Promise<OipaConditionsBundle> {
  if (!/^[\w-]+\.yaml$/.test(file)) throw new Error(`product file "${file}" must be a *.yaml name directly under the products folder`);
  const value = await readYaml(file);
  if (typeof value.family !== "string") throw new Error(`${file} has no "family" key, so no family schema to render it with`);
  const [family, common] = await Promise.all([readYaml(`schemas/${value.family}.schema.yaml`), readYaml("schemas/common.schema.yaml")]);
  const schema = bundleFamilySchema({ family, common });
  const declared = (schema["x-clicky-extensions"] ?? []) as { ref?: string }[];
  const refs = declared.map(({ ref }) => {
    if (!ref || ref.startsWith("..") || ref.startsWith("/")) throw new Error(`${value.family}.schema.yaml declares extension ${JSON.stringify(ref)}, which is not a path under schemas/`);
    return ref;
  });
  const sources = await Promise.all(refs.map((ref) => readEnvFile(`schemas/${ref}`)));
  return { file, schema, value, files: Object.fromEntries(refs.map((ref, index) => [ref, sources[index]!])) };
}
