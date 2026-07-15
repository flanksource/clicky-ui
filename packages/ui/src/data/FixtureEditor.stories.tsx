import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JsonSchemaObject } from "../components/json-schema-form-types";
import gavelFixturesSchema from "../generated/storybook/gavel-fixtures.schema.json";
import { FixtureEditor } from "./FixtureEditor";
import type { FixtureEditorProps, FixtureFenceSchemas } from "./FixtureEditor";

type GavelFixtureSchemaDocument = {
  frontmatter?: JsonSchemaObject;
  fences?: Record<
    string,
    {
      schema?: JsonSchemaObject;
      aliases?: string[];
    }
  >;
};

const gavelSchemaDoc = gavelFixturesSchema as GavelFixtureSchemaDocument;
const gavelFenceSchemas = gavelSchemaDoc.fences ?? {};

const schemas: FixtureFenceSchemas = {};
for (const [name, config] of Object.entries(gavelFenceSchemas)) {
  if (!config.schema) continue;
  schemas[name] = config.schema;
  for (const alias of config.aliases ?? []) {
    schemas[alias] = config.schema;
  }
}

const frontmatterEditor: FixtureEditorProps["frontmatterEditor"] = {};

const allowedFences = [
  { info: "yaml test", label: "test", description: "Gavel test options" },
  { info: "yaml lint", label: "lint", description: "Gavel lint options" },
  { info: "ai", label: "ai", description: "Reviewer instructions" },
  { info: "exec", label: "exec", description: "Shell command or script" },
  { info: "bash", label: "bash" },
];

const sampleFixture = [
  "---",
  "ai:",
  "  model: claude-code-sonnet",
  "  maxTokens: 10000",
  "  maxConcurrent: 4",
  "verify:",
  "  scope: diff",
  "  threshold: 80",
  "---",
  "",
  "# Definition of done",
  "",
  "These checks run before the todo can be marked verified.",
  "",
  "Use source mode for fixture authoring details:",
  "",
  "```bash",
  "pnpm --filter @flanksource/clicky-ui test",
  "```",
  "",
  "- [ ] dependencies installed",
  "- [x] fixture parser accepts the file",
  "",
  "```yaml test",
  "paths:",
  "  - packages/ui/src/data/FixtureEditor",
  "framework:",
  "  - vitest",
  "test-timeout: 2m",
  "show-passed: true",
  "show-failed: true",
  "```",
  "",
  "```yaml lint",
  "files:",
  "  - packages/ui/src/data/FixtureEditor",
  "linters:",
  "  - oxlint",
  "changed: true",
  "fix: false",
  "show-failed: true",
  "```",
  "",
  "```ai",
  "Focus review comments on fixture parsing and deterministic assertions.",
  "```",
  "",
  "```exec",
  "content: |",
  "  pnpm --filter @flanksource/clicky-ui exec vitest run src/data/FixtureEditor",
  "exitCode: 0",
  "cel: exitCode == 0",
  "```",
].join("\n");

const meta: Meta<typeof FixtureEditor> = {
  title: "Data/FixtureEditor",
  component: FixtureEditor,
  args: {
    value: sampleFixture,
    schemas,
    allowedFences,
    frontmatterEditor,
  },
  render: (args) => <FixtureEditorStory {...args} />,
  parameters: {
    docs: {
      description: {
        component:
          "Reusable fixture editor for one markdown fixture document. Rich/source MDX editing handles prose, checklists, tables, and normal code fences; test/lint runner fences render as schema-backed cards keyed by runner kind or full fence info string.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof FixtureEditor>;

export const TestAndLintFences: Story = {};

export const RichMarkdownAndExpandableFences: Story = {};

export const EmptyFixture: Story = {
  args: {
    value: "",
  },
};

export const UnknownFence: Story = {
  args: {
    value: ["```yaml deploy", "name: deploy smoke", "```"].join("\n"),
  },
};

export const MalformedYaml: Story = {
  args: {
    value: ["```yaml test", "name: [", "```"].join("\n"),
  },
};

export const ChecklistEditing: Story = {
  args: {
    value: ["- [ ] write fixture", "- [x] parse fixture"].join("\n"),
  },
};

export const ReadOnly: Story = {
  args: {
    readOnly: true,
  },
};

export const ShellAndTableFixture: Story = {
  args: {
    value: [
      "| command | expected |",
      "| --- | --- |",
      "| `pnpm test` | pass |",
      "",
      "```bash",
      "pnpm --filter @flanksource/clicky-ui test",
      "```",
    ].join("\n"),
  },
};

function FixtureEditorStory(args: FixtureEditorProps) {
  const [value, setValue] = useState(args.value);

  useEffect(() => {
    setValue(args.value);
  }, [args.value]);

  return <FixtureEditor {...args} value={value} onChange={setValue} />;
}
