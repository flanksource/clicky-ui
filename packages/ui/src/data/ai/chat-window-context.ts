// Non-component half of the chat window manager: the context object, the hook,
// id helpers, persistence and layout maths. Split from the Provider (a .tsx
// component) so this file stays JSX-free — matching the repo idiom of keeping
// context/hooks in a .ts (see hooks/use-theme.ts, data/test-runner/context.ts)
// and keeping React-Fast-Refresh happy.
import { createContext, useContext } from "react";
import type { ChatContextItem } from "./context";
import { zIndex } from "../../overlay/zIndex";

/** Live state of one floating chat window. Position/size/maximized are
 *  persisted to localStorage; the rest is session-only. */
export interface ChatWindowState {
  id: string;
  threadId: string | null;
  initialModel: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  maximized: boolean;
  /** A prompt to auto-send when the window mounts (the `id` lets the window
   *  detect a fresh request even if the text repeats). */
  initialPrompt: { id: number; text: string } | null;
  contextItems: ChatContextItem[];
}

export interface OpenPanelOpts {
  threadId?: string | null;
  initialModel?: string | null;
  initialPrompt?: { id: number; text: string } | null;
  contextItems?: ChatContextItem[];
}

export interface ChatWindowManagerValue {
  panels: ChatWindowState[];
  openPanel: (opts?: OpenPanelOpts) => string;
  closePanel: (id: string) => void;
  updatePanel: (id: string, partial: Partial<ChatWindowState>) => void;
  bringToFront: (id: string) => void;
  maximizePanel: (id: string) => void;
  /** Reuses the front-most existing window (merging in any new prompt/context)
   *  or opens a fresh one when none exist. */
  findOrCreatePanel: (opts?: OpenPanelOpts) => string;
}

export const ChatWindowManagerContext = createContext<ChatWindowManagerValue | null>(null);

export function useChatWindowManager(): ChatWindowManagerValue {
  const ctx = useContext(ChatWindowManagerContext);
  if (!ctx) throw new Error("useChatWindowManager must be used within <ChatWindowManagerProvider>");
  return ctx;
}

export const MAX_PANELS = 6;
export const DEFAULT_WIDTH = 520;
export const DEFAULT_HEIGHT = 700;
export const CASCADE_OFFSET = 30;
export const Z_BASE = zIndex.chatWindow;

function storageKey(storageId: string) {
  return `chat-panels:${storageId}`;
}

interface PersistedPanel {
  id: string;
  threadId: string | null;
  x: number;
  y: number;
  width: number;
  height: number;
  maximized: boolean;
}

export function loadPanels(storageId: string): ChatWindowState[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(storageId));
    if (!raw) return [];
    const persisted: PersistedPanel[] = JSON.parse(raw);
    return persisted.map((p, i) => ({
      ...p,
      initialModel: null,
      zIndex: Z_BASE + i,
      initialPrompt: null,
      contextItems: [],
    }));
  } catch {
    return [];
  }
}

export function savePanels(storageId: string, panels: ChatWindowState[]) {
  const persisted: PersistedPanel[] = panels.map((p) => ({
    id: p.id,
    threadId: p.threadId,
    x: p.x,
    y: p.y,
    width: p.width,
    height: p.height,
    maximized: p.maximized,
  }));
  localStorage.setItem(storageKey(storageId), JSON.stringify(persisted));
}

let _panelId = 0;
export function nextPanelId(): string {
  return `panel-${++_panelId}-${Date.now()}`;
}

let _promptId = 0;
/** A monotonic id stamped onto an `initialPrompt` so a window re-sends even when
 *  the same text is requested twice. */
export function nextPromptId(): number {
  return ++_promptId;
}

/** Re-indexes z so values stay compact (61, 62, …) with `frontId` on top. */
export function reindex(panels: ChatWindowState[], frontId?: string): ChatWindowState[] {
  const sorted = [...panels].sort((a, b) => a.zIndex - b.zIndex);
  if (frontId) {
    const idx = sorted.findIndex((p) => p.id === frontId);
    if (idx >= 0) {
      const [item] = sorted.splice(idx, 1);
      if (item) sorted.push(item);
    }
  }
  return sorted.map((p, i) => ({ ...p, zIndex: Z_BASE + i }));
}
