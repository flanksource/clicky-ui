import { useState } from "react";
import {
  AccordionList,
  Combobox,
  HoverCard,
  SegmentedControl,
  cn,
  type SegmentedOption,
} from "@flanksource/clicky-ui";
import type {
  PermissionPolicy,
  PermissionRule,
  ToolMeta,
  ToolPolicy,
} from "@flanksource/clicky-ui/ai";
import {
  UiEye,
  UiListChecks,
  UiQuestion,
  UiRepeat,
  UiShieldCheck,
  UiShieldSlash,
  UiSliders,
  UiSparkles,
  UiWarningTriangle,
} from "@flanksource/clicky-ui/icons";
import {
  MATCH_FIELDS,
  MATCH_FIELD_OPTIONS,
  STRATEGY_PRESETS,
  activeMatchFields,
  addCondition,
  applyStrategyPreset,
  conditionText,
  matchingTools,
  strategyPreset,
  type MatchField,
  type StrategyPreset,
} from "./PermissionStrategiesEditor.model";
import { PermissionStrategyConditionRow } from "./PermissionStrategyConditionRow";

export function PermissionStrategiesEditor({
  value,
  tools,
  onChange,
}: {
  value: PermissionPolicy;
  tools: ToolMeta[];
  onChange: (value: PermissionPolicy) => void;
}) {
  return (
    <section className="space-y-2">
      <div>
        <h3 className="text-sm font-semibold">Permission strategies</h3>
        <p className="text-xs text-muted-foreground">
          Match tool metadata and assign authority. Later rows win.
        </p>
      </div>
      <AccordionList
        items={value}
        onChange={onChange}
        allowDrag
        allowReorder
        allowDuplicate
        allowRemove
        cloneItem={(rule) => structuredClone(rule)}
        onCreate={(): PermissionRule => ({ name: "*", policy: "ask" })}
        addLabel="Add permission strategy"
        addDescription="Start with a common match preset or define custom conditions."
        itemLabel={({ item, index }) =>
          `Permission strategy ${index + 1}: ${strategyLabel(item)}`
        }
        idPrefix="permission-strategy"
        renderHeader={({ item }) => <StrategyHeader rule={item} />}
        renderMeta={({ item }) => <MatchCountBadge rule={item} tools={tools} />}
        renderBody={({ item, onChange: changeRule }) => (
          <PermissionStrategyFields
            value={item}
            tools={tools}
            onChange={changeRule}
          />
        )}
      />
    </section>
  );
}

function StrategyHeader({ rule }: { rule: PermissionRule }) {
  const preset = strategyPreset(rule);
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      <span
        className={cn(
          "flex size-7 shrink-0 items-center justify-center rounded-md",
          strategyIconStyle(preset),
        )}
      >
        <StrategyIcon preset={preset} className="size-4" />
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium">
        {strategyLabel(rule)}
      </span>
      <PolicyBadge policy={rule.policy} />
    </div>
  );
}

function PermissionStrategyFields({
  value,
  tools,
  onChange,
}: {
  value: PermissionRule;
  tools: ToolMeta[];
  onChange: (value: PermissionRule) => void;
}) {
  const inferredPreset = strategyPreset(value);
  const [custom, setCustom] = useState(inferredPreset === "custom");
  const preset = custom ? "custom" : inferredPreset;
  const fields = activeMatchFields(value);
  const available = MATCH_FIELDS.filter((field) => !fields.includes(field));

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2">
        <div className="grid gap-1 text-xs font-medium">
          <span>Match preset</span>
          <Combobox
            ariaLabel="Match preset"
            value={preset}
            options={STRATEGY_PRESETS.map((option) => ({
              value: option.value,
              label: option.label,
              description: option.description,
              icon: <StrategyIcon preset={option.value} className="size-4" />,
            }))}
            onChange={(nextValue) => {
              const next = nextValue as StrategyPreset;
              setCustom(next === "custom");
              if (next === "custom") {
                if (inferredPreset !== "custom") {
                  onChange({ group: "*", policy: value.policy });
                }
                return;
              }
              onChange(applyStrategyPreset(value, next));
            }}
            allowCustomValue={false}
            required
          />
        </div>
        <PolicyControl
          value={value.policy}
          onChange={(policy) => onChange({ ...value, policy })}
        />
      </div>

      {preset === "custom" ? (
        <div className="space-y-2 rounded-lg border border-border bg-background p-3">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Match conditions
            </h4>
            <p className="text-xs text-muted-foreground">
              Every condition must match. Comma-separated patterns within one
              field are alternatives.
            </p>
          </div>
          {fields.map((field, index) => (
            <PermissionStrategyConditionRow
              key={`${field}-${index}`}
              rule={value}
              field={field}
              index={index}
              tools={tools}
              onChange={onChange}
            />
          ))}
          {available.length > 0 && (
            <label className="grid gap-1 text-xs font-medium sm:max-w-xs">
              Add condition
              <select
                value=""
                onChange={(event) =>
                  onChange(
                    addCondition(value, event.target.value as MatchField),
                  )
                }
                className="h-9 rounded-md border border-dashed border-input bg-background px-3 text-sm text-muted-foreground"
              >
                <option value="" disabled>
                  Choose metadata…
                </option>
                {MATCH_FIELD_OPTIONS.filter((option) =>
                  available.includes(option.value),
                ).map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
          )}
        </div>
      ) : null}
    </div>
  );
}

