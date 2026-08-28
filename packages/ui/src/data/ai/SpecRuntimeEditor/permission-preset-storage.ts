import {
  SPEC_PERMISSION_PRESET_STORAGE_KEY,
  type SavedPermissionPreset,
} from "./presets";

export function readSavedPermissionPresets(): SavedPermissionPreset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SPEC_PERMISSION_PRESET_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isSavedPermissionPreset);
  } catch {
    return [];
  }
}

export function writeSavedPermissionPresets(presets: SavedPermissionPreset[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(
    SPEC_PERMISSION_PRESET_STORAGE_KEY,
    JSON.stringify(presets),
  );
}

export function permissionPresetSlug(value: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "preset";
}

function isSavedPermissionPreset(
  value: unknown,
): value is SavedPermissionPreset {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<SavedPermissionPreset>;
  return (
    typeof item.id === "string" &&
    typeof item.label === "string" &&
    typeof item.updatedAt === "string" &&
    !!item.snapshot &&
    typeof item.snapshot === "object" &&
    !!item.snapshot.permissions
  );
}
