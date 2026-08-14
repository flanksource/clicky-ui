import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import {
  Combobox,
  type ComboboxSingleProps,
  type ComboboxTriStateMode,
} from "./Combobox";
import { Modal } from "../overlay/Modal";

const DATABASE_OPTIONS = [
  { value: "PrimaryDB", label: "PrimaryDB" },
  { value: "ArchiveDB", label: "ArchiveDB" },
  { value: "IVS", label: "IVS" },
  { value: "ReportServer", label: "ReportServer" },
];

function ComboboxShowcase() {
  const [value, setValue] = useState("");
  return (
    <div className="w-64">
      <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
    </div>
  );
}

// The playground drives every mode from one panel, so the value has to change
// SHAPE with the mode: a string, a list of strings, or a record of include /
// exclude modes. One shared `value` is what used to break this story — flipping
// `multiple` on left the string behind and the closed label mapped over it.
type PlaygroundArgs = Omit<
  ComboboxSingleProps,
  "value" | "onChange" | "multiple" | "tristate"
> & {
  multiple?: boolean;
  tristate?: boolean;
  variant?: "default" | "tags";
};

function ComboboxPlayground({
  multiple,
  tristate,
  variant,
  ...args
}: PlaygroundArgs) {
  const [single, setSingle] = useState("");
  const [values, setValues] = useState<string[]>([]);
  const [modes, setModes] = useState<Record<string, ComboboxTriStateMode>>({});
  // Tristate is inherently multi-valued, so it carries `multiple` along rather
  // than rendering an impossible combination.
  const value = tristate ? modes : multiple ? values : single;
  const variantProp = variant ? { variant } : {};

  return (
    <div className="w-96 space-y-3">
      {tristate ? (
        <Combobox {...args} {...variantProp} multiple tristate value={modes} onChange={setModes} />
      ) : multiple ? (
        <Combobox {...args} {...variantProp} multiple value={values} onChange={setValues} />
      ) : (
        <Combobox {...args} value={single} onChange={setSingle} />
      )}
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        value={JSON.stringify(value)}
      </div>
    </div>
  );
}

const meta = {
  title: "Components/Combobox",
  component: Combobox,
  render: () => <ComboboxShowcase />,
  args: {
    options: DATABASE_OPTIONS,
    value: "",
    placeholder: "Select database",
    disabled: false,
    loading: false,
    onChange: () => undefined,
  },
  argTypes: {
    placeholder: { control: "text", table: { category: "Appearance" } },
    // The mode props, so the Playground can be driven from the panel (and from
    // the URL) instead of guessing at undeclared args.
    multiple: { control: "boolean", table: { category: "Mode" } },
    tristate: { control: "boolean", table: { category: "Mode" } },
    variant: {
      control: "inline-radio",
      options: ["default", "tags"],
      table: { category: "Mode" },
    },
    disabled: { control: "boolean", table: { category: "Behavior" } },
    required: { control: "boolean", table: { category: "Behavior" } },
    loading: { control: "boolean", table: { category: "Behavior" } },
    value: { control: false, table: { category: "Value" } },
    options: { control: false, table: { category: "Value" } },
    onChange: { control: false, table: { category: "Events" } },
  },
} satisfies Meta<typeof Combobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Playground: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Every mode from one panel: **Mode → multiple / tristate / variant**. The value shape follows the mode — a string, a `string[]`, or a `Record<value, \"include\" | \"exclude\">` — and the box below shows what the control actually commits.",
      },
    },
  },
  render: (args) => <ComboboxPlayground {...args} />,
};

export const Loading: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-64">
        <Combobox placeholder="Loading databases…" value={value} onChange={setValue} options={[]} loading />
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="w-64">
      <Combobox placeholder="Select database" value="PrimaryDB" onChange={() => {}} options={DATABASE_OPTIONS} disabled />
    </div>
  ),
};

export const Clearable: Story = {
  render: () => {
    const [value, setValue] = useState("PrimaryDB");
    return (
      <div className="w-64">
        <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
      </div>
    );
  },
};

export const Required: Story = {
  render: () => {
    const [value, setValue] = useState("PrimaryDB");
    return (
      <div className="w-64">
        <Combobox placeholder="Select database" value={value} onChange={setValue} options={DATABASE_OPTIONS} required />
      </div>
    );
  },
};

export const WithInlineLabel: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-64">
        <Combobox label="Database" value={value} onChange={setValue} options={DATABASE_OPTIONS} />
      </div>
    );
  },
};

export const Strict: Story = {
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-64 space-y-3">
        <Combobox
          label="Database"
          placeholder="Pick one"
          value={value}
          onChange={setValue}
          options={DATABASE_OPTIONS}
          allowCustomValue={false}
        />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>
    );
  },
};

export const InsideDialog: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The dropdown portals to `document.body` and is positioned with fixed coordinates, so it floats above the dialog and is not clipped by the modal body's `overflow-auto`. Open the dialog, then open the Combobox — the option list extends past the dialog's edge.",
      },
    },
  },
  render: () => {
    const [open, setOpen] = useState(true);
    const [value, setValue] = useState("");
    return (
      <div>
        <button
          type="button"
          className="rounded-md border border-border px-3 py-1.5 text-sm"
          onClick={() => setOpen(true)}
        >
          Open dialog
        </button>
        <Modal open={open} onClose={() => setOpen(false)} title="Edit connection" size="sm">
          <div className="space-y-3">
            <label className="block text-sm font-medium">Database</label>
            <Combobox
              placeholder="Select database"
              value={value}
              onChange={setValue}
              options={DATABASE_OPTIONS}
            />
            <p className="text-xs text-muted-foreground">
              The dropdown should overflow the dialog without being clipped.
            </p>
          </div>
        </Modal>
      </div>
    );
  },
};

