import { useCallback, useEffect, useState, type ReactNode } from "react";
import { cn } from "../../lib/utils";
import { Button } from "../../components/button";
import { Icon } from "../Icon";
import { UiAdd, UiClose, UiFullscreen } from "../../icons";
import { Chat, type ChatProps } from "../chat/Chat";
import {
  useChatWindowManager,
  type ChatWindowState,
} from "./chat-window-context";
import { ThreadPicker, type ThreadSource } from "./ThreadPicker";
import { ContextBadges } from "./ContextBadges";
import {
  ToolPreferences,
  type ToolMeta,
  type ToolMode,
} from "./ToolPreferences";
import type { ContextTypeConfig } from "./context";
import { chatWindowRequestBody } from "./ChatWindowRequestBody";

export type ChatWindowProps = {
  panel: ChatWindowState;
  /** Props forwarded to the inner <Chat>. The window manages `threadId` and
   *  merges attached context / tool preferences into `body` on top of these. */
  chat?: Partial<ChatProps>;
  /** Header title shown when the thread picker is disabled. */
  title?: ReactNode;
  /** Thread switcher endpoint, or null to hide the picker. Defaults to
   *  "/api/chat/threads". Ignored when `threadsSource` is set. */
  threadsApi?: string | null;
  /** Inject the thread list/delete directly instead of fetching `threadsApi`
   *  (e.g. an app that loads conversations via its own client). Shows the
   *  picker regardless of `threadsApi`. */
  threadsSource?: ThreadSource;
  /** Maps context item `type` to an icon/colour for the badge row. */
  contextTypeConfig?: ContextTypeConfig;
  /** When provided, a tool-preferences popover is shown and forwarded as
   *  `body.toolPreferences`. Tools default to "ask" (approval required); the
   *  user can switch any tool to Auto/Off from the popover. */
  tools?: ToolMeta[];
  /** Initial mode assigned to tools when they first load. Defaults to "ask". */
  defaultToolMode?: ToolMode;
  /** Extra controls rendered in the header, e.g. a <ContextUsage/> gauge. */
  headerExtras?: ReactNode;
};

const MAXIMIZE_CSS = `
.chat-maximized .react-draggable {
  transform: none !important;
  width: auto !important;
  height: auto !important;
  inset: 0 !important;
  position: absolute !important;
}`;

/** A draggable, resizable floating chat window. It lazy-loads `react-rnd` (an
 *  optional dependency, so consumers of just the inner <Chat> never pull it)
 *  and renders the existing <Chat> beneath a drag-handle header with thread
 *  switching, a context-badge row and optional tool preferences. */
