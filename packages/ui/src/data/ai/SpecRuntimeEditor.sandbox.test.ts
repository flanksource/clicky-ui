import { describe, expect, it } from "vitest";

import { compactAISpecRuntime } from "./SpecRuntimeEditor.model";
import {
  sandboxRef,
  withSandbox,
  withSandboxMode,
  withSandboxPolicy,
} from "./SpecRuntimeEditor/update";

describe("compactAISpecRuntime sandbox", () => {
  it("round-trips a mode-only sandbox as the scalar shorthand", () => {
    expect(compactAISpecRuntime({ sandbox: "native" }).sandbox).toBe("native");
    expect(
      compactAISpecRuntime({ sandbox: { mode: "git-agent" } }).sandbox,
    ).toBe("git-agent");
  });

  it("preserves backend, agent, and dispatch settings", () => {
    expect(
      compactAISpecRuntime({
        sandbox: {
          mode: "git-agent",
          backend: "prod-pool",
          agent: "worker-01",
          dispatch: { paths: ["pkg/**", "!**/*.pem"], maxAttempts: 3 },
        },
      }).sandbox,
    ).toEqual({
      mode: "git-agent",
      backend: "prod-pool",
      agent: "worker-01",
      dispatch: { paths: ["pkg/**", "!**/*.pem"], maxAttempts: 3 },
    });
  });

  it("rejects a legacy sandbox.approval instead of loading it silently", () => {
    // Captain's SandboxRef has no Approval field and decodes with
    // DisallowUnknownFields: a preset/profile saved before the move to
    // permissions.mode must fail loudly here, not round-trip and blow up as
    // "unknown field approval" when the run actually dispatches.
    expect(() =>
      compactAISpecRuntime({
        sandbox: { mode: "native", approval: "plan" } as never,
      }),
    ).toThrow("sandbox.approval was removed; use permissions.mode");
    expect(() =>
      compactAISpecRuntime({
        sandbox: { mode: "off", approval: "plan" } as never,
      }),
    ).toThrow("sandbox.approval was removed; use permissions.mode");
  });

  it("preserves provider-neutral native filesystem and network policy", () => {
    expect(
      compactAISpecRuntime({
        sandbox: {
          mode: "native",
          policy: {
            required: true,
            filesystem: {
              access: "workspace-write",
              writableRoots: ["pkg", "  ", "docs"],
              includeSystemTemp: true,
            },
            network: {
              access: "restricted",
              allowedDomains: ["api.example.com"],
              allowLocalBinding: true,
            },
          },
        },
      }).sandbox,
    ).toEqual({
      mode: "native",
      policy: {
        required: true,
        filesystem: {
          access: "workspace-write",
          writableRoots: ["pkg", "docs"],
          includeSystemTemp: true,
        },
        network: {
          access: "restricted",
          allowedDomains: ["api.example.com"],
          allowLocalBinding: true,
        },
      },
    });
  });

  it("drops empty refs and rejects configured values without a compatible mode", () => {
    expect(compactAISpecRuntime({ sandbox: "" }).sandbox).toBeUndefined();
    expect(compactAISpecRuntime({ sandbox: {} }).sandbox).toBeUndefined();
    expect(() =>
      compactAISpecRuntime({
        sandbox: { backend: "prod-pool" },
      }),
    ).toThrow("sandbox.mode is required");
    expect(() =>
      compactAISpecRuntime({
        sandbox: { mode: "off", backend: "prod-pool" },
      }),
    ).toThrow("sandbox mode off does not accept backend");
  });
});

describe("sandbox mutators", () => {
  it("reads either stored form through one accessor", () => {
    expect(sandboxRef({ sandbox: "native" })).toEqual({ mode: "native" });
    expect(
      sandboxRef({ sandbox: { mode: "git-agent", agent: "worker-01" } }),
    ).toEqual({ mode: "git-agent", agent: "worker-01" });
    expect(sandboxRef({})).toEqual({});
  });

  it("clears every prior setting when the public mode changes", () => {
    const native = withSandbox(
      {},
      {
        mode: "native",
        policy: { filesystem: { access: "read-only" } },
      },
    );
    expect(sandboxRef(withSandboxMode(native, "docker"))).toEqual({
      mode: "docker",
    });

    const remote = withSandbox(
      {},
      {
        mode: "git-agent",
        backend: "prod-pool",
        agent: "worker-01",
        dispatch: { maxAttempts: 3 },
      },
    );
    expect(sandboxRef(withSandboxMode(remote, "native"))).toEqual({
      mode: "native",
    });
    expect(sandboxRef(withSandboxMode(remote, "off"))).toEqual({ mode: "off" });
  });

  it("patches native policy through the mutator", () => {
    const value = withSandboxPolicy(
      { sandbox: { mode: "native" } },
      { filesystem: { access: "workspace-write" } },
    );
    expect(sandboxRef(value)).toEqual({
      mode: "native",
      policy: { filesystem: { access: "workspace-write" } },
    });
  });
});
