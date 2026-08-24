import type {
  ChatBudgetConfig,
  ChatModelRuntime,
  ClaudePermissionMode,
} from "../chat/types";
import type { ToolPolicy } from "./ToolPreferences";
import { normalizeToolPolicy as normalizeToolPolicyValue } from "../chat/types";
import {
  normalizeToolPolicyRules,
  toolPolicyFromPreferences,
  type PermissionPolicy,
} from "../chat/tool-policy";

export type StoredChatPreferences = {
  runtime?: ChatModelRuntime;
  budget?: ChatBudgetConfig;
  permissionMode?: ClaudePermissionMode;
  /** The user's own ordered tool rules — what they toggled in the popover. */
  toolRules?: PermissionPolicy;
};

const CHAT_PREFS_STORAGE_KEY = "clicky-ui.chat-window.preferences";

export function loadChatPreferences(): StoredChatPreferences {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CHAT_PREFS_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as StoredChatPreferences & {
      toolPrefs?: unknown;
    };
    if (!parsed || typeof parsed !== "object") return {};
    const { toolRules: rawRules, toolPrefs: legacyPrefs, ...rest } = parsed;
    const toolRules = storedToolRules(rawRules, legacyPrefs);
    return {
      ...rest,
      ...(toolRules.length ? { toolRules } : {}),
    };
  } catch {
    return {};
  }
}

/** Reads whichever shape is in storage. A browser holding the old flat map is
 *  migrated by lowering it into rules rather than discarded — the map was the
 *  user's saved choices, and dropping them would silently reopen tools they had
 *  turned off. */
function storedToolRules(
  rules: unknown,
  legacyPrefs: unknown,
): PermissionPolicy {
  const parsed = normalizeToolPolicyRules(rules);
  if (parsed.length > 0) return parsed;
  const prefs = normalizeToolPreferences(legacyPrefs);
  return prefs ? toolPolicyFromPreferences(prefs) : [];
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
): Record<string, ToolPolicy> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value))
    return undefined;
  const prefs: Record<string, ToolPolicy> = {};
  for (const [key, rawMode] of Object.entries(value)) {
    const mode = normalizeToolPolicyValue(rawMode);
    if (key && mode) prefs[key] = mode;
  }
  return Object.keys(prefs).length ? prefs : undefined;
}

