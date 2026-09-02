import type { SpecRuntimeFamily } from "../../runtime/runtime-mode";
import type {
  ResolvedRuntimeProfile,
  RuntimePreset,
  RuntimeProfile,
  RuntimeProfileResolveRequest,
} from "../runtime-profile";
import type { AISpecRuntimePermissionCatalog } from "../SpecRuntimeEditor.model";

export type RuntimePermissionTarget = {
  provider: string;
  mode: string;
};

export type RuntimeProfilesClient = {
  resolve: (
    request: RuntimeProfileResolveRequest,
    signal?: AbortSignal,
  ) => Promise<ResolvedRuntimeProfile>;
  loadFamilies?: (signal?: AbortSignal) => Promise<SpecRuntimeFamily[]>;
  loadPermissionCatalog: (
    target: RuntimePermissionTarget,
    signal?: AbortSignal,
  ) => Promise<AISpecRuntimePermissionCatalog>;
};

export type RuntimeProfileResolutionState = {
  status: "loading" | "resolved" | "error";
  result?: ResolvedRuntimeProfile;
  error?: string;
};

export type RuntimeFamiliesState = {
  families: SpecRuntimeFamily[];
  status: "loading" | "resolved" | "error";
  error?: string;
  retry: () => void;
};

export type RuntimePermissionCatalogState = {
  catalog?: AISpecRuntimePermissionCatalog;
  status: "idle" | "loading" | "resolved" | "error";
  error?: string;
  retry: () => void;
};

export type RuntimeProfilesView = "profiles" | "presets";

export type RuntimeProfilesStore = {
  createPreset: (preset: RuntimePreset) => void;
  updatePreset: (preset: RuntimePreset) => void;
  deletePreset: (id: string) => void;
  createProfile: (profile: RuntimeProfile) => void;
  updateProfile: (profile: RuntimeProfile) => void;
  deleteProfile: (id: string) => void;
};

export type RuntimeProfilesPersistence = {
  dirty: boolean;
  saving: boolean;
  error?: string;
  onSave: () => void;
  onDiscard: () => void;
};

export type RuntimeRecordMeta = {
  sourceLabel?: string;
  writable: boolean;
};
