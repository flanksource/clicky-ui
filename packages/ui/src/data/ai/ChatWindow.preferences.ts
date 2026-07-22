import type { ChatBudgetConfig, ClaudePermissionMode } from "../chat/types";
import type { ToolMode } from "./ToolPreferences";

export type StoredChatPreferences = {
  model?: string;
  reasoningEffort?: string;
  temperature?: number;
  budget?: ChatBudgetConfig;
  permissionMode?: ClaudePermissionMode;
  toolPrefs?: Record<string, ToolMode>;
};

const CHAT_PREFS_STORAGE_KEY = "clicky-ui.chat-window.preferences";

export function loadChatPreferences(): StoredChatPreferences {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CHAT_PREFS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredChatPreferences;
    if (!parsed || typeof parsed !== "object") return {};
    const { toolPrefs: rawToolPrefs, ...rest } = parsed;
    const toolPrefs = normalizeToolPreferences(rawToolPrefs);
    return {
      ...rest,
      ...(toolPrefs ? { toolPrefs } : {}),
    };
  } catch {
    return {};
  }
}

export function saveChatPreferences(prefs: StoredChatPreferences): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CHAT_PREFS_STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage quota/privacy failures; chat stays functional.
  }
}

function normalizeToolPreferences(
  value: unknown
): Record<string, ToolMode> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  const prefs: Record<string, ToolMode> = {};
  for (const [key, rawMode] of Object.entries(value)) {
    const mode = normalizeToolModeValue(rawMode);
    if (key && mode) prefs[key] = mode;
  }
  return Object.keys(prefs).length ? prefs : undefined;
}

function normalizeToolModeValue(value: unknown): ToolMode | undefined {
  if (typeof value !== "string") return undefined;
  switch (value.trim().toLowerCase()) {
    case "on":
    case "enabled":
      return "on";
    case "ask":
      return "ask";
    case "off":
    case "disabled":
      return "off";
    case "auto":
      return "auto";
    default:
      return undefined;
  }
}
