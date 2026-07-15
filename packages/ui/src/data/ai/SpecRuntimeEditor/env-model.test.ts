import { describe, expect, it } from "vitest";
import { envVarFromSecretValue, secretValueFromEnvVar } from "./env-model";

describe("env-model", () => {
  it("maps env vars onto secret selector values", () => {
    expect(
      secretValueFromEnvVar({ valueFrom: "secret://captain-api/token" }),
    ).toEqual({ kind: "secret", name: "captain-api", key: "token" });
    expect(
      secretValueFromEnvVar({ valueFrom: "configmap://runtime/surface" }),
    ).toEqual({ kind: "configmap", name: "runtime", key: "surface" });
    expect(secretValueFromEnvVar({ valueFrom: "raw-string" })).toEqual({
      kind: "value",
      value: "raw-string",
    });
    expect(
      secretValueFromEnvVar({
        valueFrom: { secretKeyRef: { name: "github", key: "token" } },
      }),
    ).toEqual({ kind: "secret", name: "github", key: "token" });
    expect(secretValueFromEnvVar({ value: "demo" })).toEqual({
      kind: "value",
      value: "demo",
    });
    expect(secretValueFromEnvVar({ name: "EMPTY" })).toBeUndefined();
  });

  it("round-trips selector values back into env vars", () => {
    expect(
      envVarFromSecretValue("TOKEN", {
        kind: "secret",
        name: "captain-api",
        key: "token",
      }),
    ).toEqual({ name: "TOKEN", valueFrom: "secret://captain-api/token" });
    expect(
      envVarFromSecretValue("MODE", { kind: "value", value: "demo" }),
    ).toEqual({ name: "MODE", value: "demo" });
    expect(envVarFromSecretValue("EMPTY", undefined)).toEqual({
      name: "EMPTY",
    });
  });
});
