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
    collapsible: { control: "boolean" },
    icon: { table: { disable: true } },
    children: { table: { disable: true } },
    onToggle: { table: { disable: true } },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Collapsible layout section for dense detail screens. It supports controlled or uncontrolled open state, summaries, icons, semantic tone accents, and custom header/body classes. Only the chevron + title toggle — the summary is a sibling of the toggle, so a summary containing its own interactive content (filters, links) is valid DOM and its clicks do not collapse the section. Pass `collapsible={false}` for a fixed panel that always shows its body.",
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

// The summary can hold its own interactive controls — they are a sibling of the
// toggle, so clicking them does not collapse the section (and is valid DOM).
export const InteractiveSummary: Story = {
  args: {
    title: "Activities",
    defaultOpen: true,
    summary: (
      <span className="inline-flex gap-density-1">
        {["All", "OK", "Failed"].map((label) => (
          <button
            key={label}
            type="button"
            className="rounded border border-border px-density-2 py-px text-xs hover:bg-accent/50"
          >
            {label}
          </button>
        ))}
      </span>
    ),
  },
};

// A non-collapsible section: no chevron, no toggle, the body is always shown.
export const NonCollapsible: Story = {
  args: {
    title: "Fixed Panel",
    collapsible: false,
    summary: "always open",
  },
};
