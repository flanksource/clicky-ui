import { useEffect, useRef, useState } from "react";
import type { FormExtension, FormExtensionSource } from "./json-schema-form-extension-api";
import type { JsonSchemaObject } from "./json-schema-form-types";

export const MISSING_EXTENSION_LOADER =
  "schema declares x-clicky-extensions but no extensionLoader was provided; render it with PageForm or pass extensionLoader";

type ExtensionLoader = (source: FormExtensionSource, index: number) => Promise<FormExtension>;

const NO_EXTENSIONS: FormExtension[] = [];

type Settled = { key: string; extensions: FormExtension[] } | { key: string; error: unknown };

// withoutExtensionSources returns the schema without its root `x-clicky-extensions`,
// so nothing that walks the schema sees the keyword. A schema without it is
// returned as is.
export function withoutExtensionSources(schema: JsonSchemaObject): JsonSchemaObject {
  if (!("x-clicky-extensions" in schema)) return schema;
  const { "x-clicky-extensions": _declared, ...rest } = schema;
  return rest;
}

// useSchemaExtensions loads the sources a schema declares through `loader`, once
// per JSON of the declared list (the loader is read through a ref, so an inline
// function does not reload on every render). It returns the loaded extensions,
// or undefined while they load. A schema that declares sources with no loader
// throws, and a rejected load is rethrown here, during render.
export function useSchemaExtensions(
  declared: FormExtensionSource[] | undefined,
  loader: ExtensionLoader | undefined,
): FormExtension[] | undefined {
  const key = JSON.stringify(declared ?? []);
  const hasSources = declared !== undefined && declared.length > 0;
  const loaderRef = useRef(loader);
  loaderRef.current = loader;
  const [settled, setSettled] = useState<Settled>();
  const load = hasSources && loader !== undefined;

  useEffect(() => {
    if (!load) return;
    let cancelled = false;
    const sources = JSON.parse(key) as FormExtensionSource[];
    Promise.all(sources.map((source, index) => loaderRef.current!(source, index))).then(
      (extensions) => !cancelled && setSettled({ key, extensions }),
      (error: unknown) => !cancelled && setSettled({ key, error }),
    );
    return () => {
      cancelled = true;
    };
  }, [key, load]);

  if (!hasSources) return NO_EXTENSIONS;
  if (!loader) throw new Error(MISSING_EXTENSION_LOADER);
  if (settled?.key !== key) return undefined;
  if ("error" in settled) throw settled.error;
  return settled.extensions;
}
