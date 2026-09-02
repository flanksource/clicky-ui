import type { RuntimeAdapter, RuntimeModel } from "./topology-model";

export type AvailabilityAxis = {
  id: string;
  label: string;
  values: Array<{ id: string; enabled: boolean }>;
};

const CLAUDE_MODELS: RuntimeModel[] = [
  {
    id: "claude-opus-5",
    label: "Claude Opus 5",
    enabled: true,
    releaseDate: "2026-07-24",
    capabilities: ["reasoning"],
    efforts: ["low", "medium", "high"],
  },
  {
    id: "claude-sonnet-5",
    label: "Claude Sonnet 5",
    enabled: true,
    releaseDate: "2026-06-29",
    capabilities: ["reasoning"],
    efforts: ["low", "medium", "high"],
  },
  {
    id: "claude-haiku-4-5-20251001",
    label: "Claude Haiku 4.5",
    enabled: true,
    releaseDate: "2025-10-15",
  },
];

const GEMINI_MODELS: RuntimeModel[] = [
  {
    id: "gemini-3.6-flash",
    label: "Gemini 3.6 Flash",
    enabled: true,
    releaseDate: "2026-07-21",
    capabilities: ["reasoning", "temperature"],
    efforts: ["low", "medium", "high"],
  },
  {
    id: "gemini-3.5-flash",
    label: "Gemini 3.5 Flash",
    enabled: true,
    releaseDate: "2026-05-19",
    capabilities: ["reasoning", "temperature"],
    efforts: ["low", "medium", "high"],
  },
  {
    id: "gemini-flash-lite-latest",
    label: "Gemini Flash Lite",
    enabled: false,
  },
];

const OPENAI_MODELS: RuntimeModel[] = [
  {
    id: "gpt-5.6-sol",
    label: "GPT-5.6 Sol",
    enabled: true,
    releaseDate: "2026-07-09",
    capabilities: ["reasoning"],
    efforts: ["low", "medium", "high", "xhigh", "max", "ultra"],
  },
  {
    id: "gpt-5.6-terra",
    label: "GPT-5.6 Terra",
    enabled: true,
    releaseDate: "2026-07-09",
    capabilities: ["reasoning"],
    efforts: ["low", "medium", "high", "xhigh", "max", "ultra"],
  },
  {
    id: "gpt-5.6-luna",
    label: "GPT-5.6 Luna",
    enabled: true,
    releaseDate: "2026-07-09",
    capabilities: ["reasoning"],
    efforts: ["low", "medium", "high", "xhigh", "max"],
  },
  {
    id: "gpt-5.3-codex-spark",
    label: "GPT-5.3 Codex Spark",
    enabled: false,
    capabilities: ["reasoning"],
  },
];

const DEEPSEEK_MODELS: RuntimeModel[] = [
  { id: "deepseek-v4-pro", label: "DeepSeek V4 Pro", enabled: false },
  { id: "deepseek-v4-flash", label: "DeepSeek V4 Flash", enabled: false },
];

export const AVAILABILITY_AXES: AvailabilityAxis[] = [
  {
    id: "modes",
    label: "Modes",
    values: [
      { id: "api", enabled: true },
      { id: "agent", enabled: true },
      { id: "cli", enabled: true },
      { id: "cmux", enabled: false },
    ],
  },
  {
    id: "providers",
    label: "Providers",
    values: [
      { id: "anthropic", enabled: true },
      { id: "openai", enabled: true },
      { id: "gemini", enabled: true },
      { id: "deepseek", enabled: false },
    ],
  },
  {
    id: "efforts",
    label: "Reasoning efforts",
    values: [
      { id: "low", enabled: true },
      { id: "medium", enabled: true },
      { id: "high", enabled: true },
      { id: "xhigh", enabled: true },
      { id: "max", enabled: true },
      { id: "ultra", enabled: true },
    ],
  },
];

export const RUNTIME_ADAPTERS: RuntimeAdapter[] = [
  {
    provider: "anthropic",
    providerLabel: "Anthropic",
    mode: "api",
    auth: "Captain vault",
    identity: "Vault record · configured",
    ready: true,
    disabled: false,
    modelCount: 7,
    models: CLAUDE_MODELS,
  },
  {
    provider: "anthropic",
    providerLabel: "Anthropic",
    mode: "cli",
    auth: "Local subscription",
    binary: "/opt/tools/claude",
    ready: true,
    disabled: false,
    modelCount: 3,
    models: CLAUDE_MODELS,
  },
  {
    provider: "anthropic",
    providerLabel: "Anthropic",
    mode: "agent",
    auth: "Local subscription",
    binary: "/opt/tools/claude",
    ready: true,
    disabled: false,
    modelCount: 3,
    models: CLAUDE_MODELS,
  },
  {
    provider: "anthropic",
    providerLabel: "Anthropic",
    mode: "cmux",
    auth: "Local subscription",
    binary: "/opt/tools/claude",
    ready: true,
    disabled: true,
    disabledBy: "mode cmux",
    modelCount: 0,
    models: [],
  },
  {
    provider: "openai",
    providerLabel: "OpenAI",
    mode: "api",
    auth: "Captain vault",
    identity: "Vault record · configured",
    ready: true,
    disabled: false,
    isDefault: true,
    modelCount: 6,
    models: OPENAI_MODELS,
  },
  {
    provider: "openai",
    providerLabel: "OpenAI",
    mode: "cli",
    auth: "Chat subscription",
    binary: "/opt/tools/codex",
    ready: true,
    disabled: false,
    modelCount: 7,
    models: OPENAI_MODELS,
  },
  {
    provider: "openai",
    providerLabel: "OpenAI",
    mode: "agent",
    auth: "Chat subscription",
    binary: "/opt/tools/codex",
    ready: true,
    disabled: false,
    modelCount: 7,
    models: OPENAI_MODELS,
  },
  {
    provider: "openai",
    providerLabel: "OpenAI",
    mode: "cmux",
    auth: "Chat subscription",
    binary: "/opt/tools/codex",
    ready: true,
    disabled: true,
    disabledBy: "mode cmux",
    modelCount: 7,
    models: OPENAI_MODELS,
  },
  {
    provider: "gemini",
    providerLabel: "Google Gemini",
    mode: "api",
    auth: "Captain vault",
    identity: "Vault record · configured",
    ready: true,
    disabled: false,
    modelCount: 30,
    models: GEMINI_MODELS,
  },
  {
    provider: "gemini",
    providerLabel: "Google Gemini",
    mode: "cli",
    auth: "Local login",
    binary: "/opt/tools/gemini",
    ready: true,
    disabled: false,
    modelCount: 1,
    models: GEMINI_MODELS.slice(0, 1),
  },
  {
    provider: "deepseek",
    providerLabel: "DeepSeek",
    mode: "api",
    auth: "Captain vault",
    identity: "Vault record · configured",
    ready: true,
    disabled: true,
    disabledBy: "provider deepseek",
    modelCount: 2,
    models: DEEPSEEK_MODELS,
  },
];
