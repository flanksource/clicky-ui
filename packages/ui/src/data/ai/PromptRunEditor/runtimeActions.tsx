import { UiSliders } from "../../../icons";
import { cn } from "../../../lib/utils";
import type { DropdownMenuItem } from "../../../overlay/DropdownMenu";
import { presetForRef } from "../../../lib/runtime-profile-model";
import { Icon } from "../../Icon";
import type { RuntimeBarAction } from "../../runtime/RuntimeBarActions";
import {
  SEGMENT_CAPTION_CLASS,
  SEGMENT_KEY_CLASS,
  SegmentItemLabel,
} from "../../runtime/RuntimeBarSegment";
import {
  familyForMode,
  modeOptionFor,
  type SpecRuntimeFamily,
} from "../../runtime/runtime-mode";
import {
  UNSPECIFIED_LABEL,
  UNSPECIFIED_NAME,
  unspecifiedHint,
} from "../../runtime/unspecified";
import { sessionTone } from "../session-tones";
import type { RuntimePreset } from "../runtime-profile";
import {
  SPEC_PERMISSION_MODES,
  type AISpecRuntimeValue,
  type SpecPermissionMode,
} from "../SpecRuntimeEditor.model";
import {
  collapsePermissionModeAliases,
  permissionModeVisual,
} from "../SpecRuntimeEditor/permission-mode-visuals";
import { publishedPermissionModes } from "../SpecRuntimeEditor/permissions-model";
import { withPermissionMode } from "../SpecRuntimeEditor/update";

const PERMISSION_GROUP = "Permission posture";
const PRESETS_GROUP = "Presets";

/**
 * The `permissions.mode` field as a runtime-bar action. Narrowing, aliasing and
 * labelling follow `PermissionModeField` exactly, so the bar and the spec
 * modal never disagree about which postures a runtime publishes.
 *
 * Undefined when the resolved runtime publishes no postures (schema
 * `enum: null`) and the spec holds none either — there is nothing to edit.
 */
export function permissionField({
  spec,
  families,
  effectiveMode,
  onChange,
}: {
  spec: AISpecRuntimeValue;
  families: SpecRuntimeFamily[];
  effectiveMode?: string | undefined;
  onChange: (spec: AISpecRuntimeValue) => void;
}): RuntimeBarAction | undefined {
  const specMode = spec.mode?.trim() || effectiveMode?.trim();
  const runtime = specMode ? modeOptionFor(families, specMode) : undefined;
  const family = specMode ? familyForMode(families, specMode) : undefined;
  const available = publishedPermissionModes(runtime?.schema);
  const published = SPEC_PERMISSION_MODES.filter((mode) =>
    available.includes(mode),
  );
  const current = spec.permissions?.mode;
  const support = Object.fromEntries(
    published.map((mode) => [
      mode,
      runtime?.permissions?.modes[mode] ?? { kind: "native" as const },
    ]),
  );
  const visible = collapsePermissionModeAliases(
    family?.id,
    published,
    current,
    support,
  );
  // A posture the runtime does not publish is a misconfiguration the operator
  // must see, not one the bar may silently drop.
  const unpublished = current !== undefined && !published.includes(current);
  if (visible.length === 0 && !unpublished) return undefined;

  const runtimeLabel = runtime
    ? `${family?.label ?? specMode} ${runtime.label}`
    : (specMode ?? "the current runtime");
  const currentVisual = current
    ? permissionModeVisual(family?.id, current)
    : undefined;
  const select = (mode: SpecPermissionMode | undefined) =>
    onChange(withPermissionMode(spec, mode));

  return {
    id: "permissions.mode",
    label: PERMISSION_GROUP,
    ...(currentVisual?.icon ? { icon: currentVisual.icon } : {}),
    title: unpublished
      ? `${PERMISSION_GROUP} — ${currentVisual?.label} is not available for ${runtimeLabel}`
      : `${PERMISSION_GROUP} — ${currentVisual?.label ?? UNSPECIFIED_NAME}`,
    caption: (
      <>
        <span className={cn(SEGMENT_KEY_CLASS, "min-w-0 truncate")}>Perms</span>
        {currentVisual && (
          <Icon
            icon={currentVisual.icon}
            className={cn(
              "size-4 shrink-0",
              unpublished
                ? "text-destructive"
                : sessionTone(currentVisual.tone).text,
            )}
          />
        )}
        <span
          className={cn(
            SEGMENT_CAPTION_CLASS,
            "shrink-0",
            unpublished && "text-destructive",
          )}
        >
          {currentVisual?.label ?? UNSPECIFIED_LABEL}
        </span>
      </>
    ),
    items: [
      {
        group: PERMISSION_GROUP,
        label: (
          <SegmentItemLabel
            text={UNSPECIFIED_LABEL}
            hint={unspecifiedHint()}
            selected={current === undefined}
          />
        ),
        onSelect: () => select(undefined),
      },
      ...visible.map((mode) => {
        const visual = permissionModeVisual(family?.id, mode);
        const cell = support[mode];
        return {
          group: PERMISSION_GROUP,
          label: (
            <SegmentItemLabel
              text={visual.label}
              {...(cell?.effects?.note ? { hint: cell.effects.note } : {})}
              selected={mode === current}
              stacked
            />
          ),
          icon: visual.icon,
          onSelect: () => select(mode),
        };
      }),
      ...(unpublished && current
        ? [
            {
              group: PERMISSION_GROUP,
              label: (
                <SegmentItemLabel
                  text={permissionModeVisual(family?.id, current).label}
                  hint={`not available for ${runtimeLabel}`}
                  selected
                  stacked
                />
              ),
              icon: permissionModeVisual(family?.id, current).icon,
              disabled: true,
              onSelect: () => {},
            },
          ]
        : []),
    ],
  };
}