function PolicyControl({
  value,
  onChange,
}: {
  value: ToolPolicy;
  onChange: (value: ToolPolicy) => void;
}) {
  const options: SegmentedOption<ToolPolicy>[] = [
    { id: "auto", label: "Auto", icon: UiSparkles },
    { id: "ask", label: "Ask", icon: UiQuestion },
    { id: "deny", label: "Off", icon: UiShieldSlash },
    { id: "allow", label: "On", icon: UiShieldCheck },
  ];
  return (
    <div className="grid gap-1 text-xs font-medium">
      <span>Policy</span>
      <div
        data-testid="permission-policy-control"
        data-policy={value}
        className={cn("rounded-md border p-1", policyStyle(value))}
      >
        <SegmentedControl
          aria-label="Policy"
          value={value}
          options={options}
          onChange={onChange}
          size="sm"
          className="w-full justify-stretch"
        />
      </div>
    </div>
  );
}

function MatchCountBadge({
  rule,
  tools,
}: {
  rule: PermissionRule;
  tools: ToolMeta[];
}) {
  const matches = matchingTools(rule, tools);
  const label = `${matches.length} matching ${
    matches.length === 1 ? "operation" : "operations"
  }`;
  return (
    <HoverCard
      placement="top"
      cardClassName="max-w-sm whitespace-normal p-3"
      trigger={
        <button
          type="button"
          aria-label={label}
          className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <UiListChecks className="size-3.5" />
          {label}
        </button>
      }
    >
      <div className="text-xs font-semibold text-foreground">{label}</div>
      {matches.length > 0 ? (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {matches.map((tool) => (
            <span
              key={tool.name}
              className="rounded border border-border bg-muted/40 px-2 py-1 font-mono text-[11px] text-foreground"
            >
              {tool.name}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-1 text-xs text-muted-foreground">
          No catalog operation matches every condition.
        </p>
      )}
    </HoverCard>
  );
}

function PolicyBadge({ policy }: { policy: ToolPolicy }) {
  return (
    <span
      aria-label={`Policy: ${policyLabel(policy)}`}
      className={cn(
        "flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold",
        policyStyle(policy),
      )}
    >
      <PolicyIcon policy={policy} className="size-3" />
      {policyLabel(policy)}
    </span>
  );
}

function StrategyIcon({
  preset,
  className,
}: {
  preset: StrategyPreset;
  className?: string;
}) {
  if (preset === "all") return <UiListChecks className={className} />;
  if (preset === "read-only") return <UiEye className={className} />;
  if (preset === "destructive")
    return <UiWarningTriangle className={className} />;
  if (preset === "idempotent") return <UiRepeat className={className} />;
  return <UiSliders className={className} />;
}

function PolicyIcon({
  policy,
  className,
}: {
  policy: ToolPolicy;
  className?: string;
}) {
  if (policy === "allow") return <UiShieldCheck className={className} />;
  if (policy === "deny") return <UiShieldSlash className={className} />;
  if (policy === "ask") return <UiQuestion className={className} />;
  return <UiSparkles className={className} />;
}

function strategyLabel(rule: PermissionRule): string {
  const preset = strategyPreset(rule);
  if (preset !== "custom") {
    return (
      STRATEGY_PRESETS.find((option) => option.value === preset)?.label ??
      "All tools"
    );
  }
  const fields = activeMatchFields(rule);
  if (fields.length !== 1) {
    return `Custom conditions · ${fields.length} conditions`;
  }
  const field = fields[0];
  if (!field) return "Custom conditions";
  const label =
    MATCH_FIELD_OPTIONS.find((option) => option.value === field)?.label ??
    field;
  const value = conditionText(rule, field);
  if (Array.isArray(rule[field])) {
    return `Custom conditions · ${label} in ${rule[field].length} values`;
  }
  const displayValue =
    value === "true" ? "Yes" : value === "false" ? "No" : value;
  return `Custom conditions · ${label} ${displayValue}`;
}

function policyLabel(policy: ToolPolicy): string {
  if (policy === "allow") return "On";
  if (policy === "deny") return "Off";
  if (policy === "ask") return "Ask";
  return "Auto";
}

function strategyIconStyle(preset: StrategyPreset): string {
  if (preset === "read-only") return "bg-emerald-500/10 text-emerald-700";
  if (preset === "destructive") return "bg-red-500/10 text-red-700";
  if (preset === "idempotent") return "bg-sky-500/10 text-sky-700";
  if (preset === "all") return "bg-violet-500/10 text-violet-700";
  return "bg-muted text-muted-foreground";
}

function policyStyle(policy: ToolPolicy): string {
  if (policy === "allow") {
    return "border-emerald-500/30 bg-emerald-500/10 text-emerald-700";
  }
  if (policy === "deny") return "border-red-500/30 bg-red-500/10 text-red-700";
  if (policy === "ask") {
    return "border-amber-500/30 bg-amber-500/10 text-amber-700";
  }
  return "border-violet-500/30 bg-violet-500/10 text-violet-700";
}
