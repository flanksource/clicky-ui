import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import {
  LINT_SEVERITIES,
  TEST_OUTCOMES,
  TEST_TOOLS,
  type LintSeverity,
  type TestOutcome,
  type ToolKind,
} from "./marks";
import { LintSeverityIcon, OutcomeIcon, ToolIcon } from "./MarkIcons";

function Legend({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(13rem,1fr))] gap-x-6 gap-y-1.5 text-sm">
        {children}
      </ul>
    </section>
  );
}

function Row({ icon, label, hint }: { icon: ReactNode; label: string; hint: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
      <code className="ml-auto text-[11px] text-muted-foreground">{hint}</code>
    </li>
  );
}

const KIND_TITLE: Record<ToolKind, string> = {
  test: "Test frameworks",
  fixture: "Fixture steps",
  lint: "Linters",
  runner: "Runner tasks",
};

function Iconography() {
  const tools = Object.entries(TEST_TOOLS);
  return (
    <div className="max-w-3xl space-y-6 p-4">
      <Legend title="Outcomes">
        {(Object.keys(TEST_OUTCOMES) as TestOutcome[]).map((o) => (
          <Row key={o} icon={<OutcomeIcon outcome={o} />} label={TEST_OUTCOMES[o].label} hint={o} />
        ))}
      </Legend>
      <Legend title="Lint severities">
        {(Object.keys(LINT_SEVERITIES) as LintSeverity[]).map((s) => (
          <Row
            key={s}
            icon={<LintSeverityIcon severity={s} />}
            label={LINT_SEVERITIES[s].label}
            hint={s}
          />
        ))}
      </Legend>
      {(Object.keys(KIND_TITLE) as ToolKind[]).map((kind) => (
        <Legend key={kind} title={KIND_TITLE[kind]}>
          {tools
            .filter(([, mark]) => mark.kind === kind)
            .map(([tool, mark]) => (
              <Row key={tool} icon={<ToolIcon tool={tool} />} label={mark.label} hint={tool} />
            ))}
        </Legend>
      ))}
    </div>
  );
}

const meta = {
  title: "Data/TestRunner/Iconography",
  component: Iconography,
  parameters: {
    docs: {
      description: {
        component:
          "The shared marks for test and lint results. Every outcome has its own glyph so none reads by colour alone. Tools are keyed by the identifiers gavel reports (parsers Framework values and each linter's Name()).",
      },
    },
  },
} satisfies Meta<typeof Iconography>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Catalog: Story = {};
