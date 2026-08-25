import { describe, expect, it } from "vitest";
import { resolveRuntimeProfile } from "./runtime-profiles-server";
import type { RuntimeProfileResolveRequest } from "../src/pages/_runtime-profiles/contract";
import type { ToolMeta } from "../../../packages/ui/src/data/chat/types";
import type { RuntimeCatalogFamily } from "../../../packages/ui/src/data/runtime/runtime-mode";

const TOOLS: ToolMeta[] = [
  {
    name: "billing_invoice_list",
    label: "List invoices",
    group: "billing.read",
    method: "GET",
    annotations: { readOnlyHint: true, destructiveHint: false },
  },
  {
    name: "billing_invoice_update",
    label: "Update invoice",
    group: "billing.write",
    method: "PATCH",
  },
  {
    name: "workspace_search",
    label: "Search workspace",
    group: "workspace.read",
    method: "POST",
    annotations: { readOnlyHint: true, openWorldHint: true },
  },
];

const RUNTIMES: RuntimeCatalogFamily[] = [
  {
    family: "codex",
    provider: "openai",
    catalogPrefix: "codex-agent",
    modes: [
      {
        mode: "agent",
        backend: "codex-agent",
        permissions: {
          modes: {
            default: { kind: "approximated" },
            plan: { kind: "native" },
            dontAsk: { kind: "unsupported" },
          },
          toolPolicies: {},
          resources: {},
        },
      },
    ],
  },
];

const resolve = (input: RuntimeProfileResolveRequest) =>
  resolveRuntimeProfile(input, { tools: TOOLS, runtimes: RUNTIMES });

function request(
  presets: RuntimeProfileResolveRequest["presets"],
  selectedPresetIds: RuntimeProfileResolveRequest["profile"]["presets"] = presets.map(
    (preset) => preset.id,
  ),
): RuntimeProfileResolveRequest {
  return {
    presets,
    profile: {
      id: "profile",
      name: "Profile",
      spec: {},
      presets: selectedPresetIds,
    },
  };
}

