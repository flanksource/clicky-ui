import type { Meta, StoryObj } from "@storybook/react-vite";
import { JsonView } from "./JsonView";
import {
  largeJsonSource,
  ndjsonSource,
  truncatedArraySource,
  truncatedObjectSource,
  truncatedStringSource,
} from "./json-view/story-fixtures";

const meta: Meta<typeof JsonView> = {
  title: "Data/JsonView",
  component: JsonView,
  args: {
    defaultOpenDepth: 2,
    format: "yaml",
  },
  argTypes: {
    data: {
      description:
        "Parsed value to display. Mutually exclusive with source; strings remain literal values.",
    },
    source: {
      control: "text",
      description:
        "Raw JSON or NDJSON text. Mutually exclusive with data; interrupted input retains completed values.",
      table: { type: { summary: "string" } },
    },
    inputFormat: {
      description:
        "Encoding of source: one JSON document or one JSON value per nonempty NDJSON line. Defaults to json.",
      control: "inline-radio",
      options: ["json", "ndjson"],
      table: {
        type: { summary: '"json" | "ndjson"' },
        defaultValue: { summary: "json" },
      },
    },
    format: {
      description:
        "Display syntax, independent of inputFormat. Defaults to YAML; JSON uses braces and quoted strings.",
      control: "inline-radio",
      options: ["yaml", "json"],
      table: {
        type: { summary: '"yaml" | "json"' },
        defaultValue: { summary: "yaml" },
      },
    },
    density: {
      description:
        "Override the inherited application density with compact, comfortable, or spacious rows.",
      control: "select",
      options: ["compact", "comfortable", "spacious"],
      table: {
        type: { summary: '"compact" | "comfortable" | "spacious"' },
        defaultValue: { summary: "Inherited" },
      },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Collapsible structured-data viewer with YAML as the default format. Pass a parsed value with data, or raw text with source and inputFormat="json" or "ndjson". Cut-off input shows completed values with an incomplete warning; malformed syntax shows a diagnostic. NDJSON keeps complete records in order, ignores blank lines, and labels an incomplete final record separately. Original source stays inspectable. Set format="json" for braces and quoted strings. Density follows the application or Storybook toolbar; the density prop overrides it for one viewer.',
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof JsonView>;

export const MixedTypes: Story = {
  args: {
    name: "config",
    data: {
      name: "scraper",
      enabled: true,
      retries: 3,
      tags: ["alpha", "beta"],
      owner: null,
      metadata: {
        created: "2026-01-01",
        stats: { runs: 42, failures: 2 },
      },
    },
  },
};

export const DeepNested: Story = {
  args: {
    data: {
      a: { b: { c: { d: { e: "deep" } } } },
    },
    defaultOpenDepth: 3,
  },
};

export const EmptyContainers: Story = {
  args: { data: { obj: {}, arr: [] } },
};

export const Json: Story = {
  args: { ...MixedTypes.args, format: "json" },
};

export const Compact: Story = {
  args: { ...MixedTypes.args, density: "compact" },
};

export const Comfortable: Story = {
  args: { ...MixedTypes.args, density: "comfortable" },
};

export const Spacious: Story = {
  args: { ...MixedTypes.args, density: "spacious" },
};

export const YamlStringsAndSequences: Story = {
  args: {
    defaultOpenDepth: 4,
    data: {
      strings: ["true", "null", "42", "", "a: b", "first\nsecond"],
      "special: key": "safely quoted",
      services: [
        { name: "api", ports: [8080, 9090] },
        { name: "worker", ports: [] },
      ],
    },
  },
};

export const VeryLargeJson: Story = {
  args: { source: largeJsonSource, defaultOpenDepth: 1 },
  argTypes: { source: { control: false } },
  decorators: [
    (Story) => (
      <div className="h-[32rem] overflow-auto">
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story: `10,000 deterministic records in 100 batches, ${(largeJsonSource.length / 1024 / 1024).toFixed(1)} MiB of raw JSON. Expand batches, then a batch and its records. All records are retained; only expanded branches mount their children.`,
      },
      source: {
        code: "<JsonView source={largeJsonSource} defaultOpenDepth={1} />",
      },
    },
  },
};

export const TruncatedJson: Story = {
  args: { source: truncatedObjectSource, defaultOpenDepth: 4 },
  parameters: {
    docs: {
      description: {
        story:
          "The document ends inside a nested object. Completed metrics remain visible; the pending latency value is omitted. Open Original source to inspect the exact cut-off text.",
      },
    },
  },
};

export const TruncatedArray: Story = {
  args: { source: truncatedArraySource, defaultOpenDepth: 4 },
  parameters: {
    docs: {
      description: {
        story:
          "The document ends inside an array item. Completed ports and the final item's completed name remain inspectable.",
      },
    },
  },
};

export const TruncatedString: Story = {
  args: { source: truncatedStringSource },
  parameters: {
    docs: {
      description: {
        story:
          "The document ends inside a string. The unfinished message is omitted rather than presented as a completed value.",
      },
    },
  },
};

export const Ndjson: Story = {
  name: "NDJSON",
  args: { source: ndjsonSource, inputFormat: "ndjson", defaultOpenDepth: 3 },
  parameters: {
    docs: {
      description: {
        story:
          "Two complete log records followed by an interrupted third record. Completed records retain their order; recovered fields from line 3 are shown separately with an incomplete label.",
      },
    },
  },
};
