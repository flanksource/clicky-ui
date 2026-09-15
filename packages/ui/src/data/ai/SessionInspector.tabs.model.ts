import {
  UiBraces,
  UiChatDots,
  UiCoins,
  UiFileText,
  UiJson,
  UiListDashes,
  UiSealCheck,
  UiStrategy,
} from "../../icons";
import { pendingApprovalRequests } from "./SessionInspector.approvals-model";
import type { CompactSessionTab } from "./SessionInspector.compact";
import { costTotal, formatCost } from "./session-cost";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

export type SessionInspectorTab =
  | "transcript"
  | "output"
  | "files"
  | "plan"
  | "approvals"
  | "costs"
  | "metadata"
  | "raw";

const TABS = [
  { id: "transcript", label: "Transcript", icon: UiChatDots },
  { id: "output", label: "Output", icon: UiJson },
  { id: "files", label: "Files", icon: UiFileText },
  { id: "plan", label: "Plan", icon: UiStrategy },
  { id: "approvals", label: "Approvals", icon: UiSealCheck },
  { id: "costs", label: "Costs", icon: UiCoins },
  { id: "metadata", label: "Metadata", icon: UiListDashes },
  { id: "raw", label: "Raw", icon: UiBraces },
] as const;

export type InspectorTabItem = CompactSessionTab & {
  id: SessionInspectorTab;
};

export function inspectorTabs(
  outputVisible: boolean,
  current?: UnifiedSessionInput,
  filtered?: UnifiedSessionInput,
): InspectorTabItem[] {
  return TABS.filter((item) => item.id !== "output" || outputVisible).map(
    (item) => {
      const badge = tabBadge(item.id, current);
      return {
        id: item.id,
        label: tabLabel(
          item.id,
          item.label,
          item.id === "costs" ? filtered : current,
        ),
        icon: item.icon,
        ...(badge.count === undefined ? {} : { count: badge.count }),
        ...(badge.color ? { countColor: badge.color } : {}),
      };
    },
  );
}

export function hasStructuredOutput(session?: UnifiedSessionInput) {
  return (
    session?.structuredOutput !== undefined && session.structuredOutput !== null
  );
}

function tabBadge(
  tab: SessionInspectorTab,
  session?: UnifiedSessionInput,
): { count?: number; color?: string } {
  switch (tab) {
    case "files":
      return {
        count:
          (session?.files?.read?.length ?? 0) +
          (session?.files?.written?.length ?? 0),
      };
    case "approvals": {
      const pending = pendingApprovalRequests(session?.requests).length;
      if (pending) return { count: pending, color: "bg-amber-500" };
      return {
        count:
          (session?.approvals?.approved ?? 0) +
          (session?.approvals?.denied ?? 0),
      };
    }
    default:
      return {};
  }
}

function tabLabel(
  tab: SessionInspectorTab,
  label: string,
  session?: UnifiedSessionInput,
) {
  if (tab !== "costs") return label;
  const total = costTotal(session?.cost);
  return total ? `${label} ${formatCost(total)}` : label;
}