/**
 * Preset selection as a runtime-bar action. Toggling happens in the menu;
 * ORDERING does not — reordering needs move controls, which cannot live inside
 * `role="menu"` — so the field hands that off to a host-owned modal.
 */
export function presetsField({
  presets,
  value,
  onChange,
  onReorder,
}: {
  presets: RuntimePreset[];
  value: string[];
  onChange: (next: string[]) => void;
  onReorder: () => void;
}): RuntimeBarAction {
  const rows = value.map((ref) => ({ ref, preset: presetForRef(ref, presets) }));
  const names = rows.map(({ ref, preset }) => preset?.name ?? ref);
  const missing = rows.some(({ preset }) => !preset);

  const toggle = (preset: RuntimePreset) => {
    const index = rows.findIndex((row) => row.preset?.id === preset.id);
    // Removing keeps the surviving order; adding appends, so the newest preset
    // resolves last and therefore wins.
    onChange(
      index === -1
        ? [...value, preset.id]
        : value.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  return {
    id: "presets",
    label: PRESETS_GROUP,
    title: names.length > 0 ? `Presets — ${names.join(", ")}` : "Presets — none",
    caption: (
      <>
        <span className={cn(SEGMENT_KEY_CLASS, "min-w-0 truncate")}>
          Presets
        </span>
        <span className={cn(SEGMENT_CAPTION_CLASS, "shrink-0")}>
          {names.length > 0 ? String(names.length) : UNSPECIFIED_LABEL}
        </span>
      </>
    ),
    items: [
      ...presets.map((preset) => ({
        group: PRESETS_GROUP,
        label: (
          <SegmentItemLabel
            text={preset.name}
            {...(preset.description ? { hint: preset.description } : {})}
            selected={rows.some((row) => row.preset?.id === preset.id)}
            stacked
          />
        ),
        onSelect: () => toggle(preset),
      })),
      // Ordering matters past one preset; a reference the catalog cannot
      // resolve is only removable there, so it opens the modal on its own.
      ...(names.length >= 2 || missing
        ? [
            {
              group: "Order",
              label: "Reorder presets…",
              icon: UiSliders,
              onSelect: onReorder,
            } satisfies DropdownMenuItem,
          ]
        : []),
    ],
  };
}
