import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactNode } from "react";
import { MATRIX_MARKS, MATRIX_ORDER, type MatrixEnvCounts } from "./matrix-marks";
import {
  EmptyMatrixCell,
  EnvChip,
  MatrixElapsed,
  MatrixEnvHeader,
  MatrixLegend,
  MatrixMark,
  MatrixMix,
  MatrixUnavailableEnvHeader,
} from "./MatrixMarks";

const FINISHED: MatrixEnvCounts = { passed: 9, warned: 2, failed: 1, error: 0, running: 0, queued: 0, total: 12 };
const RUNNING: MatrixEnvCounts = { passed: 4, warned: 1, failed: 0, error: 1, running: 2, queued: 4, total: 12 };

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function MatrixVocabulary({ static: isStatic }: { static: boolean }) {
  return (
    <div className="max-w-4xl space-y-6 p-4 text-sm">
      <Section title="Marks">
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(12rem,1fr))] gap-x-6 gap-y-1.5">
          {MATRIX_ORDER.map((key) => (
            <li key={key} className="flex items-center gap-2">
              <MatrixMark mark={key} className="size-4" static={isStatic} />
              <span className={MATRIX_MARKS[key].tone}>{MATRIX_MARKS[key].label}</span>
              <code className="ml-auto text-[11px] text-muted-foreground">{key}</code>
            </li>
          ))}
        </ul>
      </Section>
      <Section title="Mix, elapsed and empty cells">
        <div className="flex flex-wrap items-center gap-4">
          <MatrixMix counts={{ passed: 14, warned: 2, failed: 1, running: 1, skipped: 3 }} unit="steps" static={isStatic} />
          <MatrixMix counts={{ passed: 5 }} unit="plans" always={["failed"]} static={isStatic} />
          <MatrixElapsed ms={252_000} running={false} clock />
          <MatrixElapsed ms={42_000} running />
          <EnvChip context="dev" />
        </div>
        <div className="flex flex-wrap items-center gap-6">
          <EmptyMatrixCell outcome="queued" title="smoke.yaml in dev: queued" />
          <EmptyMatrixCell outcome="error" detail="never started" title="smoke.yaml in dev: failed before it started" />
          <EmptyMatrixCell outcome="absent" title="smoke.yaml was not part of the dev run" />
          <EmptyMatrixCell outcome="queued" title="bare: queued" bare />
        </div>
      </Section>
      <Section title="Environment headers">
        <div className="grid grid-cols-3 divide-x rounded-lg border bg-muted/40">
          <div className="px-3 py-2">
            <MatrixEnvHeader
              context="staging"
              counts={FINISHED}
              durationMs={3_780_000}
              running={false}
              static={isStatic}
              renderChip={(chip) => (
                <a href="#staging" title="Open the staging run" className="rounded-sm underline-offset-2 hover:underline">
                  {chip}
                </a>
              )}
            />
          </div>
          <div className="px-3 py-2">
            <MatrixEnvHeader context="dev" counts={RUNNING} durationMs={252_000} running static={isStatic} />
          </div>
          <div className="px-3 py-2">
            <MatrixUnavailableEnvHeader context="uat" />
          </div>
        </div>
      </Section>
      <Section title="Legend">
        <MatrixLegend static={isStatic} />
      </Section>
    </div>
  );
}

const meta = {
  title: "Data/TestRunner/Matrix marks",
  component: MatrixVocabulary,
  args: { static: false },
  parameters: {
    docs: {
      description: {
        component:
          "The bulk test matrix's glyph vocabulary (MATRIX_MARKS): plan cells, sub-steps, environment headers and the legend all draw these marks, in this order. `static` is print mode — no spin, no pulse, no links — so a facet report draws the same theme as the live matrix.",
      },
    },
  },
} satisfies Meta<typeof MatrixVocabulary>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Live: Story = {};

export const Print: Story = { args: { static: true } };
