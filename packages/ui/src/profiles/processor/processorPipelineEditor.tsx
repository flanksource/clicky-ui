import { useState } from "react";
import { Button } from "../../components/button";
import { SegmentedControl } from "../../components/SegmentedControl";
import { Badge } from "../../data/Badge";
import { Icon } from "../../data/Icon";
import { UiCode2, UiPlay, UiWarningTriangle } from "../../icons";
import { cn } from "../../lib/utils";
import { CelEditorDialog } from "../cel/celEditor";
import {
  PROCESSOR_CEL_SCOPES,
  PROCESSOR_CONFIG_KEYS,
  effectiveType,
  resolveConfig,
  validateProcessor,
  type ProcessorPreset,
  type ProcessorSpec,
  type ResolvedProcessorKey,
} from "./processorConfig";
import { useJsonPathSample } from "../query/jsonPathSample";
import type { ParamDraft } from "../wizard/profileWizardModel";
import { parseProcessorPreviewParam } from "./processorSampleParams";

const VIEWS = [
  { id: "config", label: "Config" },
  { id: "resolved", label: "Resolved" },
] as const;

export function ProcessorPipelineEditor({
  step,
  preset,
  profile,
  previewing,
  previewError,
  params,
  paramValues,
  missingParams,
  onParamChange,
  onPreview,
  onChange,
}: {
  step: ProcessorSpec;
  preset: ProcessorPreset | undefined;
  profile: unknown;
  previewing: boolean;
  previewError: string;
  params: ParamDraft[];
  paramValues: Record<string, unknown>;
  missingParams: string[];
  onParamChange: (name: string, value: unknown) => void;
  onPreview: () => void;
  onChange: (next: ProcessorSpec) => void;
}) {
  const [view, setView] = useState<string>("config");
  const issues = validateProcessor(step, preset);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <SegmentedControl
          value={view}
          options={VIEWS.map((entry) => ({ id: entry.id, label: entry.label }))}
          onChange={setView}
          size="sm"
          aria-label="View"
        />
      </div>

      <ProcessorIssues issues={issues} />
      {view === "resolved" ? (
        <ResolvedConfig resolved={resolveConfig(step, preset)} />
      ) : (
        <ConfigEditor
          step={step}
          preset={preset}
          profile={profile}
          onChange={onChange}
        />
      )}

      <div className="space-y-2 border-t border-border/60 pt-3">
        <PreviewParameters
          params={params}
          values={paramValues}
          onChange={onParamChange}
        />
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="gap-1.5"
          disabled={previewing || missingParams.length > 0}
          title={
            missingParams.length > 0
              ? `Enter required preview parameters: ${missingParams.join(", ")}`
              : undefined
          }
          onClick={onPreview}
        >
          <Icon icon={UiPlay} className="text-[13px]" />
          {previewing ? "Previewing…" : "Preview processors"}
        </Button>
        {previewError ? (
          <p className="text-xs text-destructive">{previewError}</p>
        ) : null}
        {missingParams.length > 0 ? (
          <p className="text-xs text-warning-foreground">
            Enter required preview parameters: {missingParams.join(", ")}.
          </p>
        ) : null}
        <p className="text-[11px] text-muted-foreground">
          Runs the ordered pipeline on a fresh, read-only sample. Whole-result
          processors see only that bounded window.
        </p>
      </div>
    </div>
  );
}

