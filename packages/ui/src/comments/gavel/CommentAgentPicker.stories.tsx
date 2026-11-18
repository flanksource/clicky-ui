import type { Meta, StoryObj } from "@storybook/react-vite";
import { useCallback, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import type { SpecRuntimeFamily } from "../../data/runtime/runtime-mode";
import { CommentAgentPicker, type CommentAgentPickerProps } from "./CommentAgentPicker";
import type { CommentAgent, CommentAgentPatch, CommentAgentSettings, GavelAgentSession } from "./gavel-delivery";
import type { GavelAgents } from "./useGavelAgents";

type Provenance = CommentAgentSettings["agent"]["provenance"];

const USER_LAYER = { kind: "user", file: ".gavel.yaml", location: "/home/example/.gavel.yaml", config: {} } as const;
/** A project with no settings file saves to its database layer. */
const settings: CommentAgentSettings["settings"] = {
  positions: [{ kind: "project", dir: "/work/site", files: [], db: true }],
  provenance: {},
  layers: [USER_LAYER, { kind: "project", location: "db", config: {} }],
};
/** A project with its own .gavel.yaml: gavel takes saves in that file and refuses the database layer. */
const fileSettings: CommentAgentSettings["settings"] = {
  positions: [{ kind: "project", dir: "/work/site", files: [".gavel.yaml"], db: false }],
  provenance: {},
  layers: [USER_LAYER, { kind: "project", file: ".gavel.yaml", location: "/work/site/.gavel.yaml", config: {} }],
};
const USER = { layer: "/home/example/.gavel.yaml" };
const PROJECT = { layer: "db:project:", page: "docs/README.md" };
const PROJECT_FILE = { layer: "/work/site/.gavel.yaml", page: "docs/README.md" };

/** What gavel does with a merge patch: a field present replaces it, a field set to null is removed. */
function applyMergePatch(entry: CommentAgent, patch: CommentAgentPatch): CommentAgent {
  return Object.fromEntries(Object.entries({ ...entry, ...patch }).filter(([, value]) => value !== null)) as CommentAgent;
}

/** A stand-in for `useGavelAgents` that keeps its state locally, and fails every write with `failSaves` when given. */
function useFakeAgents(options: { initial: CommentAgent; provenance: Provenance; failSaves?: string; fileBacked?: boolean; session?: string }): GavelAgents {
  const layerSettings = options.fileBacked ? fileSettings : settings;
  const own = options.fileBacked ? PROJECT_FILE : PROJECT;
  const [agent, setAgent] = useState(options.initial);
  const [provenance, setProvenance] = useState(options.provenance);
  const [error, setError] = useState<string | null>(null);
  const change = useCallback(
    async (patch: Parameters<GavelAgents["save"]>[0]["agent"]) => {
      if (options.failSaves) {
        setError(options.failSaves);
        return;
      }
      const next = patch === null ? {} : applyMergePatch(agent, patch);
      setAgent(next);
      setProvenance(Object.fromEntries(Object.keys(next).map((field) => [field, provenance[field as keyof Provenance] ?? own])) as Provenance);
      setError(null);
    },
    [agent, provenance, options.failSaves, own],
  );
  return {
    agent: { agent, provenance, found: true },
    settings: layerSettings,
    session: options.session,
    ownLayer: options.fileBacked ? { kind: "project", file: ".gavel.yaml" } : { kind: "project" },
    enabled: agent.enabled === true,
    edits: agent.edits ?? "direct",
    ready: true,
    error,
    save: async (input) => {
      await change(input.agent);
      return { settings: layerSettings, agent: { agent, provenance, found: true } };
    },
    setEnabled: async (on) => change({ enabled: on }),
    setEdits: async (edits) => change({ edits }),
  };
}

const families: SpecRuntimeFamily[] = [{ id: "claude", label: "Claude", provider: "anthropic", modes: [{ id: "agent", label: "Agent", defaultModel: "claude-example", provider: "anthropic" }] }];
const prompts = [
  { id: "editor-comments", label: "Editor comments", description: "Works comment threads in the project directory." },
  { id: "doc-review", label: "Document review" },
];
const sessions: GavelAgentSession[] = [
  { id: "s-live", source: "claude", title: "Review the docs", model: "claude-example", cwd: "/work/site", status: "active", inCmux: true, context: { usedTokens: 60_000, windowTokens: 200_000 } },
  { id: "s-ended", source: "claude", title: "Welcome threads", status: "ended", managed: true, resumable: true, inCmux: false },
];

function Harness(props: { initial: CommentAgent; provenance: Provenance; failSaves?: string; fileBacked?: boolean; session?: string } & Omit<CommentAgentPickerProps, "agents">) {
  const { initial, provenance, failSaves, fileBacked, session, ...rest } = props;
  const agents = useFakeAgents({ initial, provenance, ...(failSaves ? { failSaves } : {}), ...(fileBacked ? { fileBacked } : {}), ...(session ? { session } : {}) });
  return <CommentAgentPicker agents={agents} {...rest} />;
}

const meta = {
  title: "Comments/CommentAgentPicker",
  component: Harness,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  args: { initial: {}, provenance: {}, prompts, runtimes: { models: [], families }, heading: "Comment agent" },
  decorators: [
    (Story) => (
      <div className="max-w-md rounded-md border border-border bg-card">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Harness>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Auto-run is off, yet how the agent edits is still saved: choosing "Edit directly" leaves auto-run off. */
export const ProposeWithAutoRunOff: Story = {
  args: { initial: { enabled: false, edits: "propose" }, provenance: { enabled: PROJECT, edits: PROJECT } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("radio", { name: "Propose patches" })).toBeChecked();
    await expect(canvas.getByRole("switch", { name: "Auto-run new comments" })).not.toBeChecked();
    await userEvent.click(canvas.getByRole("radio", { name: "Edit directly" }));
    await waitFor(() => expect(canvas.getByRole("radio", { name: "Edit directly" })).toBeChecked());
    await expect(canvas.getByRole("switch", { name: "Auto-run new comments" })).not.toBeChecked();
  },
};

/** Values the user's own `.gavel.yaml` sets show that file; the project layer can override them but cannot "inherit" what it does not hold. */
export const InheritedValues: Story = {
  args: {
    initial: { enabled: true, assign: true, prompt: "doc-review", instructions: "Keep replies short.", edits: "propose" },
    provenance: { enabled: USER, assign: USER, prompt: USER, instructions: PROJECT, edits: USER },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getAllByText(".gavel.yaml").length).toBeGreaterThanOrEqual(4);
    await expect(canvas.getByRole("button", { name: "Inherit instructions" })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Inherit prompt" })).toBeNull();
  },
};

/** A project with its own .gavel.yaml: its values name that file, and Inherit removes the field from it, since gavel refuses a database layer beside it. */
export const FileBackedProject: Story = {
  args: {
    fileBacked: true,
    initial: { enabled: true, prompt: "doc-review", instructions: "Keep replies short." },
    provenance: { enabled: USER, prompt: PROJECT_FILE, instructions: PROJECT_FILE },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Inherit prompt" })).toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "Inherit enabled" })).toBeNull();
    await userEvent.click(canvas.getByRole("button", { name: "Inherit prompt" }));
    await waitFor(() => expect(canvas.queryByRole("button", { name: "Inherit prompt" })).toBeNull());
  },
};

/** `gavel edit --session` routes every new thread to one live session, ahead of the rule. */
export const RoutedToSession: Story = {
  args: { initial: { enabled: true }, provenance: { enabled: PROJECT }, session: "claude-site-1" },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByTestId("agent-session-route")).toHaveTextContent("claude-site-1");
  },
};

/** A refused write is shown and the previous choice stays. */
export const SaveError: Story = {
  args: { initial: { enabled: false, edits: "direct" }, provenance: { edits: PROJECT }, failSaves: "403 only humans can change comment agents" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("radio", { name: "Propose patches" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent("403 only humans can change comment agents");
    await expect(canvas.getByRole("radio", { name: "Edit directly" })).toBeChecked();
  },
};

/** Auto-run on, grouping, and the live and resumable sessions threads can be delivered to. */
export const WithSessions: Story = {
  args: {
    initial: { enabled: true, edits: "direct", group: "docs" },
    provenance: { enabled: PROJECT, edits: PROJECT, group: PROJECT },
    grouping: { value: "page", onChange: fn() },
    sessions: { items: sessions, state: "ready", selectedId: "s-live", onSelect: fn(), onNew: fn(), assignAll: { count: 2, onSession: fn(), onNew: fn() } },
  },
};
