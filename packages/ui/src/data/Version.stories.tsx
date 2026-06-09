import type { Meta, StoryObj } from "@storybook/react-vite";
import { Version } from "./Version";

const info = {
  commit: "a1b2c3d",
  tag: "v1.2.3",
  date: "2026-06-09T07:30:00.000Z",
  dirty: false,
  mode: "production" as const,
};

const meta = {
  title: "Data/Version",
  component: Version,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Renders clicky-ui build metadata — git tag, commit, and build date — with a status badge for a dirty working tree, Vite dev mode, or Storybook. Commit/tag/date/dirty are captured at library build time via Vite `define`; dev/storybook are detected at runtime. Stories use the `info` prop to simulate each state.",
      },
    },
  },
  argTypes: {
    commit: { control: "boolean", description: "Show the short git commit hash." },
    tag: { control: "boolean", description: "Show the git tag." },
    date: { control: "boolean", description: "Show the build date." },
  },
  args: { commit: true, tag: true, date: true, info },
} satisfies Meta<typeof Version>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const DateOnly: Story = {
  name: "Build date only",
  args: { commit: false, tag: false },
};

export const Dirty: Story = {
  name: "Dirty working tree",
  args: { info: { ...info, dirty: true } },
};

export const DevMode: Story = {
  name: "Vite dev",
  args: { info: { ...info, mode: "dev" } },
};

export const Storybook: Story = {
  args: { info: { ...info, mode: "storybook" } },
};

export const AllStatuses: Story = {
  name: "All states",
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <Version info={info} />
      <Version info={{ ...info, dirty: true }} />
      <Version info={{ ...info, mode: "dev" }} />
      <Version info={{ ...info, mode: "storybook" }} />
      <Version info={{ ...info, dirty: true, mode: "dev" }} />
    </div>
  ),
};
