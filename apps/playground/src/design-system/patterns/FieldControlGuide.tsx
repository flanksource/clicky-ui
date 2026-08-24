import { useState, type ReactNode } from "react";
import type { RangeSliderValue } from "@flanksource/clicky-ui";
import {
  Combobox,
  DateField,
  InputField,
  MultiSelect,
  RangeSlider,
  Select,
  SegmentedControl,
  Switch,
} from "@flanksource/clicky-ui";
import { UiKey, UiSearch } from "@flanksource/clicky-ui/icons";

// Which control a value earns, in one place. The rule is always about the SHAPE
// of the value — how many options it can take, whether the set is closed, and
// whether the reader has to recognise or recall — never about how the screen
// looks with it.

type ControlGuide = {
  shape: string;
  control: string;
  why: string;
  example: ReactNode;
};

const NAMESPACES = ["platform", "monitoring", "compliance", "inventory", "reporting"];

export function FieldControlGuide() {
  const [text, setText] = useState("production-health");
  const [count, setCount] = useState("30");
  const [enabled, setEnabled] = useState(true);
  const [mode, setMode] = useState("incremental");
  const [namespace, setNamespace] = useState("platform");
  const [cluster, setCluster] = useState("prod-eu-west-1");
  const [owners, setOwners] = useState<string[]>(["Platform"]);
  const [labels, setLabels] = useState<string[]>(["tier=1", "team=platform"]);
  const [after, setAfter] = useState("2026-08-01");
  const [severity, setSeverity] = useState<RangeSliderValue>([3, 8]);
  const [secret, setSecret] = useState("");

  const GUIDES: ControlGuide[] = [
    {
      shape: "Short free text",
      control: "InputField",
      why: "The value is anything the user types and no set exists to choose from. Label above, help below, errors at the field.",
      example: <InputField value={text} onChange={setText} aria-label="Configuration name" />,
    },
    {
      shape: "A number with a unit",
      control: "InputField + suffix",
      why: "Put the unit inside the field as a suffix instead of appending it to the label — the reader sees what they are typing in context.",
      example: (
        <InputField
          value={count}
          onChange={setCount}
          type="number"
          aria-label="Check interval"
          suffix={<span className="text-xs text-muted-foreground">seconds</span>}
        />
      ),
    },
    {
      shape: "A boolean that takes effect immediately",
      control: "Switch",
      why: "A switch reads as a state you are flipping now. If the change only applies on save, or the two states have real names, use a segmented control instead.",
      example: <Switch checked={enabled} onChange={setEnabled} label="Collect logs" />,
    },
    {
      shape: "A closed set of 2–4 named options",
      control: "SegmentedControl",
      why: "All options visible, one click to change, no menu to open. Above roughly four options the row stops fitting and turns into noise.",
      example: (
        <SegmentedControl
          value={mode}
          onChange={setMode}
          aria-label="Sync mode"
          options={[
            { id: "incremental", label: "Incremental" },
            { id: "full", label: "Full" },
            { id: "off", label: "Off" },
          ]}
        />
      ),
    },
    {
      shape: "A closed set of 5–20 options",
      control: "Select",
      why: "Too many to show at once, few enough that scanning the open menu is faster than typing.",
      example: (
        <Select
          aria-label="Namespace"
          value={namespace}
          onChange={(event) => setNamespace(event.target.value)}
          options={NAMESPACES.map((value) => ({ value, label: value }))}
        />
      ),
    },
    {
      shape: "A large or remote set",
      control: "Combobox",
      why: "Search is the only way in once recall beats recognition. It also takes an async loader, so options can arrive from the backend as the user types.",
      example: (
        <Combobox
          value={cluster}
          onChange={setCluster}
          ariaLabel="Cluster"
          options={[
            { value: "prod-eu-west-1", label: "prod-eu-west-1" },
            { value: "prod-us-east-1", label: "prod-us-east-1" },
            { value: "staging-eu-west-1", label: "staging-eu-west-1" },
          ]}
          prefix={<UiSearch className="size-4 text-muted-foreground" />}
        />
      ),
    },
    {
      shape: "Several values from a closed set",
      control: "MultiSelect",
      why: "The trigger summarises the selection so the field still reads at a glance when collapsed.",
      example: (
        <MultiSelect
          value={owners}
          onChange={setOwners}
          ariaLabel="Owners"
          options={["Platform", "Reliability", "Trust", "Inventory"].map((value) => ({ value, label: value }))}
        />
      ),
    },
    {
      shape: "An open list of short strings",
      control: "Combobox multiple, tags",
      why: "No fixed set, and each entry is a word or two. Values commit on Enter or a separator, paste splits into pills, and each one is removable — a textarea of comma-separated text is not this.",
      example: (
        <Combobox
          multiple
          variant="tags"
          separators={[","]}
          allowCustomValue
          value={labels}
          onChange={setLabels}
          ariaLabel="Labels"
          options={[]}
        />
      ),
    },
    {
      shape: "A point in time",
      control: "DateField",
      why: "Native date/datetime input plus a picker: typing stays fastest for anyone who knows the date, and the calendar covers everyone else.",
      example: <DateField value={after} onChange={setAfter} aria-label="Collected after" />,
    },
    {
      shape: "A bounded numeric range",
      control: "RangeSlider",
      why: "Two coupled numbers where the relationship — and the distance between them — matters more than the exact values.",
      example: (
        <RangeSlider
          min={0}
          max={10}
          value={severity}
          onChange={setSeverity}
          ariaLabelMin="Minimum severity"
          ariaLabelMax="Maximum severity"
        />
      ),
    },
    {
      shape: "A secret",
      control: "InputField (password) + reference",
      why: "Never round-trip the value for display. Take a reference to where the secret lives, and show the field empty with the current value described, not echoed.",
      example: (
        <InputField
          value={secret}
          onChange={setSecret}
          type="password"
          aria-label="API token"
          prefix={<UiKey className="size-4 text-muted-foreground" />}
          placeholder="Set — enter a new value to replace"
        />
      ),
    },
  ];

  return (
    <div className="grid gap-density-3 xl:grid-cols-2">
      {GUIDES.map((guide) => (
        <article key={guide.shape} className="grid gap-density-3 rounded-xl border border-border bg-card p-density-3 md:grid-cols-[minmax(0,1fr)_minmax(0,15rem)] md:items-start">
          <div className="min-w-0">
            <div className="flex flex-wrap items-baseline gap-x-density-2">
              <h3 className="text-sm font-semibold text-foreground">{guide.shape}</h3>
              <code className="text-[11px] text-primary">{guide.control}</code>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{guide.why}</p>
          </div>
          <div className="min-w-0">{guide.example}</div>
        </article>
      ))}
    </div>
  );
}
