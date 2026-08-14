import { useMemo } from "react";
import {
  ChatWindowLayer,
  type ChatWindowProps,
} from "../data/ai/ChatWindow";
import { clickyOperationsToTools } from "../data/chat/clickyOperationsToTools";
import type { ResolvedOperation } from "./types";
import { useOperations, type OperationsApiClient } from "./useOperations";

export type ChatLayerProps = Omit<ChatWindowProps, "panel" | "tools"> & {
  client: OperationsApiClient;
  /** Narrows which operations become tools. Defaults to all operations. */
  operationFilter?: (operation: ResolvedOperation) => boolean;
};

/** Operation-aware floating chat windows for a clicky RPC application. */
export function ChatLayer({
  client,
  operationFilter,
  ...windowProps
}: ChatLayerProps) {
  const { operations, spec } = useOperations(client);
  const tools = useMemo(
    () =>
      clickyOperationsToTools(
        operationFilter ? operations.filter(operationFilter) : operations,
        spec?.["x-clicky"]?.surfaces,
      ),
    [operationFilter, operations, spec],
  );

  return <ChatWindowLayer {...windowProps} tools={tools} />;
}
