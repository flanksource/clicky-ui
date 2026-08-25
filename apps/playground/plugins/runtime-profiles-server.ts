import type { IncomingMessage, ServerResponse } from "node:http";
import type { Plugin } from "vite";
import {
  appendToolPolicy,
  normalizeToolPolicyRules,
  resolveToolPolicy,
  toolPolicyFromPreferences,
  type PermissionPolicy,
} from "../../../packages/ui/src/data/chat/tool-policy";
import {
  normalizeToolPolicy,
  type ToolMeta,
  type ToolPolicy,
} from "../../../packages/ui/src/data/chat/types";
import type { RuntimeCatalogFamily } from "../../../packages/ui/src/data/runtime/runtime-mode";
import {
  compactAISpecRuntime,
  type AISpecRuntimeSpec,
} from "../../../packages/ui/src/data/ai/SpecRuntimeEditor.model";
import {
  RUNTIME_PROFILE_SCOPES,
  type ResolvedRuntimeProfile,
  type RuntimeResolutionLayer,
  type RuntimePreset,
  type RuntimeProfileResolveRequest,
  type RuntimeProfileScope,
} from "../src/pages/_runtime-profiles/contract";
import {
  assertRuntimePresetRecord,
  assertRuntimePresetSpec,
} from "../src/pages/_runtime-profiles/model";
import {
  loadRuntimeProfileRuntimeCatalog,
  loadRuntimeProfileToolCatalog,
} from "./runtime-profiles-catalog";

export const RUNTIME_PROFILES_ROUTE = "/__playground/runtime-profiles/resolve";
export const RUNTIME_PROFILES_RUNTIMES_ROUTE =
  "/__playground/runtime-profiles/runtimes";

const DEPLOYMENT_POLICY: PermissionPolicy = [
  { group: "projects", policy: "ask" },
  { destructive: true, policy: "ask" },
];

export function resolveRuntimeProfile(
  request: RuntimeProfileResolveRequest,
  catalogs: {
    tools: ToolMeta[];
    runtimes: RuntimeCatalogFamily[];
  },
): ResolvedRuntimeProfile {
  const layers = validateAndOrderLayers(materializeProfileLayers(request));
  let spec: AISpecRuntimeSpec = {};
  for (const layer of layers) {
    spec = mergeSpec(spec, compactAISpecRuntime(layer.spec));
  }
  validatePermissionPosture(spec, catalogs.runtimes);

  const legacyPreferences = readLegacyPreferences(spec);
  const effectivePolicy = appendToolPolicy(
    DEPLOYMENT_POLICY,
    appendToolPolicy(
      toolPolicyFromPreferences(legacyPreferences),
      normalizeToolPolicyRules(spec.toolPolicy),
    ),
  );
  const permissions = Object.fromEntries(
    catalogs.tools.map((tool) => [
      tool.name,
      resolveEffectivePermission(tool, effectivePolicy),
    ]),
  );
  return {
    resolved: { spec, trace: layers },
    tools: catalogs.tools.map((tool) => structuredClone(tool)),
    permissions,
    effectivePolicy,
  };
}

function validatePermissionPosture(
  spec: AISpecRuntimeSpec,
  runtimes: RuntimeCatalogFamily[],
): void {
  const posture = spec.permissions?.mode;
  if (!posture) return;
  const backend = spec.backend?.trim();
  if (!backend) {
    throw new Error(
      `permission posture ${JSON.stringify(posture)} requires a resolved backend`,
    );
  }
  const runtime = runtimes
    .flatMap((family) => family.modes)
    .find((mode) => mode.backend === backend);
  if (!runtime) {
    throw new Error(
      `resolved backend ${JSON.stringify(backend)} is not published by Captain`,
    );
  }
  const support = runtime.permissions?.modes[posture];
  if (
    support?.kind !== "native" &&
    support?.kind !== "approximated"
  ) {
    throw new Error(
      `permission posture ${JSON.stringify(posture)} is not available for backend ${JSON.stringify(backend)}`,
    );
  }
}

