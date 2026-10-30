import { useLayoutEffect, useState } from "react";
import {
  IconMenuPicker,
  UiColumns,
  UiDesktop,
  UiFullscreen,
  UiPhone,
  VIEWPORT_PRESETS,
  findViewportPreset,
  useHotkey,
  type IconMenuOption,
  type ViewportPreset,
} from "@flanksource/clicky-ui";

// `fit` renders the demo in place; a preset id frames it in an iframe of that
// exact size, so media queries see the preset width, not the kitchen-sink's;
// `sweep` lays every sub-desktop preset side by side.
export type ViewportMode = "fit" | "sweep" | (string & {});

const SWEEP_PRESETS = VIEWPORT_PRESETS.filter((preset) => preset.kind !== "desktop");
const SWEEP_SCALE = 0.5;
const CYCLE: ViewportMode[] = ["fit", ...VIEWPORT_PRESETS.map((preset) => preset.id)];

const KIND_ICON = { phone: UiPhone, tablet: UiPhone, desktop: UiDesktop } as const;

const OPTIONS: IconMenuOption<ViewportMode>[] = [
  { value: "fit", icon: UiFullscreen, label: "Fit window" },
  ...VIEWPORT_PRESETS.map((preset) => ({
    value: preset.id,
    icon: KIND_ICON[preset.kind],
    label: preset.label,
    description: `${preset.width}×${preset.height}`,
  })),
  { value: "sweep", icon: UiColumns, label: "Sweep", description: "All phone & tablet sizes" },
];

export function parseViewportMode(value: string | null): ViewportMode {
  if (value === "sweep" || findViewportPreset(value)) return value as ViewportMode;
  return "fit";
}

export function frameUrl(demoId: string): string {
  return `?demo=${encodeURIComponent(demoId)}&frame=1`;
}

/** Header picker plus `[` / `]` to step through presets and `\` to toggle the sweep. */
export function ViewportPicker({
  value,
  onChange,
}: {
  value: ViewportMode;
  onChange: (next: ViewportMode) => void;
}) {
  const step = (delta: number) => {
    const index = Math.max(0, CYCLE.indexOf(value));
    onChange(CYCLE[(index + delta + CYCLE.length) % CYCLE.length]!);
  };
  useHotkey("[", () => step(-1));
  useHotkey("]", () => step(1));
  useHotkey("\\", () => onChange(value === "sweep" ? "fit" : "sweep"));

  return (
    <IconMenuPicker<ViewportMode>
      value={value}
      onChange={onChange}
      options={OPTIONS}
      ariaLabel="Viewport"
      triggerTitle="Viewport ( [ / ] step · \ sweep )"
    />
  );
}

function PresetFrame({ demoId, preset, scale }: { demoId: string; preset: ViewportPreset; scale: number }) {
  return (
    <figure className="shrink-0 space-y-density-1">
      <figcaption className="text-xs text-muted-foreground">
        <span className="font-medium text-foreground">{preset.label}</span> · {preset.width}×{preset.height}
        {scale < 1 && ` · ${Math.round(scale * 100)}%`}
      </figcaption>
      <div
        className="overflow-hidden rounded-md border border-border bg-background shadow-sm"
        style={{ width: preset.width * scale, height: preset.height * scale }}
      >
        <iframe
          title={`${demoId} at ${preset.label}`}
          src={frameUrl(demoId)}
          width={preset.width}
          height={preset.height}
          className="origin-top-left border-0"
          style={{ transform: `scale(${scale})` }}
        />
      </div>
    </figure>
  );
}

export function ViewportStage({ demoId, mode }: { demoId: string; mode: ViewportMode }) {
  const [stage, setStage] = useState<HTMLDivElement | null>(null);
  const [stageWidth, setStageWidth] = useState(0);

  useLayoutEffect(() => {
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => setStageWidth(entry?.contentRect.width ?? 0));
    observer.observe(stage);
    return () => observer.disconnect();
  }, [stage]);

  if (mode === "sweep") {
    return (
      <div data-scroll-x className="flex items-start gap-density-4 overflow-x-auto p-density-4">
        {SWEEP_PRESETS.map((preset) => (
          <PresetFrame key={preset.id} demoId={demoId} preset={preset} scale={SWEEP_SCALE} />
        ))}
      </div>
    );
  }

  const preset = findViewportPreset(mode);
  if (!preset) throw new Error(`ViewportStage: unknown viewport preset "${mode}"`);
  // Shrink a preset wider than the stage rather than letting it scroll; the
  // iframe keeps its real width, so its media queries are unaffected.
  const scale = stageWidth > 0 ? Math.min(1, stageWidth / preset.width) : 1;
  return (
    <div ref={setStage} className="p-density-4">
      <PresetFrame demoId={demoId} preset={preset} scale={scale} />
    </div>
  );
}