export const Multiple: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>([]);
    return (
      <div className="w-64 space-y-3">
        <Combobox
          multiple
          label="Databases"
          placeholder="Pick databases"
          value={value}
          onChange={setValue}
          options={DATABASE_OPTIONS}
          allowCustomValue={false}
        />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>
    );
  },
};

export const CreatableMultiple: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Multi-select keeps existing choices while allowing values outside the current option page. Type a new database name and choose the Add option.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<string[]>(["PrimaryDB"]);
    return (
      <div className="w-64 space-y-3">
        <Combobox
          multiple
          label="Databases"
          placeholder="Pick or add databases"
          value={value}
          onChange={setValue}
          options={DATABASE_OPTIONS}
        />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>
    );
  },
};

export const Tags: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "The tags variant keeps every selected value visible as a removable pill while the inline input searches or creates another value.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState<string[]>([
      "PrimaryDB",
      "ArchiveDB",
      "analytics-replica",
    ]);
    return (
      <div className="w-96 space-y-3">
        <Combobox
          multiple
          variant="tags"
          label="Databases"
          placeholder="Pick or add databases"
          value={value}
          onChange={setValue}
          options={DATABASE_OPTIONS}
        />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>
    );
  },
};

export const TriStateTags: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Tristate keeps a `Record<value, \"include\" | \"exclude\">` rather than a list, and `variant: \"tags\"` shows that record in the field: one pill per value, coloured by its mode. Clicking a pill flips include ↔ exclude; its close button returns the value to neutral (dropping it from the record). Without the variant the same control collapses to a `+n -n` summary — what the FilterBar's multi filter uses.",
      },
    },
  },
  render: () => {
    const [modes, setModes] = useState<Record<string, ComboboxTriStateMode>>({
      PrimaryDB: "include",
      ArchiveDB: "exclude",
    });
    return (
      <div className="w-96 space-y-3">
        <Combobox
          multiple
          tristate
          variant="tags"
          label="Databases"
          placeholder="Include or exclude databases"
          value={modes}
          onChange={setModes}
          options={DATABASE_OPTIONS}
        />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(modes)}
        </div>
      </div>
    );
  },
};

const CLOUD_OPTIONS = [
  { value: "aws", label: "AWS", icon: <span aria-hidden>🟧</span> },
  { value: "gcp", label: "Google Cloud", icon: <span aria-hidden>🔵</span> },
  { value: "azure", label: "Azure", icon: <span aria-hidden>🟦</span> },
];

export const OptionIcons: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Each `ComboboxOption` may carry an `icon` — a runtime icon name (resolved by the registered fallback provider) or a rendered node — shown before the option label in the list.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-64">
        <Combobox
          label="Provider"
          placeholder="Select a cloud"
          value={value}
          onChange={setValue}
          options={CLOUD_OPTIONS}
        />
      </div>
    );
  },
};

const GROUPED_OPTIONS = [
  { value: "demo-svc", label: "demo-svc", group: "Service", icon: <span aria-hidden>🟦</span> },
  { value: "db-svc", label: "db-svc", group: "Service", icon: <span aria-hidden>🟦</span> },
  { value: "demo-ing", label: "demo-ing (demo.example.com)", group: "Ingress", icon: <span aria-hidden>🌐</span> },
  { value: "demo-web", label: "demo-web", group: "Deployment", icon: <span aria-hidden>📦</span> },
  { value: "demo-cycle", label: "demo-cycle", group: "StatefulSet", icon: <span aria-hidden>🗄️</span> },
];

export const Grouped: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Options carrying a `group` render a non-interactive section header above the first option of each group (grouped by contiguous `group` value, in the order provided). Open the menu to see the four `Service` / `Ingress` / `Deployment` / `StatefulSet` headers. Headers are derived from the *filtered* options, so typing a query that empties a group also hides its header, and keyboard navigation skips headers entirely.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-72 space-y-3">
        <Combobox
          label="Workload"
          placeholder="Select workload / service…"
          value={value}
          onChange={setValue}
          options={GROUPED_OPTIONS}
        />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>
    );
  },
};

const MIXED_GROUP_OPTIONS = [
  // Ungrouped options come first and render with no header…
  { value: "recommended", label: "(recommended default)" },
  { value: "none", label: "(none)" },
  // …then the grouped options each start their own section.
  { value: "demo-svc", label: "demo-svc", group: "Service" },
  { value: "demo-ing", label: "demo-ing", group: "Ingress" },
];

export const MixedGrouping: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "`group` is optional. Options without a `group` render no header — place them first so the ungrouped entries read as a lead-in before the first grouped section. Mixing ungrouped and grouped options in one list is supported.",
      },
    },
  },
  render: () => {
    const [value, setValue] = useState("");
    return (
      <div className="w-72 space-y-3">
        <Combobox
          label="Backend"
          placeholder="Pick a backend"
          value={value}
          onChange={setValue}
          options={MIXED_GROUP_OPTIONS}
        />
        <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
          value={JSON.stringify(value)}
        </div>
      </div>
    );
  },
};
