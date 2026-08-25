import type { ReactNode } from "react";
import {
  SPEC_PERMISSION_MODES,
  type AISpecRuntimeValue,
  type SpecPermissionMode,
} from "../SpecRuntimeEditor.model";
import {
  modeForBackend,
  type SpecRuntimeFamily,
} from "../../runtime/runtime-mode";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { sessionTone } from "../session-tones";
import { SpecField } from "./fields";
import {
  collapsePermissionModeAliases,
  permissionModeVisual,
} from "./permission-mode-visuals";
import { withPermissions } from "./update";

export function PermissionModeField({
  value,
  onChange,
  families,
  effectiveBackend,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  families: SpecRuntimeFamily[];
  effectiveBackend?: string | undefined;
}) {
  const backend = value.backend?.trim() || effectiveBackend?.trim();
  const current = value.permissions?.mode || undefined;
  if (!backend) {
    return current ? (
      <PermissionPostureError>
        Permission posture requires a backend context.
      </PermissionPostureError>
    ) : null;
  }
  const runtime = modeForBackend(families, backend);
  const family = familyForBackend(families, backend);
  const capabilities = runtime?.permissions;
  if (!capabilities) {
    return current ? (
      <PermissionPostureError>
        Permission posture {JSON.stringify(current)} cannot be validated because
        backend {JSON.stringify(backend)} did not publish capabilities.
      </PermissionPostureError>
    ) : null;
  }
  const availableModes = SPEC_PERMISSION_MODES.filter((mode) => {
    const kind = capabilities.modes[mode]?.kind;
    return kind === "native" || kind === "approximated";
  });
  const visibleModes = collapsePermissionModeAliases(
    family?.id,
    availableModes,
    current,
    capabilities.modes,
  );
  const invalid = current && !availableModes.includes(current);
  if (visibleModes.length === 0 && !invalid) return null;
  const selected = current || "default";
  const support = capabilities.modes[selected];
  const runtimeLabel = runtime
    ? `${family?.label ?? backend} ${runtime.label}`
    : backend;
  return (
    <div className="grid gap-density-2">
      {invalid && (
        <PermissionPostureError>
          {permissionModeVisual(family?.id, current).label} is not available for{" "}
          {runtimeLabel}. Select a published posture before saving.
        </PermissionPostureError>
      )}
      {visibleModes.length > 0 && (
        <SpecField
          label="Permission posture"
          hint={support?.effects?.note || support?.kind}
          composite
        >
          <SegmentedControl
            aria-label="Permission posture"
            value={selected}
            onChange={(mode: SpecPermissionMode) =>
              onChange(withPermissions(value, { mode }))
            }
            size="sm"
            wrap
            className="w-full"
            options={visibleModes.map((mode) => {
              const cell = capabilities.modes[mode];
              if (!cell) {
                throw new Error(
                  `permission posture ${JSON.stringify(mode)} disappeared from backend capabilities`,
                );
              }
              const visual = permissionModeVisual(family?.id, mode);
              const tone = sessionTone(visual.tone);
              return {
                id: mode,
                label: visual.label,
                icon: visual.icon,
                iconClassName: tone.text,
                activeClassName: `${tone.disc} ${tone.border}`,
                title: cell.effects?.note || permissionSupportLabel(cell.kind),
              };
            })}
          />
        </SpecField>
      )}
    </div>
  );
}

function familyForBackend(families: SpecRuntimeFamily[], backend: string) {
  return families.find((family) =>
    family.modes.some((mode) => mode.backend === backend),
  );
}

function PermissionPostureError({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/30 bg-destructive/5 px-density-2 py-density-1 text-xs text-destructive"
    >
      {children}
    </p>
  );
}

function permissionSupportLabel(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1).replace("-", " ");
}