function materializeProfileLayers(
  request: RuntimeProfileResolveRequest,
): RuntimeResolutionLayer[] {
  if (!request || typeof request !== "object")
    throw new Error("request is required");
  if (!Array.isArray(request.presets))
    throw new Error('"presets" must be an array');
  if (!request.profile || typeof request.profile !== "object") {
    throw new Error('"profile" must be an object');
  }
  if (!Array.isArray(request.profile.presets)) {
    throw new Error('"profile.presets" must be an array');
  }
  if (!request.profile.spec || typeof request.profile.spec !== "object") {
    throw new Error('"profile.spec" must be an object');
  }
  const byId = new Map<string, RuntimePreset>();
  for (const [index, preset] of request.presets.entries()) {
    assertRuntimePresetRecord(preset, `presets[${index}]`);
    if (!preset.id?.trim()) throw new Error("runtime preset id is required");
    if (byId.has(preset.id))
      throw new Error(`runtime preset id "${preset.id}" is duplicated`);
    assertRuntimePresetSpec(preset.spec, `presets[${index}].spec`);
    byId.set(preset.id, preset);
  }
  const selectedPresetIds = new Set<string>();
  const presetLayers = request.profile.presets.map((presetId, index) => {
    if (typeof presetId !== "string" || !presetId.trim()) {
      throw new Error(`profile.presets[${index}] must be a preset id`);
    }
    if (selectedPresetIds.has(presetId)) {
      throw new Error(`runtime profile repeats preset "${presetId}"`);
    }
    selectedPresetIds.add(presetId);
    const preset = byId.get(presetId);
    if (!preset) {
      throw new Error(
        `runtime profile "${request.profile.name}" references missing preset "${presetId}"`,
      );
    }
    const materialized: RuntimeResolutionLayer = {
      ...structuredClone(preset),
      source: "preset",
      spec: compactAISpecRuntime(preset.spec),
    };
    return materialized;
  });
  return [
    ...presetLayers,
    {
      id: `${request.profile.id}:spec`,
      name: `${request.profile.name} run spec`,
      description: "Task-specific runtime settings owned by this profile.",
      scope: "surface",
      source: "profile",
      spec: compactAISpecRuntime(request.profile.spec),
    },
  ];
}

function validateAndOrderLayers(
  layers: RuntimeResolutionLayer[],
): RuntimeResolutionLayer[] {
  if (!Array.isArray(layers)) throw new Error('"layers" must be an array');
  const seen = new Set<string>();
  for (const layer of layers) {
    if (!layer || typeof layer !== "object")
      throw new Error("each layer must be an object");
    if (!layer.id?.trim())
      throw new Error("runtime profile layer id is required");
    if (seen.has(layer.id)) {
      throw new Error(`runtime profile repeats layer id "${layer.id}"`);
    }
    seen.add(layer.id);
    if (!layer.name?.trim())
      throw new Error(`runtime profile layer "${layer.id}" name is required`);
    if (!RUNTIME_PROFILE_SCOPES.includes(layer.scope)) {
      throw new Error(
        `runtime profile layer "${layer.id}" has invalid scope "${layer.scope}"`,
      );
    }
  }
  return layers
    .map((layer, index) => ({ layer: structuredClone(layer), index }))
    .sort(
      (left, right) =>
        scopeRank(left.layer.scope) - scopeRank(right.layer.scope) ||
        left.index - right.index,
    )
    .map(({ layer }) => layer);
}

function scopeRank(scope: RuntimeProfileScope): number {
  return RUNTIME_PROFILE_SCOPES.indexOf(scope);
}

function mergeSpec(
  base: AISpecRuntimeSpec,
  override: AISpecRuntimeSpec,
): AISpecRuntimeSpec {
  return mergeValue(base, override, "") as AISpecRuntimeSpec;
}

function mergeValue(base: unknown, override: unknown, key: string): unknown {
  if (isUnset(override)) return structuredClone(base);
  if (key === "sandbox") return structuredClone(override);
  if (Array.isArray(override)) return structuredClone(override);
  if (isRecord(override)) {
    const output: Record<string, unknown> = isRecord(base)
      ? structuredClone(base)
      : {};
    for (const [childKey, value] of Object.entries(override)) {
      output[childKey] = mergeValue(output[childKey], value, childKey);
    }
    return output;
  }
  return structuredClone(override);
}

