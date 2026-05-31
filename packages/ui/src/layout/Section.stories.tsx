import type { Meta, StoryObj } from "@storybook/react-vite";
import { UiError } from "../icons";
import { Section } from "./Section";

const meta: Meta<typeof Section> = {
  title: "Layout/Section",
  component: Section,
  args: {
    title: "Configuration",
    summary: "4 items",
    defaultOpen: true,
    tone: "default",
    children: (
      <ul className="text-sm space-y-density-1">
        <li>key = value</li>
        <li>timeout = 30s</li>
        <li>retries = 3</li>
        <li>mode = strict</li>
      </ul>
    ),
  },
  argTypes: {
    tone: {
      control: "inline-radio",
      options: ["default", "danger", "warning", "success", "info"],
    },
    icon: { table: { disable: true } },
    children: { table: { disable: true } },
    onToggle: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Collapsible layout section for dense detail screens. It supports controlled or uncontrolled open state, summaries, icons, semantic tone accents, and custom header/body classes.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Section>;

export const Default: Story = {};

export const Nested: Story = {
  render: () => (
    <div className="space-y-density-2">
      <Section title="Metadata" summary="3 fields" defaultOpen>
        <Section title="Created" summary="2026-01-01" defaultOpen>
          <span className="text-xs">by alice</span>
        </Section>
        <Section title="Updated" summary="2026-04-12">
          <span className="text-xs">by bob</span>
        </Section>
      </Section>
    </div>
  ),
};

export const DangerTone: Story = {
  args: {
    title: "Errors",
    tone: "danger",
    summary: "3 violations",
    defaultOpen: true,
    icon: UiError,
    children: <div className="text-sm">Stack traces here.</div>,
  },
};
