import { useEffect, useRef, type ReactNode } from "react";
import { useChatWindowManager } from "./chat-window-context";
import type { Suggestion } from "../chat/types";
import type { ToolMeta } from "./ToolPreferences";

export const CHAT_WINDOW_TEST_TOOLS: ToolMeta[] = [
  { name: "listPods", label: "List Pods" },
  { name: "restartService", label: "Restart Service" },
];

export function OpenChatWindowOnMount({
  children,
  initialPrompt,
  proposedPrompts,
  threadId,
}: {
  children: ReactNode;
  initialPrompt?: { id: number; text: string } | null;
  proposedPrompts?: Suggestion[];
  threadId?: string | null;
}): ReactNode {
  const { openPanel } = useChatWindowManager();
  // Exactly one panel, as the name says. `openPanel`'s identity changes once the
  // manager reschedules its save, which would otherwise open a second window
  // and leave the assertions picking between two composers.
  const opened = useRef(false);
  useEffect(() => {
    if (opened.current) return;
    opened.current = true;
    openPanel({
      ...(initialPrompt !== undefined ? { initialPrompt } : {}),
      ...(proposedPrompts !== undefined ? { proposedPrompts } : {}),
      ...(threadId !== undefined ? { threadId } : {}),
    });
  }, [initialPrompt, openPanel, proposedPrompts, threadId]);
  return <>{children}</>;
}

export function installMemoryStorage(): void {
  const values = new Map<string, string>();
  const storage: Storage = {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key) => values.get(key) ?? null,
    key: (index) => Array.from(values.keys())[index] ?? null,
    removeItem: (key) => values.delete(key),
    setItem: (key, value) => values.set(key, value),
  };
  Object.defineProperty(window, "localStorage", {
    configurable: true,
    value: storage,
  });
  Object.defineProperty(globalThis, "localStorage", {
    configurable: true,
    value: storage,
  });
}
