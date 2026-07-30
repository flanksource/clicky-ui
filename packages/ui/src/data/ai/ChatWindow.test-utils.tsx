import { useEffect, type ReactNode } from "react";
import { useChatWindowManager } from "./chat-window-context";
import type { ToolMeta } from "./ToolPreferences";

export const CHAT_WINDOW_TEST_TOOLS: ToolMeta[] = [
  { name: "listPods", label: "List Pods" },
  { name: "restartService", label: "Restart Service" },
];

export function OpenChatWindowOnMount({
  children,
  initialPrompt,
}: {
  children: ReactNode;
  initialPrompt?: { id: number; text: string } | null;
}): ReactNode {
  const { openPanel } = useChatWindowManager();
  useEffect(() => {
    openPanel(initialPrompt === undefined ? undefined : { initialPrompt });
  }, [initialPrompt, openPanel]);
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
