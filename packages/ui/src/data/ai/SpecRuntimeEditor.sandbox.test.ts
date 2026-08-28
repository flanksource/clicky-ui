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

  it("preserves unified approval, backend, agent, and dispatch settings", () => {
    expect(
      compactAISpecRuntime({
        sandbox: {
          mode: "git-agent",
          approval: "plan",
          backend: "prod-pool",
          agent: "worker-01",
          dispatch: { paths: ["pkg/**", "!**/*.pem"], maxAttempts: 3 },
        },
      }).sandbox,
    ).toEqual({
      mode: "git-agent",
      approval: "plan",
      backend: "prod-pool",
      agent: "worker-01",
      dispatch: { paths: ["pkg/**", "!**/*.pem"], maxAttempts: 3 },
    });
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
        sandbox: { backend: "prod-pool", approval: "plan" },
      }),
    ).toThrow("sandbox.mode is required");
    expect(() =>
      compactAISpecRuntime({
        sandbox: { mode: "off", approval: "plan", backend: "prod-pool" },
      }),
    ).toThrow("sandbox mode off does not accept approval");
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

  it("clears incompatible settings when the public mode changes", () => {
    const native = withSandbox(
      {},
      {
        mode: "native",
        approval: "plan",
        policy: { filesystem: { access: "read-only" } },
      },
    );
    expect(sandboxRef(withSandboxMode(native, "docker"))).toEqual({
      mode: "docker",
      approval: "plan",
    });

    const remote = withSandbox(
      {},
      {
        mode: "git-agent",
        approval: "dontAsk",
        backend: "prod-pool",
        agent: "worker-01",
        dispatch: { maxAttempts: 3 },
      },
    );
    expect(sandboxRef(withSandboxMode(remote, "native"))).toEqual({
      mode: "native",
      approval: "dontAsk",
    });
    expect(sandboxRef(withSandboxMode(remote, "off"))).toEqual({ mode: "off" });
  });

  it("patches native policy without disturbing posture", () => {
    const value = withSandboxPolicy(
      { sandbox: { mode: "native", approval: "plan" } },
      { filesystem: { access: "workspace-write" } },
    );
    expect(sandboxRef(value)).toEqual({
      mode: "native",
      approval: "plan",
      policy: { filesystem: { access: "workspace-write" } },
    });
  });
});
