import type { SecretKeyValue, SecretKind } from "./SecretKeySelector";

// serializeSecretRef lowers a value into the single reference string the backend
// EnvVar.Scan understands: secret://name/key, configmap://name/key,
// helm://name/key, serviceaccount://name, an op:// reference, or a bare literal.
export function serializeSecretRef(value: SecretKeyValue | undefined): string {
  if (!value) return "";
  switch (value.kind) {
    case "value":
      return value.value;
    case "onepassword":
      return value.ref;
    case "serviceaccount":
      return value.name ? `serviceaccount://${value.name}` : "";
    default:
      return `${value.kind}://${value.name}/${value.key}`;
  }
}

// parseSecretRef is the inverse of serializeSecretRef: any unrecognised string
// (including an empty one that still carries text) is treated as a literal.
export function parseSecretRef(raw: unknown): SecretKeyValue | undefined {
  if (typeof raw !== "string" || raw === "") return undefined;
  if (raw.startsWith("op://")) return { kind: "onepassword", ref: raw };
  const saPrefix = "serviceaccount://";
  if (raw.startsWith(saPrefix)) return { kind: "serviceaccount", name: raw.slice(saPrefix.length) };
  for (const kind of ["secret", "configmap", "helm"] as const satisfies readonly SecretKind[]) {
    const prefix = `${kind}://`;
    if (raw.startsWith(prefix)) {
      const [name = "", key = ""] = raw.slice(prefix.length).split("/", 2);
      return { kind, name, key };
    }
  }
  return { kind: "value", value: raw };
}