describe("resolveRuntimeProfile", () => {
  it("sorts scopes stably and lets later same-scope presets win", () => {
    const result = resolve(
      request([
        {
          id: "surface-review",
          name: "Review",
          scope: "surface",
          spec: {
            model: "openai/gpt-5.6-luna",
            toolPolicy: [{ group: "billing.write", policy: "ask" }],
          },
        },
        {
          id: "global-defaults",
          name: "Defaults",
          scope: "global",
          spec: { model: "openai/gpt-5.6-terra", budget: { maxTurns: 8 } },
        },
        {
          id: "surface-autonomy",
          name: "Autonomy",
          scope: "surface",
          spec: {
            model: "openai/gpt-5.6-sol",
            toolPolicy: [{ group: "billing.write", policy: "allow" }],
          },
        },
      ]),
    );

    expect(result.resolved.trace.map((layer) => layer.id)).toEqual([
      "global-defaults",
      "surface-review",
      "surface-autonomy",
      "profile:spec",
    ]);
    expect(result.resolved.spec).toMatchObject({
      model: "openai/gpt-5.6-sol",
      budget: { maxTurns: 8 },
      toolPolicy: [{ group: ["billing.write"], policy: "allow" }],
    });
    expect(result.permissions["billing_invoice_update"]).toBe("allow");
  });

  it("resolves ordered preset references and applies the profile spec as the override", () => {
    const input = request([
      {
        id: "balanced",
        name: "Balanced",
        scope: "surface",
        spec: { model: "openai/gpt-5.6-terra", effort: "medium" },
      },
    ]);
    input.profile.spec = { effort: "high" };
    const result = resolve(input);

    expect(result.resolved.spec).toMatchObject({
      model: "openai/gpt-5.6-terra",
      effort: "high",
    });
    expect(result.resolved.trace[0]).toMatchObject({
      id: "balanced",
      name: "Balanced",
      scope: "surface",
    });
  });

  it("materializes the full profile spec after surface presets and before user guardrails", () => {
    const input = request([
      {
        id: "surface",
        name: "Surface behavior",
        scope: "surface",
        spec: { model: "openai/gpt-5.6-terra", effort: "medium" },
      },
      {
        id: "user",
        name: "User guardrails",
        scope: "user",
        spec: { toolPolicy: [{ destructive: true, policy: "ask" }] },
      },
    ]);
    input.profile.spec = {
      model: "openai/gpt-5.6-sol",
      prompt: { user: "Implement the requested change" },
      setup: { cwd: ".", checkout: { path: ".", ref: "HEAD" } },
      workflow: { verify: { fixture: "- [ ] focused tests pass" } },
    };

    const result = resolve(input);

    expect(
      result.resolved.trace.map(({ id, source, scope }) => [id, source, scope]),
    ).toEqual([
      ["surface", "preset", "surface"],
      ["profile:spec", "profile", "surface"],
      ["user", "preset", "user"],
    ]);
    expect(result.resolved.spec).toMatchObject({
      model: "openai/gpt-5.6-sol",
      effort: "medium",
      prompt: { user: "Implement the requested change" },
      setup: { cwd: ".", checkout: { path: ".", ref: "HEAD" } },
      workflow: { verify: { fixture: "- [ ] focused tests pass" } },
    });
  });

  it("rejects task-specific fields in presets", () => {
    const presetRequest = request([
      {
        id: "invalid",
        name: "Invalid",
        scope: "surface",
        spec: { prompt: { user: "task prompt" } } as never,
      },
    ]);
    expect(() => resolve(presetRequest)).toThrow(
      'runtime preset field "presets[0].spec.prompt" is not allowed',
    );
  });

  it("rejects Captain-level constraints on presets", () => {
    expect(() =>
      resolve(
        request([
          {
            id: "global",
            name: "Global",
            scope: "global",
            spec: {},
            constraints: { models: ["openai/gpt-5.6-terra"] },
          } as never,
        ]),
      ),
    ).toThrow('runtime preset field "presets[0].constraints" is not allowed');
  });

  it("does not infer allow from a read-only hint without explicit non-destructive metadata", () => {
    const result = resolve(request([]));

    expect(result.permissions["billing_invoice_list"]).toBe("allow");
    expect(result.permissions["workspace_search"]).toBe("ask");
  });

  it("rejects duplicate preset references instead of silently resolving ambiguous state", () => {
    expect(() =>
      resolve(
        request(
          [
            { id: "one", name: "One", scope: "global", spec: {} },
            { id: "two", name: "Two", scope: "user", spec: {} },
          ],
          ["one", "one"],
        ),
      ),
    ).toThrow('runtime profile repeats preset "one"');
  });

  it("returns only the effective spec and trace at the profile boundary", () => {
    const result = resolve(request([]));

    expect(result.resolved).toEqual({
      spec: {},
      trace: [
        expect.objectContaining({ id: "profile:spec", source: "profile" }),
      ],
    });
  });

  it("validates an inherited permission posture against the final backend", () => {
    const result = resolve(
      request([
        {
          id: "backend",
          name: "Codex backend",
          scope: "global",
          spec: { backend: "codex-agent" },
        },
        {
          id: "posture",
          name: "Plan posture",
          scope: "surface",
          spec: { permissions: { mode: "plan" } },
        },
      ]),
    );

    expect(result.resolved.spec).toMatchObject({
      backend: "codex-agent",
      permissions: { mode: "plan" },
    });
  });

  it("rejects a posture the resolved backend does not implement", () => {
    const input = request([]);
    input.profile.spec = {
      backend: "codex-agent",
      permissions: { mode: "dontAsk" },
    };

    expect(() => resolve(input)).toThrow(
      'permission posture "dontAsk" is not available for backend "codex-agent"',
    );
  });

  it("rejects a posture without a final backend", () => {
    const input = request([]);
    input.profile.spec = { permissions: { mode: "plan" } };

    expect(() => resolve(input)).toThrow(
      'permission posture "plan" requires a resolved backend',
    );
  });
});
