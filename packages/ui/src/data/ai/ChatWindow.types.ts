import type { ReactNode } from "react";
import type { ChatProps } from "../chat/Chat";
import type { ChatWindowState } from "./chat-window-context";
import type { ChatContextItem, ContextTypeConfig } from "./context";
import type { ThreadSource } from "./ThreadPicker";
import type { ToolMeta, ToolMode } from "./ToolPreferences";
import type {
  ToolRenderAdapter,
  ToolRenderRegistry,
} from "../chat/tool-render/adapter";

export type ChatWindowProps = {
  panel: ChatWindowState;
  /** Props forwarded to the inner <Chat>. The window manages `threadId` and
   * merges attached context / tool preferences into `body` on top of these. */
  chat?: Partial<ChatProps>;
  /** Header title shown when the thread picker is disabled. */
  title?: ReactNode;
  /** Canonical Captain session endpoint used for list/create/get/delete and
   * approval resolution, or null to disable persistence. Defaults to
   * "/api/chat/sessions". */
  sessionsApi?: string | null;
  /** Inject the thread list/delete directly instead of fetching `sessionsApi`
   * (e.g. an app that loads conversations via its own client). Shows the
   * picker regardless of `sessionsApi`. */
  threadsSource?: ThreadSource;
  /** Maps context item `type` to an icon/colour for the badge row. */
  contextTypeConfig?: ContextTypeConfig;
  /** When provided, a tool-preferences popover is shown and forwarded as
   * `body.toolPreferences`. Tools default to "ask" (approval required); the
   * user can switch any tool to On/Auto/Off from the popover. */
  tools?: ToolMeta[];
  /** Initial mode assigned to tools when they first load. Defaults to "ask". */
  defaultToolMode?: ToolMode;
  /** Backend tool catalog endpoint. Defaults to "/api/chat/tools"; null disables fetching. */
  toolsApi?: string | null;
  /** Backend runtime catalog endpoint. Null uses the built-in runtime families
   * without probing host availability. */
  runtimesApi?: string | null;
  /** Domain tool input/output renderers forwarded to the inner <Chat>. Host
   * adapters match before the built-in heuristics. */
  toolRenderers?: ToolRenderAdapter[] | ToolRenderRegistry;
  /** Extra controls rendered in the header, e.g. a <ContextMeter mode="gauge"/> gauge. */
  headerExtras?: ReactNode;
  /** Optional app-owned entity/document picker rendered beside context badges. */
  renderContextPicker?: (props: ChatContextPickerRenderProps) => ReactNode;
};

export type ChatContextPickerRenderProps = {
  items: ChatContextItem[];
  onAdd: (item: ChatContextItem) => void;
  onAddMany: (items: ChatContextItem[]) => void;
};
