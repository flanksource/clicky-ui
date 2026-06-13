import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import {
  ChatWindowManagerContext,
  loadPanels,
  savePanels,
  nextPanelId,
  reindex,
  MAX_PANELS,
  DEFAULT_WIDTH,
  DEFAULT_HEIGHT,
  CASCADE_OFFSET,
  Z_BASE,
  type ChatWindowManagerValue,
  type ChatWindowState,
  type OpenPanelOpts,
} from "./chat-window-context";

export type ChatWindowManagerProviderProps = {
  /** Namespaces the localStorage layout so distinct surfaces keep separate
   *  window arrangements. Defaults to "default". */
  storageId?: string;
  children: ReactNode;
};

/** Owns the set of open chat windows: creation, focus (z-index), maximize and
 *  debounced localStorage persistence of their layout. Wrap the app subtree in
 *  this and read it via {@link useChatWindowManager}. */
export function ChatWindowManagerProvider({
  storageId = "default",
  children,
}: ChatWindowManagerProviderProps) {
  const [panels, setPanels] = useState<ChatWindowState[]>([]);
  const hydratedRef = useRef(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (hydratedRef.current) return;
    hydratedRef.current = true;
    const loaded = loadPanels(storageId);
    if (loaded.length > 0) setPanels(loaded);
  }, [storageId]);

  const scheduleSave = useCallback(
    (updated: ChatWindowState[]) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => savePanels(storageId, updated), 1000);
    },
    [storageId],
  );

  useEffect(
    () => () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    },
    [],
  );

  const defaultPosition = useCallback((panelCount: number) => {
    const vw = typeof window !== "undefined" ? window.innerWidth : 1200;
    const vh = typeof window !== "undefined" ? window.innerHeight : 800;
    return {
      x: Math.max(40, vw - DEFAULT_WIDTH - 16 - panelCount * CASCADE_OFFSET),
      y: Math.max(40, vh - DEFAULT_HEIGHT - 16 - panelCount * CASCADE_OFFSET),
    };
  }, []);

  const openPanel = useCallback(
    (opts?: OpenPanelOpts): string => {
      const id = nextPanelId();
      setPanels((prev) => {
        if (prev.length >= MAX_PANELS) return prev;
        const pos = defaultPosition(prev.length);
        const panel: ChatWindowState = {
          id,
          threadId: opts?.threadId ?? null,
          initialModel: opts?.initialModel ?? null,
          x: pos.x,
          y: pos.y,
          width: DEFAULT_WIDTH,
          height: DEFAULT_HEIGHT,
          zIndex: Z_BASE,
          maximized: false,
          initialPrompt: opts?.initialPrompt ?? null,
          contextItems: opts?.contextItems ?? [],
        };
        const updated = reindex([...prev, panel], id);
        scheduleSave(updated);
        return updated;
      });
      return id;
    },
    [defaultPosition, scheduleSave],
  );

  const closePanel = useCallback(
    (id: string) => {
      setPanels((prev) => {
        const updated = prev.filter((p) => p.id !== id);
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave],
  );

  const updatePanel = useCallback(
    (id: string, partial: Partial<ChatWindowState>) => {
      setPanels((prev) => {
        const updated = prev.map((p) => (p.id === id ? { ...p, ...partial } : p));
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave],
  );

  const bringToFront = useCallback((id: string) => {
    setPanels((prev) => reindex(prev, id));
  }, []);

  const maximizePanel = useCallback(
    (id: string) => {
      setPanels((prev) => {
        const target = prev.find((p) => p.id === id);
        if (!target) return prev;
        const willMaximize = !target.maximized;
        const toggled = prev.map((p) => {
          if (p.id === id) return { ...p, maximized: willMaximize };
          if (willMaximize && p.maximized) return { ...p, maximized: false };
          return p;
        });
        const updated = reindex(toggled, id);
        scheduleSave(updated);
        return updated;
      });
    },
    [scheduleSave],
  );

  const findOrCreatePanel = useCallback(
    (opts?: OpenPanelOpts): string => {
      const existing = panels[panels.length - 1];
      if (!existing) return openPanel(opts);
      const partial: Partial<ChatWindowState> = {};
      if (opts?.initialPrompt) partial.initialPrompt = opts.initialPrompt;
      if (opts?.contextItems?.length) {
        partial.contextItems = [
          ...existing.contextItems,
          ...opts.contextItems.filter((c) => !existing.contextItems.some((e) => e.id === c.id)),
        ];
      }
      updatePanel(existing.id, partial);
      bringToFront(existing.id);
      return existing.id;
    },
    [panels, openPanel, updatePanel, bringToFront],
  );

  const value: ChatWindowManagerValue = {
    panels,
    openPanel,
    closePanel,
    updatePanel,
    bringToFront,
    maximizePanel,
    findOrCreatePanel,
  };

  return (
    <ChatWindowManagerContext.Provider value={value}>{children}</ChatWindowManagerContext.Provider>
  );
}
