import { useEffect } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { mockChatTransport, MOCK_MODELS } from "../chat/Chat.fixtures";
import { UiComment, UiDatabase, UiFileText } from "../../icons";
import { ChatWindowManagerProvider } from "./ChatWindowManager";
import { ChatWindowLayer } from "./ChatWindow";
import { ChatFab } from "./ChatFab";
import { useChatWindowManager } from "./chat-window-context";
import { makeContextId, type ContextTypeConfig } from "./context";
import { type ThreadSource, type ThreadSummary } from "./ThreadPicker";
import { clickyOperationsToTools } from "../chat/clickyOperationsToTools";
import type { ResolvedOperation } from "../../rpc/types";

const TYPE_CONFIG: ContextTypeConfig = {
  record: { icon: UiDatabase, className: "text-blue-600 bg-blue-50" },
  doc: { icon: UiFileText, className: "text-violet-600 bg-violet-50" },
};

// Tools are derived from a clicky RPC operation catalog, so the popover groups
// them by surface and labels them by the clicky verb/action — exactly how a
// host app wires its backend's operations into the chat window.
const SAMPLE_OPERATIONS: ResolvedOperation[] = [
  op("record_list", "List records", "records", "list", "collection"),
  op("record_get", "Get record", "records", "get", "entity"),
  op("record_delete", "Delete record", "records", "delete", "entity"),
  op("doc_list", "List docs", "docs", "list", "collection"),
  op("doc_create", "Create doc", "docs", "create", "collection"),
];

function op(
  operationId: string,
  summary: string,
  surface: string,
  verb: "list" | "get" | "create" | "delete",
  scope: "collection" | "entity",
): ResolvedOperation {
  return {
    path: `/api/${surface}`,
    method: verb === "create" ? "post" : verb === "delete" ? "delete" : "get",
    operation: {
      operationId,
      summary,
      responses: {},
      "x-clicky": { surface, verb, scope },
    },
  };
}

const TOOLS = clickyOperationsToTools(SAMPLE_OPERATIONS);

// Stories have no chat backend, so serve sample threads for the header's
// conversation switcher directly via an in-memory source (no fetch mocking).
const MOCK_THREADS: ThreadSummary[] = [
  { id: "t-001", title: "Reconcile stuck records", totalCostUsd: 0.12 },
  { id: "t-002", title: "Why is Order 42 failing?", totalCostUsd: 0.04 },
];
let threads = [...MOCK_THREADS];
const THREADS_SOURCE: ThreadSource = {
  load: () => Promise.resolve(threads),
  remove: (id) => {
    threads = threads.filter((t) => t.id !== id);
    return Promise.resolve();
  },
};

const layerProps = {
  threadsSource: THREADS_SOURCE,
  contextTypeConfig: TYPE_CONFIG,
  tools: TOOLS,
  chat: {
    transport: mockChatTransport(),
    models: MOCK_MODELS,
    modelsApi: null,
    defaultModel: "anthropic/claude-sonnet-4-5",
    enableAttachments: true,
    placeholder: "Ask about your data…",
  },
} as const;

/** Opens one populated window on mount so the story shows a window without a
 *  click; the FAB remains for opening more. */
function OpenOnMount() {
  const { openPanel, panels } = useChatWindowManager();
  useEffect(() => {
    if (panels.length === 0) {
      openPanel({
        contextItems: [
          { id: makeContextId(), type: "record", label: "Order 42", fields: { total: "1.2k" } },
          { id: makeContextId(), type: "doc", label: "Q3 report" },
        ],
      });
    }
  }, [openPanel, panels.length]);
  return null;
}

const meta: Meta = {
  title: "AI/ChatWindows",
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "Multi-window chat shell: draggable/resizable floating windows (react-rnd, lazy-loaded), a launch FAB, a conversation thread switcher, a context-badge row, and per-tool preferences. The inner <Chat> footer carries a strict model picker with provider brand icons, a reasoning-effort picker, and a token/cost gauge (after the first reply). Drives a mock transport. Drag the header, resize from the edges, maximize, switch threads, or open more windows with the + button / FAB.",
      },
    },
  },
};

export default meta;
type Story = StoryObj;

export const MultiWindow: Story = {
  render: () => (
    <ChatWindowManagerProvider storageId="story">
      <div className="h-screen w-screen bg-muted/30">
        <OpenOnMount />
        <ChatFab icon={UiComment} />
        <ChatWindowLayer {...layerProps} />
      </div>
    </ChatWindowManagerProvider>
  ),
};

export const LaunchFromFab: Story = {
  render: () => (
    <ChatWindowManagerProvider storageId="story-fab">
      <div className="h-screen w-screen bg-muted/30">
        <ChatFab icon={UiComment} />
        <ChatWindowLayer {...layerProps} />
      </div>
    </ChatWindowManagerProvider>
  ),
};
