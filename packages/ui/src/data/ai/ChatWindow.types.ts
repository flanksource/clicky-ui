import type { ReactNode } from "react";
import type { ChatProps } from "../chat/Chat";
import type { ChatWindowState } from "./chat-window-context";
import type { ChatContextItem, ContextTypeConfig } from "./context";
import type { ThreadSource } from "./ThreadPicker";
import type { ToolMeta, ToolMode } from "./ToolPreferences";

export type ChatWindowProps = {
  panel: ChatWindowState;
  /** Props forwarded to the inner <Chat>. The window manages `threadId` and
   * merges attached context / tool preferences into `body` on top of these. */
  chat?: Partial<ChatProps>;
  /** Header title shown when the thread picker is disabled. */
  title?: ReactNode;
  /** Thread switcher endpoint, or null to hide the picker. Defaults to
   * "/api/chat/threads". Ignored when `threadsSource` is set. */
  threadsApi?: string | null;
  /** Inject the thread list/delete directly instead of fetching `threadsApi`
   * (e.g. an app that loads conversations via its own client). Shows the
   * picker regardless of `threadsApi`. */
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
