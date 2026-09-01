import type { ReactNode } from "react";
import {
  SPEC_PERMISSION_MODES,
  type AISpecRuntimeValue,
  type SpecPermissionMode,
} from "../SpecRuntimeEditor.model";
import {
  modeOptionFor,
  type SpecRuntimeFamily,
} from "../../runtime/runtime-mode";
import { SegmentedControl } from "../../../components/SegmentedControl";
import { sessionTone } from "../session-tones";
import { SpecField } from "./fields";
import {
  collapsePermissionModeAliases,
  permissionModeVisual,
} from "./permission-mode-visuals";
import { sandboxRef, withSandboxApproval } from "./update";

export function PermissionModeField({
  value,
  onChange,
  families,
  availableModes,
  effectiveMode,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  families: SpecRuntimeFamily[];
  availableModes: SpecPermissionMode[];
  effectiveMode?: string | undefined;
}) {
  const specMode = value.mode?.trim() || effectiveMode?.trim();
  const current = sandboxRef(value).approval;
  if (!specMode) {
    return current ? (
      <PermissionPostureError>
        Permission posture requires a runtime mode.
      </PermissionPostureError>
    ) : null;
  }
  const runtime = modeOptionFor(families, specMode);
  const family = familyForMode(families, specMode);
  const capabilities = runtime?.permissions;
  const publishedModes = SPEC_PERMISSION_MODES.filter((mode) =>
    availableModes.includes(mode),
  );
  const support = Object.fromEntries(
    publishedModes.map((mode) => [
      mode,
      capabilities?.modes[mode] ?? { kind: "native" as const },
    ]),
  );
  const visibleModes = collapsePermissionModeAliases(
    family?.id,
    publishedModes,
    current,
    support,
  );
  const invalid = current && !publishedModes.includes(current);
  if (visibleModes.length === 0 && !invalid) return null;
  const selected = current || "default";
  const selectedSupport = support[selected];
  const runtimeLabel = runtime
    ? `${family?.label ?? specMode} ${runtime.label}`
    : specMode;
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
          hint={selectedSupport?.effects?.note || selectedSupport?.kind}
          composite
        >
          <SegmentedControl
            aria-label="Permission posture"
            value={selected}
            onChange={(mode: SpecPermissionMode) =>
              onChange(withSandboxApproval(value, mode))
            }
            size="sm"
            wrap
            className="w-full"
            options={visibleModes.map((mode) => {
              const cell = support[mode];
              if (!cell) {
                throw new Error(
                  `permission posture ${JSON.stringify(mode)} disappeared from runtime capabilities`,
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

function familyForMode(families: SpecRuntimeFamily[], specMode: string) {
  return families.find((family) =>
    family.modes.some((mode) => mode.id === specMode),
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
