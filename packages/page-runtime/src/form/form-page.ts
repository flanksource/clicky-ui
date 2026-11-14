import type { FormExtensionSource } from "@flanksource/clicky-ui/components";
import type { FolderManifest, JsonValue, OpenMessage, RuntimePolicy, SourceProvider } from "../schema.ts";
import { validateSourcePath } from "../host/validation.ts";
import { formEntrySource } from "./entry-source.ts";

/** An extension module, inline TSX or a `ref` path: clicky-ui's definition, re-exported so there is one. */
export type { FormExtensionSource };

export const FORM_ENTRY = "__form/entry.tsx";
export const SCHEMA_EXTENSIONS_KEYWORD = "x-clicky-extensions";
const CLICKY_UI = "@flanksource/clicky-ui";
const SCRIPT = /\.[cm]?[jt]sx?$/;
const isReserved = (path: string) => path === FORM_ENTRY || /^__form\/ext-\d+\.tsx$/.test(path);

/** The sources a schema declares in its root `x-clicky-extensions`, validated for shape; none when the keyword is absent. */
export function schemaExtensionSources(schema: JsonValue | undefined): FormExtensionSource[] {
  if (schema === null || schema === undefined || typeof schema !== "object" || Array.isArray(schema)) return [];
  const declared = schema[SCHEMA_EXTENSIONS_KEYWORD];
  if (declared === undefined) return [];
  if (!Array.isArray(declared)) throw new Error(`schema ${SCHEMA_EXTENSIONS_KEYWORD} must be an array of { tsx, name? } or { ref } sources`);
  return declared.map((source, index) => {
    const where = `schema ${SCHEMA_EXTENSIONS_KEYWORD}[${index}]`;
    if (source === null || typeof source !== "object" || Array.isArray(source)) throw new Error(`${where} must be an object`);
    const keys = Object.keys(source);
    if ("ref" in source) {
      if (typeof source.ref !== "string" || keys.some((key) => key !== "ref")) throw new Error(`${where} must be { ref: string } with no other keys`);
      return { ref: source.ref };
    }
    if (typeof source.tsx !== "string" || keys.some((key) => key !== "tsx" && key !== "name") || (source.name !== undefined && typeof source.name !== "string")) throw new Error(`${where} must be { tsx: string, name?: string } or { ref: string }`);
    return typeof source.name === "string" ? { tsx: source.tsx, name: source.name } : { tsx: source.tsx };
  });
}

/**
 * Builds the `open` message for a page that renders a `JsonSchemaForm` with runtime-compiled extensions. Pure: inline
 * sources become `__form/ext-<i>.tsx`, refs stay relative paths the host's `files` or the worker's `sourceProvider`
 * must serve, and `__form/entry.tsx` imports every extension's default export. Sources the `schema` declares in
 * `x-clicky-extensions` follow `extensions`, so a source's index in the combined list fixes its file name.
 */
export function formPageOpen(options: { extensions: FormExtensionSource[]; schema?: JsonValue; manifest: FolderManifest; files?: Record<string, string>; sourceProvider?: SourceProvider; policy?: RuntimePolicy }): OpenMessage {
  const { extensions, manifest, sourceProvider, policy } = options;
  const files = { ...options.files };
  if (!manifest.dependencies[CLICKY_UI]) throw new Error(`formPageOpen: manifest.dependencies must declare ${CLICKY_UI}; the generated form page imports it`);
  for (const path of Object.keys(files)) if (isReserved(path)) throw new Error(`formPageOpen: files.${path} is reserved for the generated form page`);
  const declared = schemaExtensionSources(options.schema);
  const resolve = (extension: FormExtensionSource, index: number, where: string) => {
    if ("ref" in extension) {
      validateSourcePath(extension.ref);
      if (!SCRIPT.test(extension.ref)) throw new Error(`formPageOpen: ${where} ref ${extension.ref} must be a JavaScript/TypeScript source`);
      if (Object.hasOwn(files, extension.ref)) return { specifier: `../${extension.ref}`, label: extension.ref };
      if (!sourceProvider?.paths.includes(extension.ref)) throw new Error(`formPageOpen: ${where} ref ${extension.ref} is served by neither files nor sourceProvider.paths`);
      // The worker roots sourceProvider paths in the page's directory (`__form/`), not at the files root.
      return { specifier: `./${extension.ref}`, label: extension.ref };
    }
    if (!extension.tsx.trim()) throw new Error(`formPageOpen: ${where} has an empty tsx source`);
    files[`__form/ext-${index}.tsx`] = extension.tsx;
    return { specifier: `./ext-${index}.tsx`, label: extension.name ?? `inline-${index}` };
  };
  const host = extensions.map((extension, index) => resolve(extension, index, `extension ${index}`));
  const fromSchema = declared.map((extension, index) => resolve(extension, extensions.length + index, `schema ${SCHEMA_EXTENSIONS_KEYWORD}[${index}]`));
  files[FORM_ENTRY] = formEntrySource({ host, declared: fromSchema });
  return { page: FORM_ENTRY, manifest, files, ...(sourceProvider ? { sourceProvider } : {}), ...(policy ? { policy } : {}) };
}
