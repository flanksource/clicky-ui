import type { Decorator, Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, waitFor, within } from "storybook/test";
import { useEffect, useRef } from "react";
import { EventSourceProvider } from "../../hooks/event-source-provider";
import { SessionChatComposer } from "./SessionChatComposer";
import { SessionInspector } from "./SessionInspector";
import { INSPECTOR_SESSION } from "./SessionViewer.fixtures";

const CAPABILITIES = {
  interrupt: true,
  steer: false,
  followUp: true,
  resume: true,
};

const LONG_SESSION = {
  ...INSPECTOR_SESSION,
  messages: Array.from({ length: 40 }, (_, index) => ({
    id: `message-${index}`,
    role: index % 2 ? ("user" as const) : ("assistant" as const),
    parts: [
      {
        type: "text" as const,
        text: `Transcript message ${index + 1}\n\nEnough text to make the transcript taller than a phone screen.`,
      },
    ],
  })),
};

const meta = {
  title: "AI/SessionInspector/Pinned composer",
  component: SessionInspector,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    viewport: { defaultViewport: "mobile1" },
    docs: {
      description: {
        component:
          "The `composer` slot is always pinned to the bottom of the inspector and never scrolls with the transcript. It renders in every load state (loading, error, ready) in both layouts, so a host can show it disabled with the reason instead of hiding it.",
      },
    },
  },
  argTypes: {
    session: { table: { disable: true } },
    composer: { table: { disable: true } },
  },
  render: (args) => (
    <div className="h-dvh overflow-hidden">
      <SessionInspector {...args} />
    </div>
  ),
} satisfies Meta<typeof SessionInspector>;

export default meta;
type Story = StoryObj<typeof meta>;

function composer(disabledReason?: string) {
  return (
    <SessionChatComposer
      status="idle"
      capabilities={CAPABILITIES}
      onSubmit={fn()}
      {...(disabledReason ? { disabledReason } : {})}
    />
  );
}

/** Asserts the visible contract: the composer's bottom edge is inside the
 *  viewport and the document itself has nothing to scroll. */
async function expectComposerPinned(
  canvasElement: HTMLElement,
  placeholder: string,
) {
  const textbox = within(canvasElement).getByPlaceholderText(placeholder);
  await waitFor(() => {
    expect(textbox.getBoundingClientRect().bottom).toBeLessThanOrEqual(
      window.innerHeight,
    );
    expect(document.scrollingElement!.scrollHeight).toBeLessThanOrEqual(
      window.innerHeight,
    );
  });
}

const SRC = "/stories/captain/sessions/pinned";

function withSessionFetch(respond: () => Promise<Response>): Decorator {
  return (Story) => {
    const original = useRef<typeof globalThis.fetch | undefined>(undefined);
    if (original.current === undefined) original.current = globalThis.fetch;
    globalThis.fetch = (() => respond()) as typeof fetch;
    useEffect(
      () => () => {
        if (original.current) globalThis.fetch = original.current;
      },
      [],
    );
    return (
      <EventSourceProvider
        value={() => {
          throw new Error("the follow stream must not open in this story");
        }}
      >
        <Story />
      </EventSourceProvider>
    );
  };
}

export const LoadingDisabledWithReason: Story = {
  args: {
    src: SRC,
    follow: false,
    layout: "compact",
    composer: composer("Loading session…"),
  },
  decorators: [withSessionFetch(() => new Promise<Response>(() => {}))],
  play: async ({ canvasElement }) => {
    const textbox = within(canvasElement).getByPlaceholderText("Loading session…");
    await expect(textbox).toBeDisabled();
    await expectComposerPinned(canvasElement, "Loading session…");
  },
};

export const ErrorDisabledWithReason: Story = {
  args: {
    src: SRC,
    follow: false,
    layout: "compact",
    composer: composer("This session cannot be read"),
  },
  decorators: [
    withSessionFetch(async () =>
      new Response(JSON.stringify({ error: "session pinned not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }),
    ),
  ],
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "session pinned not found",
    );
    await expect(
      canvas.getByPlaceholderText("This session cannot be read"),
    ).toBeDisabled();
    await expectComposerPinned(canvasElement, "This session cannot be read");
  },
};

export const ReadyCompact: Story = {
  args: { session: LONG_SESSION, layout: "compact", composer: composer() },
  play: async ({ canvasElement }) => {
    await expectComposerPinned(canvasElement, "Continue this session…");
  },
};

export const ReadyDefaultLayout: Story = {
  args: { session: LONG_SESSION, composer: composer() },
  play: async ({ canvasElement }) => {
    await expectComposerPinned(canvasElement, "Continue this session…");
  },
};
