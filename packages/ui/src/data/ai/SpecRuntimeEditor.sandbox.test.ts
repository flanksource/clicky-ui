import { describe, expect, it } from "vitest";

import { compactAISpecRuntime } from "./SpecRuntimeEditor.model";
import {
  sandboxRef,
  withSandbox,
  withSandboxBackend,
  withSandboxPolicy,
} from "./SpecRuntimeEditor/update";

// Regression coverage for a silent data loss: AISpecRuntimeSpec had no
// `sandbox` field, and compactAISpecRuntime rebuilds the spec field-by-field,
// so opening a .prompt carrying `sandbox:` in the workbench and saving it
// dropped the sandbox entirely.
describe("compactAISpecRuntime sandbox", () => {
  it("preserves the scalar shorthand instead of rewriting it as a mapping", () => {
    // api.SandboxRef marshals a backend-only ref as a scalar, so a prompt
    // written `sandbox: git-agent` must come back out the same way.
    expect(compactAISpecRuntime({ sandbox: "git-agent" }).sandbox).toBe(
      "git-agent",
    );
    expect(
      compactAISpecRuntime({ sandbox: { backend: "git-agent" } }).sandbox,
    ).toBe("git-agent");
  });

  it("preserves a pinned agent and policy in object form", () => {
    expect(
      compactAISpecRuntime({
        sandbox: {
          backend: "prod-pool",
          agent: "worker-01",
          policy: { paths: ["pkg/**", "!**/*.pem"], maxAttempts: 3 },
        },
      }).sandbox,
    ).toEqual({
      backend: "prod-pool",
      agent: "worker-01",
      policy: { paths: ["pkg/**", "!**/*.pem"], maxAttempts: 3 },
    });
  });

  it("drops a ref that resolves to nothing", () => {
    // api.SandboxRef.Validate rejects an empty backend and refuses overrides
    // with no backend to apply them to.
    expect(compactAISpecRuntime({ sandbox: "" }).sandbox).toBeUndefined();
    expect(compactAISpecRuntime({ sandbox: "   " }).sandbox).toBeUndefined();
    expect(compactAISpecRuntime({ sandbox: {} }).sandbox).toBeUndefined();
    expect(
      compactAISpecRuntime({ sandbox: { agent: "worker-01" } }).sandbox,
    ).toBeUndefined();
    expect(compactAISpecRuntime({}).sandbox).toBeUndefined();
  });

  it("drops empty policy values rather than emitting a hollow policy", () => {
    expect(
      compactAISpecRuntime({
        sandbox: {
          backend: "prod-pool",
          agent: "  ",
          policy: { paths: ["  ", ""], maxAttempts: 0 },
        },
      }).sandbox,
    ).toBe("prod-pool");
  });

  it("rejects a negative attempt bound, which Validate refuses", () => {
    expect(
      compactAISpecRuntime({
        sandbox: { backend: "prod-pool", policy: { maxAttempts: -1 } },
      }).sandbox,
    ).toBe("prod-pool");
  });
});

describe("sandbox mutators", () => {
  it("reads either stored form through one accessor", () => {
    expect(sandboxRef({ sandbox: "srt" })).toEqual({ backend: "srt" });
    expect(sandboxRef({ sandbox: { backend: "srt", agent: "a" } })).toEqual({
      backend: "srt",
      agent: "a",
    });
    expect(sandboxRef({})).toEqual({});
  });

  it("discards overrides when the adapter changes", () => {
    // An agent enrolled on one git-agent backend does not exist on another, so
    // carrying the pin across would only fail later, at dispatch.
    const pinned = withSandbox(
      { sandbox: { backend: "prod-pool" } },
      { agent: "worker-01", policy: { maxAttempts: 3 } },
    );
    expect(sandboxRef(withSandboxBackend(pinned, "srt"))).toEqual({
      backend: "srt",
    });
  });

  it("clears the whole ref when the backend is cleared", () => {
    const pinned = withSandbox(
      {},
      { backend: "prod-pool", agent: "worker-01" },
    );
    expect(withSandboxBackend(pinned, "").sandbox).toBeUndefined();
    // Overrides with no backend resolve to nothing, so patching the backend
    // away drops them too rather than leaving an unusable ref.
    expect(withSandbox(pinned, { backend: "" }).sandbox).toBeUndefined();
  });

  it("patches the policy without disturbing the rest of the ref", () => {
    const value = withSandboxPolicy(
      { sandbox: { backend: "prod-pool", agent: "worker-01" } },
      { paths: ["pkg/**"] },
    );
    expect(sandboxRef(value)).toEqual({
      backend: "prod-pool",
      agent: "worker-01",
      policy: { paths: ["pkg/**"] },
    });
    expect(sandboxRef(withSandboxPolicy(value, { maxAttempts: 2 }))).toEqual({
      backend: "prod-pool",
      agent: "worker-01",
      policy: { paths: ["pkg/**"], maxAttempts: 2 },
    });
  });
});