function isUnset(value: unknown): boolean {
  return (
    value === undefined ||
    value === null ||
    value === "" ||
    value === false ||
    value === 0 ||
    (Array.isArray(value) && value.length === 0)
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function readLegacyPreferences(
  spec: AISpecRuntimeSpec,
): Record<string, ToolPolicy> {
  const raw = (
    spec as AISpecRuntimeSpec & {
      toolPreferences?: Record<string, ToolPolicy>;
    }
  ).toolPreferences;
  return raw ?? {};
}

function resolveEffectivePermission(
  tool: ToolMeta,
  policy: PermissionPolicy,
): ToolPolicy {
  let resolved = strategyPermission(tool);
  const registered = normalizeToolPolicy(tool.defaultPermission);
  if (registered && registered !== "auto") resolved = registered;
  const matched = resolveToolPolicy(policy, tool);
  if (matched && matched !== "auto") resolved = matched;
  return resolved === "auto" ? "ask" : resolved;
}

function strategyPermission(tool: ToolMeta): ToolPolicy {
  let policy: ToolPolicy = "auto";
  if (["GET", "HEAD", "OPTIONS"].includes(tool.method ?? "")) policy = "allow";
  if (["POST", "PUT", "PATCH", "DELETE"].includes(tool.method ?? ""))
    policy = "ask";
  if (
    tool.annotations?.readOnlyHint === true &&
    tool.annotations.destructiveHint === false
  ) {
    policy = "allow";
  }
  if (tool.annotations?.destructiveHint === true) policy = "ask";
  return policy;
}

async function readJsonBody(
  request: IncomingMessage,
): Promise<RuntimeProfileResolveRequest> {
  const chunks: Buffer[] = [];
  for await (const chunk of request) chunks.push(chunk as Buffer);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) throw new Error("request body is required");
  const parsed = JSON.parse(raw) as unknown;
  if (!isRecord(parsed)) throw new Error("request body must be a JSON object");
  return parsed as RuntimeProfileResolveRequest;
}

function sendJson(
  response: ServerResponse,
  status: number,
  payload: unknown,
): void {
  response.statusCode = status;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store");
  response.end(JSON.stringify(payload));
}

export function playgroundRuntimeProfiles({
  operationsURL,
  runtimesURL,
}: {
  operationsURL: string;
  runtimesURL: string;
}): Plugin {
  let toolsPromise: Promise<ToolMeta[]> | undefined;
  let runtimesPromise: Promise<RuntimeCatalogFamily[]> | undefined;
  const loadTools = () => {
    toolsPromise ??= loadRuntimeProfileToolCatalog(operationsURL).catch(
      (cause) => {
        toolsPromise = undefined;
        throw cause;
      },
    );
    return toolsPromise;
  };
  const loadRuntimes = () => {
    runtimesPromise ??= loadRuntimeProfileRuntimeCatalog(runtimesURL).catch(
      (cause) => {
        runtimesPromise = undefined;
        throw cause;
      },
    );
    return runtimesPromise;
  };
  return {
    name: "playground-runtime-profiles",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use(
        RUNTIME_PROFILES_RUNTIMES_ROUTE,
        (request, response) => {
          void (async () => {
            try {
              if (request.method !== "GET") {
                sendJson(response, 405, {
                  error: `GET ${RUNTIME_PROFILES_RUNTIMES_ROUTE} is required`,
                });
                return;
              }
              sendJson(response, 200, await loadRuntimes());
            } catch (error) {
              const detail =
                error instanceof Error ? error.message : String(error);
              const message = `Unable to load Captain runtimes from ${runtimesURL}: ${detail}`;
              server.config.logger.error(`[runtime-profiles] ${message}`);
              sendJson(response, 502, { error: message });
            }
          })();
        },
      );
      server.middlewares.use(RUNTIME_PROFILES_ROUTE, (request, response) => {
        void (async () => {
          try {
            if (request.method !== "POST") {
              sendJson(response, 405, {
                error: `POST ${RUNTIME_PROFILES_ROUTE} is required`,
              });
              return;
            }
            const body = await readJsonBody(request);
            let catalogs: {
              tools: ToolMeta[];
              runtimes: RuntimeCatalogFamily[];
            };
            try {
              const [tools, runtimes] = await Promise.all([
                loadTools(),
                loadRuntimes(),
              ]);
              catalogs = { tools, runtimes };
            } catch (cause) {
              const detail =
                cause instanceof Error ? cause.message : String(cause);
              throw new RuntimeProfileCatalogError(
                `Unable to load runtime profile catalogs: ${detail}`,
              );
            }
            sendJson(response, 200, resolveRuntimeProfile(body, catalogs));
          } catch (error) {
            const message =
              error instanceof Error ? error.message : String(error);
            server.config.logger.error(`[runtime-profiles] ${message}`);
            sendJson(
              response,
              error instanceof RuntimeProfileCatalogError ? 502 : 400,
              { error: message },
            );
          }
        })();
      });
    },
  };
}

class RuntimeProfileCatalogError extends Error {}
