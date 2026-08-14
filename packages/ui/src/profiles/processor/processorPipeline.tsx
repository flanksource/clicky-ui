import { useEffect, useState } from "react";
import { Badge } from "../../data/Badge";
import { Icon } from "../../data/Icon";
import { DropdownMenu } from "../../overlay/DropdownMenu";
import {
  UiAdd,
  UiArrowDown,
  UiArrowUp,
  UiFunnelData,
  UiTrash,
  UiWarningTriangle,
} from "../../icons";
import { cn } from "../../lib/utils";
import {
  effectiveType,
  PROCESSOR_CONFIG_KEYS,
  pagingBlock,
  reorder,
  validateProcessor,
  type ProcessorPreset,
  type ProcessorSpec,
} from "./processorConfig";
import { ProcessorPipelineEditor } from "./processorPipelineEditor";
import {
  previewProfileProcessors,
  processorStageRows,
  type ProcessorPreview,
  type ProcessorSampleResult,
} from "./processorPreview";
import { ProcessorPreviewTable } from "./processorPreviewTable";
import {
  missingProcessorPreviewParams,
  processorPreviewParamDefaults,
  processorPreviewParams,
} from "./processorSampleParams";

export type ProcessorPreviewer = (
  profile: unknown,
  params?: Record<string, unknown>,
) => Promise<ProcessorSampleResult>;