export function ChatWindow({
  panel,
  chat,
  title = "Assistant",
  threadsApi = "/api/chat/threads",
  threadsSource,
  contextTypeConfig,
  tools,
  defaultToolMode = "ask",
  headerExtras,
}: ChatWindowProps) {
  const { updatePanel, closePanel, bringToFront, maximizePanel, openPanel } =
    useChatWindowManager();
  const [Rnd, setRnd] = useState<typeof import("react-rnd").Rnd | null>(null);
  const [toolPrefs, setToolPrefs] = useState<Record<string, ToolMode>>({});

  // Tools default to "ask" (human-in-the-loop approval) on chat windows. Seed
  // any tool the user hasn't configured yet; existing choices are preserved.
  // Handles tools that load asynchronously after mount.
  useEffect(() => {
    if (!tools?.length) return;
    setToolPrefs((prev) => {
      const next = { ...prev };
      let changed = false;
      for (const t of tools) {
        const key = t.preferenceKey ?? t.name;
        if (next[key] === undefined) {
          next[key] = t.defaultMode ?? defaultToolMode;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [defaultToolMode, tools]);

  useEffect(() => {
    let active = true;
    import("react-rnd").then((m) => {
      if (active) setRnd(() => m.Rnd);
    });
    return () => {
      active = false;
    };
  }, []);

  const removeContext = useCallback(
    (id: string) =>
      updatePanel(panel.id, {
        contextItems: panel.contextItems.filter((c) => c.id !== id),
      }),
    [updatePanel, panel.id, panel.contextItems],
  );

  const mergedBody = chatWindowRequestBody({
    base: chat?.body,
    contextItems: panel.contextItems,
    tools,
    toolPrefs,
  });

  const initialPrompt = panel.initialPrompt ?? chat?.initialPrompt ?? null;
  const handleInitialPromptSent = useCallback(() => {
    if (panel.initialPrompt) updatePanel(panel.id, { initialPrompt: null });
    chat?.onInitialPromptSent?.();
  }, [chat, panel.id, panel.initialPrompt, updatePanel]);

  const header = (
    <div className="chat-drag-handle flex cursor-move items-center gap-1 border-b border-border bg-muted/40 px-2 py-1.5">
      {threadsSource != null || threadsApi !== null ? (
        <ThreadPicker
          threadId={panel.threadId}
          onSelect={(tid) => updatePanel(panel.id, { threadId: tid })}
          onNew={() => updatePanel(panel.id, { threadId: null })}
          {...(threadsSource
            ? { source: threadsSource }
            : threadsApi !== null
              ? { api: threadsApi }
              : {})}
        />
      ) : (
        <span className="px-1 text-sm font-medium">{title}</span>
      )}
      <div className="flex-1" />
      {headerExtras}
      {tools && (
        <ToolPreferences
          tools={tools}
          value={toolPrefs}
          onChange={setToolPrefs}
        />
      )}
      <Button
        variant="ghost"
        size="icon"
        title="New window"
        onClick={() => openPanel()}
      >
        <Icon icon={UiAdd} className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title={panel.maximized ? "Restore" : "Maximize"}
        onClick={() => maximizePanel(panel.id)}
      >
        <Icon icon={UiFullscreen} className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        title="Close"
        onClick={() => closePanel(panel.id)}
      >
        <Icon icon={UiClose} className="size-4" />
      </Button>
    </div>
  );

  const frame = (
    <div className="flex h-full flex-col overflow-hidden rounded-lg border border-border bg-background shadow-xl">
      {header}
      <ContextBadges
        items={panel.contextItems}
        onRemove={removeContext}
        {...(contextTypeConfig ? { typeConfig: contextTypeConfig } : {})}
      />
      <div className="min-h-0 flex-1">
        <Chat
          {...chat}
          {...(panel.threadId ? { threadId: panel.threadId } : {})}
          body={mergedBody}
          initialPrompt={initialPrompt}
          onInitialPromptSent={handleInitialPromptSent}
        />
      </div>
    </div>
  );

  const outerClass = cn(
    "fixed pointer-events-none",
    panel.maximized ? "inset-4 chat-maximized" : "inset-0",
  );

  // Until react-rnd loads (and as a graceful fallback if it never does) the
  // window is statically positioned — still usable, just not draggable.
  if (!Rnd) {
    return (
      <div className={outerClass} style={{ zIndex: panel.zIndex }}>
        <div
          className="pointer-events-auto h-full"
          style={
            panel.maximized
              ? { position: "relative", width: "100%", height: "100%" }
              : {
                  position: "absolute",
                  left: panel.x,
                  top: panel.y,
                  width: panel.width,
                  height: panel.height,
                }
          }
        >
          {frame}
        </div>
      </div>
    );
  }

  return (
    <div className={outerClass} style={{ zIndex: panel.zIndex }}>
      <style>{MAXIMIZE_CSS}</style>
      <Rnd
        default={{
          x: panel.x,
          y: panel.y,
          width: panel.width,
          height: panel.height,
        }}
        style={{ pointerEvents: "auto" }}
        minWidth={360}
        minHeight={400}
        bounds="parent"
        dragHandleClassName="chat-drag-handle"
        disableDragging={panel.maximized}
        enableResizing={!panel.maximized}
        onDragStart={() => bringToFront(panel.id)}
        onDragStop={(_e, d) => updatePanel(panel.id, { x: d.x, y: d.y })}
        onResizeStop={(_e, _dir, ref, _delta, pos) =>
          updatePanel(panel.id, {
            width: ref.offsetWidth,
            height: ref.offsetHeight,
            x: pos.x,
            y: pos.y,
          })
        }
      >
        {frame}
      </Rnd>
    </div>
  );
}

/** Renders every open window for the current {@link useChatWindowManager}.
 *  Drop one of these near the root alongside a <ChatFab/>. */
export function ChatWindowLayer(props: Omit<ChatWindowProps, "panel">) {
  const { panels } = useChatWindowManager();
  return (
    <>
      {panels.map((panel) => (
        <ChatWindow key={panel.id} panel={panel} {...props} />
      ))}
    </>
  );
}