function PreviewParameters({
  params,
  values,
  onChange,
}: {
  params: ParamDraft[];
  values: Record<string, unknown>;
  onChange: (name: string, value: unknown) => void;
}) {
  const visible = params.filter((param) => param.name);
  if (visible.length === 0) return null;
  return (
    <div className="grid gap-2 rounded border border-border bg-muted/20 p-2 sm:grid-cols-2">
      {visible.map((param) => {
        const name = param.name as string;
        const label = param.label?.trim() || name;
        const value = Array.isArray(values[name])
          ? values[name].join(", ")
          : String(values[name] ?? "");
        return (
          <label key={name} className="grid gap-1 text-[11px] font-medium">
            <span>
              {label}
              {param.required ? " *" : ""}
            </span>
            {param.type === "boolean" ? (
              <select
                className="rounded border border-border bg-card px-2 py-1 text-xs"
                value={value}
                aria-label={`${label} preview parameter`}
                onChange={(event) =>
                  onChange(
                    name,
                    parseProcessorPreviewParam(param, event.target.value),
                  )
                }
              >
                <option value="">Choose…</option>
                <option value="true">true</option>
                <option value="false">false</option>
              </select>
            ) : param.type === "enum" && param.options?.length ? (
              <select
                className="rounded border border-border bg-card px-2 py-1 text-xs"
                value={value}
                aria-label={`${label} preview parameter`}
                onChange={(event) =>
                  onChange(
                    name,
                    parseProcessorPreviewParam(param, event.target.value),
                  )
                }
              >
                <option value="">Choose…</option>
                {param.options.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            ) : (
              <input
                className="rounded border border-border bg-card px-2 py-1 text-xs"
                type={
                  param.type === "number"
                    ? "number"
                    : param.type === "date"
                      ? "datetime-local"
                      : "text"
                }
                value={value}
                placeholder={
                  param.type === "list" ? "value-a, value-b" : undefined
                }
                aria-label={`${label} preview parameter`}
                onChange={(event) =>
                  onChange(
                    name,
                    parseProcessorPreviewParam(param, event.target.value),
                  )
                }
              />
            )}
          </label>
        );
      })}
      <p className="col-span-full text-[10px] text-muted-foreground">
        Used only for this preview; these values are not saved.
      </p>
    </div>
  );
}

function ProcessorIssues({
  issues,
}: {
  issues: ReturnType<typeof validateProcessor>;
}) {
  if (issues.length === 0) return null;
  return (
    <ul className="space-y-1">
      {issues.map((issue) => (
        <li
          key={`${issue.key}-${issue.message}`}
          className={cn(
            "flex gap-1.5 rounded border px-2 py-1 text-[11px]",
            issue.severity === "error"
              ? "border-destructive/40 bg-destructive/[0.06] text-destructive"
              : "border-amber-500/40 bg-amber-500/[0.06] text-amber-700 [[data-theme=dark]_&]:text-amber-300",
          )}
        >
          <Icon
            icon={UiWarningTriangle}
            className="mt-0.5 shrink-0 text-[12px]"
          />
          <span>
            <code className="font-mono font-semibold">{issue.key}</code> —{" "}
            {issue.message}
          </span>
        </li>
      ))}
    </ul>
  );
}

function ResolvedConfig({ resolved }: { resolved: ResolvedProcessorKey[] }) {
  if (resolved.length === 0) {
    return <p className="text-xs text-muted-foreground">Nothing configured.</p>;
  }
  return (
    <div className="space-y-1">
      {resolved.map((entry) => (
        <div
          key={entry.key}
          className={cn(
            "rounded border px-2 py-1",
            entry.origin === "override"
              ? "border-primary/40 bg-primary/[0.04]"
              : "border-border bg-card",
          )}
        >
          <div className="flex items-baseline gap-2">
            <code className="shrink-0 font-mono text-[11px] font-semibold">
              {entry.key}
            </code>
            <Badge
              tone={entry.origin === "override" ? "info" : "neutral"}
              variant="soft"
              size="md"
            >
              {entry.origin}
            </Badge>
            <code className="min-w-0 flex-1 truncate font-mono text-[11px] text-muted-foreground">
              {formatConfigValue(entry.value)}
            </code>
          </div>
          {entry.origin === "override" && entry.presetValue !== undefined ? (
            <code className="mt-0.5 block truncate font-mono text-[10px] text-muted-foreground line-through">
              {formatConfigValue(entry.presetValue)}
            </code>
          ) : null}
        </div>
      ))}
      <p className="pt-1 text-[11px] text-muted-foreground">
        Every key not marked <em>override</em> comes from the library preset and
        still runs.
      </p>
    </div>
  );
}

function ConfigEditor({
  step,
  preset,
  profile,
  onChange,
}: {
  step: ProcessorSpec;
  preset: ProcessorPreset | undefined;
  profile: unknown;
  onChange: (next: ProcessorSpec) => void;
}) {
  const [editing, setEditing] = useState<string>();
  const [adding, setAdding] = useState("");
  const config = step.config ?? {};
  const type = effectiveType(step, preset);
  const keys = [
    ...new Set([...Object.keys(preset?.config ?? {}), ...Object.keys(config)]),
  ].sort();
  const available = (PROCESSOR_CONFIG_KEYS[type] ?? []).filter(
    (key) => !keys.includes(key),
  );
  const rows = useJsonPathSample(profile).filter(isRecord);
  const setKey = (key: string, value: unknown) =>
    onChange({ ...step, config: { ...config, [key]: value } });

  return (
    <div className="space-y-2">
      {keys.map((key) => {
        const scope = PROCESSOR_CEL_SCOPES[key];
        const current = key in config ? config[key] : preset?.config?.[key];
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center gap-1.5">
              <code className="text-[11px] font-semibold">{key}</code>
              {!(key in config) ? (
                <span className="text-[10px] text-muted-foreground">
                  inherited from the preset
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1.5">
              <input
                className="w-full rounded border border-border bg-card px-2 py-1 font-mono text-[11px]"
                value={formatConfigValue(current)}
                onChange={(event) =>
                  setKey(key, parseConfigValue(event.target.value))
                }
                aria-label={key}
              />
              {scope ? (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="shrink-0 gap-1"
                  onClick={() => setEditing(key)}
                >
                  <Icon icon={UiCode2} className="text-[12px]" /> Test
                </Button>
              ) : null}
            </div>
            {editing === key && scope ? (
              <CelEditorDialog
                value={String(current ?? "")}
                scope={scope}
                rows={rows}
                title={key}
                onChange={(next) => setKey(key, next)}
                onClose={() => setEditing(undefined)}
              />
            ) : null}
          </div>
        );
      })}
      {available.length > 0 ? (
        <select
          className="rounded border border-dashed border-border bg-card px-2 py-1 text-xs text-muted-foreground"
          value={adding}
          aria-label="Add processor setting"
          onChange={(event) => {
            setAdding(event.target.value);
            if (event.target.value) setKey(event.target.value, "");
          }}
        >
          <option value="">+ Add setting</option>
          {available.map((key) => (
            <option key={key} value={key}>
              {key}
            </option>
          ))}
        </select>
      ) : null}
    </div>
  );
}

function formatConfigValue(value: unknown): string {
  if (value === undefined || value === null) return "";
  return typeof value === "string" ? value : JSON.stringify(value);
}

function parseConfigValue(raw: string): unknown {
  const trimmed = raw.trim();
  if (trimmed === "") return "";
  if (!/^[[{"]|^-?\d|^true$|^false$|^null$/.test(trimmed)) return raw;
  try {
    return JSON.parse(trimmed);
  } catch {
    return raw;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