export function ProcessorPipeline({
  steps,
  presets,
  onChange,
  profile,
  previewer = previewProfileProcessors,
}: {
  steps: ProcessorSpec[];
  presets: Record<string, ProcessorPreset>;
  onChange: (next: ProcessorSpec[]) => void;
  profile: unknown;
  previewer?: ProcessorPreviewer;
}) {
  const [selected, setSelected] = useState(0);
  const [preview, setPreview] = useState<ProcessorPreview>();
  const [previewing, setPreviewing] = useState(false);
  const [previewError, setPreviewError] = useState("");
  const params = processorPreviewParams(profile);
  const paramsSignature = JSON.stringify(params);
  const [sampleParams, setSampleParams] = useState<Record<string, unknown>>(
    () => processorPreviewParamDefaults(params),
  );
  const signature = JSON.stringify({ profile, steps });
  const step = steps[selected];
  const blocks = steps
    .map((entry) =>
      pagingBlock(
        effectiveType(entry, entry.use ? presets[entry.use] : undefined),
      ),
    )
    .filter((block): block is NonNullable<typeof block> => Boolean(block));
  const addItems = [
    ...Object.entries(presets)
      .sort(([, left], [, right]) =>
        (left.title ?? "").localeCompare(right.title ?? ""),
      )
      .map(([name, preset]) => ({
        label: preset.title ?? name,
        group: "Library presets",
        ...(preset.description ? { title: preset.description } : {}),
        onSelect: () => {
          onChange([...steps, { use: name }]);
          setSelected(steps.length);
        },
      })),
    ...Object.keys(PROCESSOR_CONFIG_KEYS)
      .sort()
      .map((type) => ({
        label: type,
        group: "Processor types",
        onSelect: () => {
          onChange([...steps, { type }]);
          setSelected(steps.length);
        },
      })),
  ];

  useEffect(() => {
    setPreview(undefined);
    setPreviewError("");
  }, [signature]);

  useEffect(() => {
    setSampleParams(processorPreviewParamDefaults(params));
  }, [paramsSignature]);

  const update = (index: number, next: ProcessorSpec) =>
    onChange(
      steps.map((entry, position) => (position === index ? next : entry)),
    );

  const runPreview = async () => {
    setPreviewing(true);
    setPreviewError("");
    try {
      const result = await previewer(
        withCurrentProcessors(profile, steps),
        sampleParams,
      );
      if (!result.processorPreview) {
        throw new Error(
          "Processor preview response did not include processorPreview",
        );
      }
      setPreview(result.processorPreview);
    } catch (error) {
      setPreview(undefined);
      setPreviewError(
        error instanceof Error ? error.message : "Processor preview failed",
      );
    } finally {
      setPreviewing(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <section className="space-y-1">
          <div className="flex items-center gap-1.5 pb-1 text-[11px] text-muted-foreground">
            <Icon icon={UiFunnelData} className="text-[13px]" />
            Runs in order after aliases, filters and columns
            {preview ? (
              <Badge tone="neutral" variant="soft" size="md">
                {preview.input.length} rows in
              </Badge>
            ) : null}
          </div>

          {steps.length === 0 ? (
            <p className="rounded border border-dashed border-border px-2 py-3 text-center text-xs text-muted-foreground">
              No post-query steps.
            </p>
          ) : null}

          {steps.map((entry, index) => (
            <StepCard
              key={index}
              step={entry}
              preset={entry.use ? presets[entry.use] : undefined}
              preview={preview?.stages[index]}
              selected={index === selected}
              first={index === 0}
              last={index === steps.length - 1}
              onSelect={() => setSelected(index)}
              onMove={(direction) => {
                onChange(reorder(steps, index, index + direction));
                setSelected(index + direction);
              }}
              onRemove={() => {
                onChange(steps.filter((_, position) => position !== index));
                setSelected(Math.max(0, Math.min(index, steps.length - 2)));
              }}
            />
          ))}

          <DropdownMenu
            label="Add processor"
            icon={UiAdd}
            variant="outline"
            size="sm"
            className="w-full [&>button]:w-full"
            menuClassName="min-w-64"
            menuLabel="Add processor"
            items={addItems}
          />

          {blocks.length > 0 ? <PagingNotice blocks={blocks} /> : null}
        </section>

        <section className="rounded-lg border border-border p-3">
          {step ? (
            <ProcessorPipelineEditor
              step={step}
              preset={step.use ? presets[step.use] : undefined}
              profile={withCurrentProcessors(profile, steps)}
              previewing={previewing}
              previewError={previewError}
              params={params}
              paramValues={sampleParams}
              missingParams={missingProcessorPreviewParams(
                params,
                sampleParams,
              )}
              onParamChange={(name, value) =>
                setSampleParams((current) => {
                  const next = { ...current };
                  if (value === undefined) delete next[name];
                  else next[name] = value;
                  return next;
                })
              }
              onPreview={() => void runPreview()}
              onChange={(next) => update(selected, next)}
            />
          ) : (
            <p className="text-xs text-muted-foreground">
              Add a processor to configure and preview it.
            </p>
          )}
        </section>
      </div>

      {preview ? (
        <ProcessorPreviewTable preview={preview} selected={selected} />
      ) : null}
    </div>
  );
}

function StepCard({
  step,
  preset,
  preview,
  selected,
  first,
  last,
  onSelect,
  onMove,
  onRemove,
}: {
  step: ProcessorSpec;
  preset: ProcessorPreset | undefined;
  preview: ProcessorPreview["stages"][number] | undefined;
  selected: boolean;
  first: boolean;
  last: boolean;
  onSelect: () => void;
  onMove: (direction: number) => void;
  onRemove: () => void;
}) {
  const type = effectiveType(step, preset);
  const issues = validateProcessor(step, preset);
  const errors = issues.filter((issue) => issue.severity === "error").length;
  const warnings = issues.length - errors;
  const block = pagingBlock(type);
  const title = preset?.title ?? step.use ?? type ?? "unconfigured";

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-2 py-2",
        selected
          ? "border-primary/50 bg-primary/[0.05] ring-1 ring-primary/20"
          : "border-border hover:bg-muted/50",
      )}
    >
      <button
        type="button"
        aria-label={`Edit ${title}`}
        onClick={onSelect}
        className="min-w-0 flex-1 text-left"
      >
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="truncate text-sm font-medium">{title}</span>
          {block ? (
            <span title={block.reason}>
              <Badge
                tone={block.kind === "inherent" ? "warning" : "neutral"}
                variant="soft"
                size="md"
                clickToCopy={false}
              >
                {block.kind === "inherent" ? "needs all rows" : "could page"}
              </Badge>
            </span>
          ) : null}
          {preview ? (
            <Badge tone="success" variant="soft" size="md" clickToCopy={false}>
              {processorStageRows(preview)}
            </Badge>
          ) : null}
          {errors > 0 ? (
            <Badge
              tone="danger"
              variant="soft"
              size="md"
              icon={UiWarningTriangle}
              clickToCopy={false}
            >
              {errors}
            </Badge>
          ) : null}
          {warnings > 0 ? (
            <Badge tone="warning" variant="soft" size="md" clickToCopy={false}>
              {warnings}
            </Badge>
          ) : null}
        </div>
        <p className="truncate font-mono text-[11px] text-muted-foreground">
          {type || "no type"}
        </p>
      </button>
      <div className="flex shrink-0 flex-col">
        <button
          type="button"
          aria-label={`Move ${title} up`}
          disabled={first}
          onClick={() => onMove(-1)}
          className="rounded px-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <Icon icon={UiArrowUp} className="text-[11px]" />
        </button>
        <button
          type="button"
          aria-label={`Move ${title} down`}
          disabled={last}
          onClick={() => onMove(1)}
          className="rounded px-1 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
        >
          <Icon icon={UiArrowDown} className="text-[11px]" />
        </button>
      </div>
      <button
        type="button"
        aria-label={`Remove ${title}`}
        onClick={onRemove}
        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
      >
        <Icon icon={UiTrash} className="text-[13px]" />
      </button>
    </div>
  );
}

function PagingNotice({
  blocks,
}: {
  blocks: { kind: "inherent" | "gap"; reason: string }[];
}) {
  return (
    <div className="mt-2 space-y-1 rounded border border-amber-500/40 bg-amber-500/[0.06] p-2">
      <div className="flex items-center gap-1.5 text-[11px] font-medium">
        <Icon
          icon={UiWarningTriangle}
          className="text-[12px] text-amber-600 [[data-theme=dark]_&]:text-amber-400"
        />
        This profile can no longer be paged
      </div>
      <p className="text-[11px] text-muted-foreground">
        These steps cannot run page by page, so every page is cut from a full
        run of the query.
        {blocks.every((block) => block.kind === "gap")
          ? " None needs the whole result; the per-page interface is unimplemented."
          : ""}
      </p>
    </div>
  );
}

function withCurrentProcessors(
  profile: unknown,
  processors: ProcessorSpec[],
): unknown {
  if (!profile || typeof profile !== "object" || Array.isArray(profile))
    return profile;
  return { ...profile, processors };
}
