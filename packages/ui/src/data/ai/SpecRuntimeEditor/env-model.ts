import {
  parseSecretRef,
  serializeSecretRef,
} from "../../../components/SecretKeySelector.model";
import type { SecretKeyValue } from "../../../components/SecretKeySelector";
import type { AISpecRuntimeEnvVar } from "../SpecRuntimeEditor.model";

// Maps an env var (string "secret://name/key" form or structured valueFrom)
// onto the SecretKeySelector value shape.
export function secretValueFromEnvVar(
  value: AISpecRuntimeEnvVar,
): SecretKeyValue | undefined {
  if (typeof value.valueFrom === "string") {
    return parseSecretRef(value.valueFrom.trim());
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
    updated.valueFrom = serializeSecretRef(next);
  }
  return updated;
}

// Bridges a plain string field (e.g. a checkout connection) onto the
// SecretKeySelector value shape: a reference (secret://, configmap://, helm://,
// serviceaccount://, op://) parses into its ref shape, anything else stays a
// literal value, so a bare connection name ("github") round-trips unchanged.
export function secretValueFromString(
  value: string | undefined,
): SecretKeyValue | undefined {
  return parseSecretRef(value?.trim() ?? "");
}

export function stringFromSecretValue(next: SecretKeyValue | undefined): string {
  return serializeSecretRef(next);
}
