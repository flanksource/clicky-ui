import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, screen, userEvent, waitFor, within } from "storybook/test";
import { SessionPicker, type SessionPickerProps, type SessionPickerSession } from "./SessionPicker";

const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

const SESSIONS: SessionPickerSession[] = [
  { id: "sess-0001-scheduler", title: "Review scheduler backoff", provider: "anthropic", model: "claude-sonnet-5", cwd: "/work/acme/scheduler", status: "active", updatedAt: minutesAgo(2), costUsd: 1.25, context: { usedTokens: 50_000, windowTokens: 200_000 } },
  { id: "sess-0002-billing", title: "Fix invoice rounding", provider: "openai", model: "gpt-5-codex", cwd: "/work/acme/billing", status: "sleeping", updatedAt: minutesAgo(45), costUsd: 0.4 },
  { id: "sess-0003-docs", title: "Draft onboarding guide", provider: "google", model: "gemini-3-pro", cwd: "/work/acme/docs", status: "ended", updatedAt: minutesAgo(60 * 26) },
  { id: "sess-0004-untitled", status: "ended", updatedAt: minutesAgo(60 * 24 * 5) },
];

function Controlled(props: Omit<SessionPickerProps, "value" | "onChange"> & { initial?: string; withNew?: boolean }) {
  const { initial, withNew, ...rest } = props;
  const [value, setValue] = useState<string | undefined>(initial);
  return (
    <div className="w-80 space-y-2">
      <SessionPicker {...rest} value={value} onChange={(session) => setValue(session.id)} {...(withNew ? { onNew: () => setValue(undefined) } : {})} />
      <p className="text-xs text-muted-foreground" data-testid="selected-session">{value ?? "new session"}</p>
    </div>
  );
}

const meta = {
  title: "AI/SessionPicker",
  component: Controlled,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A searchable dropdown of agent sessions. Each option shows the provider icon, the title (or a short id) and a status · folder · context · cost · age line. Pass `sessions` or an async `load({signal})`; `onNew` adds a \"New session\" choice that is selected while `value` is undefined, and `groupBy` adds section headers.",
      },
    },
  },
  args: { sessions: SESSIONS, initial: SESSIONS[0]!.id },
} satisfies Meta<typeof Controlled>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("combobox", { name: "Session" });
    await expect(trigger).toHaveTextContent("Review scheduler backoff");
    await userEvent.click(trigger);
    await userEvent.type(screen.getByRole("textbox", { name: "Search Session" }), "invoice");
    const options = within(screen.getByRole("listbox", { name: "Session" })).getAllByRole("option");
    await expect(options).toHaveLength(1);
    await userEvent.click(options[0]!);
    await waitFor(() => expect(canvas.getByTestId("selected-session")).toHaveTextContent("sess-0002-billing"));
  },
};

export const WithNewSession: Story = {
  args: { withNew: true, initial: undefined },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("combobox", { name: "Session" })).toHaveTextContent("New session");
  },
};

export const GroupedByStatus: Story = {
  args: { groupBy: (session: SessionPickerSession) => (session.status === "ended" ? "Ended" : "Live") },
};

export const AsyncLoad: Story = {
  args: {
    sessions: undefined,
    load: () => new Promise<SessionPickerSession[]>((resolve) => setTimeout(() => resolve(SESSIONS), 400)),
  },
  play: async ({ canvasElement }) => {
    const trigger = within(canvasElement).getByRole("combobox", { name: "Session" });
    await waitFor(() => expect(trigger).toHaveTextContent("Review scheduler backoff"));
  },
};

export const LoadError: Story = {
  args: { sessions: undefined, load: () => Promise.reject(new Error("Session list is unavailable")) },
};
