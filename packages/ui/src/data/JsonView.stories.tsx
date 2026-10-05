import type { Meta, StoryObj } from "@storybook/react-vite";
import { JsonView } from "./JsonView";

const meta: Meta<typeof JsonView> = {
  title: "Data/JsonView",
  component: JsonView,
  args: {
    data: { service: "api", status: "healthy", replicas: 3 },
    defaultOpenDepth: 2,
    format: "yaml",
  },
  argTypes: {
    format: {
      control: "inline-radio",
      options: ["yaml", "json"],
      table: { defaultValue: { summary: "yaml" } },
    },
    density: {
      control: "select",
      options: ["compact", "comfortable", "spacious"],
      table: { defaultValue: { summary: "Inherited" } },
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          'Collapsible structured-data viewer with YAML as the default format. Set format="json" for braces and quoted strings. Density follows the application or Storybook toolbar (compact, comfortable, spacious); the density prop overrides it for one viewer. Objects and arrays expand by depth, with type-aware coloring and safely quoted YAML strings.',
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
