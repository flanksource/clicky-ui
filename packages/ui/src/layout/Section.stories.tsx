import type { Meta, StoryObj } from "@storybook/react-vite";
import { DetailEmptyState, Section } from "./Section";

const meta: Meta<typeof Section> = {
  title: "Layout/Section",
  component: Section,
};

export default meta;
type Story = StoryObj<typeof Section>;

export const Default: Story = {
  args: {
    title: "Configuration",
    summary: "4 items",
    defaultOpen: true,
    children: (
      <ul className="text-sm space-y-density-1">
        <li>key = value</li>
        <li>timeout = 30s</li>
        <li>retries = 3</li>
        <li>mode = strict</li>
      </ul>
    ),
  },
};

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
    icon: "codicon:error",
    children: <div className="text-sm">Stack traces here.</div>,
  },
};

export const Empty: Story = {
  render: () => (
    <DetailEmptyState
      icon="codicon:inbox"
      label="Nothing selected"
      description="Pick an item from the tree to see its details."
    />
  ),
};
