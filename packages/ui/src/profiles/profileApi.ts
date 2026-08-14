/**
 * Boot-time configuration: where the profile engine is mounted, and the schema
 * that describes a profile.
 *
 * Both are the host's to supply. The components talk to commons-db's profile
 * service — sampling a draft, evaluating a JSONPath against a sampled row,
 * browsing a connection's catalog — and every host mounts that service
 * somewhere; a library that hardcodes one host's prefix is broken for the next.
 * The schema is generated from commons-db's Go types, so it ships with the
 * server, not with this package: vendoring a copy here would silently drift
 * from the source of truth the server validates against.
 *
 * This is module state rather than a React context on purpose: both values are
 * one per application, fixed before the first render, and read from plain
 * functions (browserBaseUrl, profileSchemaProjection) as well as components.
 * Threading a context through the whole tree would buy nothing a single
 * boot-time call does not.
 */

import type {
  JsonSchemaObject,
  PostExtension,
  PreExtension,
} from "../components/json-schema-form-types";
import { stripTrailingSlashes } from "../lib/string";
import type { CelEvaluator } from "./cel/celExpression";

/** ProfileSchema is commons-db's profile.json, with its $defs preserved. */
export type ProfileSchema = JsonSchemaObject & {
  $defs?: Record<string, JsonSchemaObject>;
};

/**
 * The host's form extensions, as JsonSchemaForm takes them.
 *
 * They belong to the host for the same reason the schema does: the generator
 * emits `x-clicky-component` hints — a namespace picker, a secret selector, a
 * CEL editor, a processor pipeline — that name widgets only the application can
 * supply. Without them the editor renders the raw control for a field the schema
 * explicitly asked to be rendered some other way.
 */
export type ProfileFormExtensions = {
  pre?: PreExtension[];
  post?: PostExtension[];
};

const DEFAULT_BASE = "/api/v1";

let base = DEFAULT_BASE;
let schema: ProfileSchema | null = null;
let formExtensions: Required<ProfileFormExtensions> = { pre: [], post: [] };
let evaluator: CelEvaluator | null = null;

/**
 * configureProfiles points the components at a mount, gives them the profile
 * schema, and registers the host's form extensions. Call it once at startup,
 * before rendering.
 *
 * basePath defaults to /api/v1 and may be omitted by a host that mounts there.
 * schema has no default: the editor cannot describe a profile it has no schema
 * for, and inventing one would disagree with the server that validates it.
 * formExtensions defaults to none, which renders every field with the built-in
 * control.
 */
export function configureProfiles(options: {
  basePath?: string;
  schema: ProfileSchema;
  formExtensions?: ProfileFormExtensions;
  celEvaluator?: CelEvaluator;
}): void {
  if (options.basePath !== undefined) {
    const trimmed = stripTrailingSlashes(options.basePath.trim());
    if (!trimmed.startsWith("/")) {
      throw new Error(
        `profile API basePath must start with "/", got ${JSON.stringify(options.basePath)}`,
      );
    }
    base = trimmed;
  }
  schema = options.schema;
  // Assigned rather than merged, so a second call is a full reconfiguration and
  // not an accumulation of every list ever registered.
  formExtensions = {
    pre: options.formExtensions?.pre ?? [],
    post: options.formExtensions?.post ?? [],
  };
  evaluator = options.celEvaluator ?? null;
}

/**
 * celEvaluator is the host's expression backend, or null for the built-in POST
 * to the profile service. Read at call time for the same reason the extensions
 * are: configuration happens after this module is evaluated.
 */
export function celEvaluator(): CelEvaluator | null {
  return evaluator;
}

/**
 * profileFormExtensions is what every profile form renders with.
 *
 * Read at render rather than captured, so a host that configures after module
 * evaluation — the normal order, since main.tsx calls configureProfiles before
 * mounting — is still honoured.
 */
export function profileFormExtensions(): Required<ProfileFormExtensions> {
  return formExtensions;
}

/** profileApiBase is the configured mount point, without a trailing slash. */
export function profileApiBase(): string {
  return base;
}

/**
 * profileApiPath joins a service-relative path onto the mount point, e.g.
 * profileApiPath("profile/sample") -> "/api/v1/profile/sample".
 */
export function profileApiPath(suffix: string): string {
  return `${base}/${suffix.replace(/^\/+/, "")}`;
}

/**
 * profileSchema is the configured schema. It throws rather than returning an
 * empty document: a form rendered from a missing schema shows no fields at all,
 * which reads as "this profile has nothing to configure" instead of as the
 * setup error it is.
 */
export function profileSchema(): ProfileSchema {
  if (!schema) {
    throw new Error(
      "profile schema is not configured — call configureProfiles({ schema }) before rendering the profile editor",
    );
  }
  return schema;
}
