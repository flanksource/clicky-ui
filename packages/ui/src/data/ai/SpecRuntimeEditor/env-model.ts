import type { SecretKeyValue } from "../../../components/SecretKeySelector";
import type { AISpecRuntimeEnvVar } from "../SpecRuntimeEditor.model";

// Maps an env var (string "secret://name/key" form or structured valueFrom)
// onto the SecretKeySelector value shape.
export function secretValueFromEnvVar(
  value: AISpecRuntimeEnvVar,
): SecretKeyValue | undefined {
  if (typeof value.valueFrom === "string") {
    const valueFrom = value.valueFrom.trim();
    for (const kind of ["secret", "configmap"] as const) {
      const prefix = `${kind}://`;
      if (valueFrom.startsWith(prefix)) {
        const [name = "", key = ""] = valueFrom
          .slice(prefix.length)
          .split("/", 2);
        return { kind, name, key };
      }
    }
    return { kind: "value", value: valueFrom };
  }
  if (value.valueFrom?.secretKeyRef) {
    return {
      kind: "secret",
      name: value.valueFrom.secretKeyRef.name ?? "",
      key: value.valueFrom.secretKeyRef.key ?? "",
    };
  }
  if (value.valueFrom?.configMapKeyRef) {
    return {
      kind: "configmap",
      name: value.valueFrom.configMapKeyRef.name ?? "",
      key: value.valueFrom.configMapKeyRef.key ?? "",
    };
  }
  if (value.value !== undefined) return { kind: "value", value: value.value };
  return undefined;
}

export function envVarFromSecretValue(
  name: string,
  next: SecretKeyValue | undefined,
): AISpecRuntimeEnvVar {
  const updated: AISpecRuntimeEnvVar = { name };
  if (next?.kind === "value") {
    updated.value = next.value;
  } else if (next) {
    updated.valueFrom = `${next.kind}://${next.name}/${next.key}`;
  }
  return updated;
}

// Bridges a plain string field (e.g. a checkout connection) onto the
// SecretKeySelector value shape: a "secret://name/key" / "configmap://name/key"
// reference parses into a resource ref, anything else stays a literal value, so
// a bare connection name ("github") round-trips unchanged.
export function secretValueFromString(
  value: string | undefined,
): SecretKeyValue | undefined {
  const trimmed = value?.trim() ?? "";
  for (const kind of ["secret", "configmap"] as const) {
    const prefix = `${kind}://`;
    if (trimmed.startsWith(prefix)) {
      const [name = "", key = ""] = trimmed.slice(prefix.length).split("/", 2);
      return { kind, name, key };
    }
  }
  return trimmed ? { kind: "value", value: trimmed } : undefined;
}

export function stringFromSecretValue(next: SecretKeyValue | undefined): string {
  if (!next) return "";
  if (next.kind === "value") return next.value;
  return `${next.kind}://${next.name}/${next.key}`;
}
