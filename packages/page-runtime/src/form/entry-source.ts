/** Echoed values the entry remembers while waiting for the host to send them back; bounds memory when a host never does. */
export const PENDING_ECHO_LIMIT = 64;

/** A module the generated entry imports: its specifier from `__form/` and the label used in error messages. */
type ModuleRef = { specifier: string; label: string };

/**
 * The source text of `__form/entry.tsx`. Host sources go through the form's `extensions` prop; sources the schema
 * declares in `x-clicky-extensions` go only through `extensionLoader`, by their index in the declared list, so nothing
 * registers twice. It runs inside the frame, so it can only import what the page's lock resolves:
 * react, clicky-ui and the extension modules. Each extension's default export is validated when the module loads, so a
 * bad export fails the page loudly instead of being ignored.
 *
 * The page keeps the form value in local state for typing latency and emits every change to the host. The host's
 * `data.value` replaces the local value only when it is not one of the values this page emitted and has not yet seen
 * echoed back, which is what prevents an echo loop.
 */
export function formEntrySource(options: { host: ModuleRef[]; declared: ModuleRef[] }): string {
  const imports = [
    ...options.host.map(({ specifier }, index) => `import extension${index} from ${JSON.stringify(specifier)};`),
    ...options.declared.map(({ specifier }, index) => `import declared${index} from ${JSON.stringify(specifier)};`),
  ].join("\n");
  const list = options.host.map(({ label }, index) => `[extension${index}, ${JSON.stringify(label)}]`).join(", ");
  const declaredList = options.declared.map(({ label }, index) => `[declared${index}, ${JSON.stringify(label)}]`).join(", ");
  return `import { useState } from "react";
import { JsonSchemaForm } from "@flanksource/clicky-ui/components";
${imports}

const PENDING_ECHO_LIMIT = ${PENDING_ECHO_LIMIT};
const isObject = (value) => Boolean(value) && typeof value === "object" && !Array.isArray(value);

function assertFormExtension(value, label) {
  const where = "form extension " + label + ": ";
  if (!isObject(value)) throw new Error(where + "the default export must be a FormExtension object (use defineFormExtension)");
  if (typeof value.name !== "string" || !value.name) throw new Error(where + "name must be a non-empty string");
  for (const key of ["pre", "post"]) {
    if (value[key] !== undefined && (!Array.isArray(value[key]) || value[key].some((hook) => typeof hook !== "function"))) throw new Error(where + key + " must be an array of functions");
  }
  for (const key of ["formats", "lookups", "layouts", "slots"]) {
    if (value[key] !== undefined && !isObject(value[key])) throw new Error(where + key + " must be an object");
  }
  return value;
}

const extensions = [${list}].map(([value, label]) => assertFormExtension(value, label));
const schemaExtensions = [${declaredList}].map(([value, label]) => assertFormExtension(value, label));
const loadSchemaExtension = (_source, index) => index >= 0 && index < schemaExtensions.length
  ? Promise.resolve(schemaExtensions[index])
  : Promise.reject(new Error("schema-declared form extension " + index + " was not compiled into this page (it has " + schemaExtensions.length + ")"));

export default function FormPage({ data, host }) {
  if (!isObject(data) || !isObject(data.schema) || !("value" in data)) throw new Error("form page data must be { schema, value, props }");
  const incoming = JSON.stringify(data.value);
  const [form, setForm] = useState(() => ({ local: data.value, seen: incoming, pending: [] }));
  let current = form;
  if (current.seen !== incoming) {
    const echoed = current.pending.indexOf(incoming);
    current = echoed >= 0 ? { ...current, seen: incoming, pending: current.pending.slice(echoed + 1) } : { local: data.value, seen: incoming, pending: [] };
    setForm(current);
  }
  const onChange = (next) => {
    host.emit("change", next);
    setForm((state) => ({ ...state, local: next, pending: [...state.pending, JSON.stringify(next)].slice(-PENDING_ECHO_LIMIT) }));
  };
  return <JsonSchemaForm {...data.props} schema={data.schema} value={current.local} extensions={extensions} extensionLoader={loadSchemaExtension} onChange={onChange} />;
}
`;
}
