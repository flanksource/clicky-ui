import { useMemo, useState, type ReactNode } from "react";
import { ApprovalDetail } from "./ApprovalDetail";
import { ApprovalsList } from "./ApprovalsList";
import { APPROVALS } from "./fixtures";
import type { ApprovalState } from "./types";
import "./merivio.css";

type View = { mode: "list" } | { mode: "detail"; id: string };

/**
 * The queue the detail pager walks. Fixed at the requests that arrived open,
 * so deciding one doesn't renumber the queue under the operator's cursor.
 */
const QUEUE_IDS = new Set(
  APPROVALS.filter((approval) => approval.state === "proposed").map(
    (approval) => approval.id,
  ),
);

/**
 * Merivio's page chrome: the warm paper canvas the two screens sit on. The
 * negative margin cancels the kitchen-sink's own panel padding so the paper
 * bleeds to the edges the way a standalone page would.
 */
function MerivioPage({ children }: { children: ReactNode }) {
  return (
    <div className="merivio -m-density-4 min-h-full bg-mv-paper px-6 pb-14 pt-4 text-mv-ink">
      <div className="mx-auto flex max-w-[1560px] flex-col gap-density-4">
        {children}
      </div>
    </div>
  );
}

/**
 * The approvals surface: a queue and a detail page, ported from the Merivio
 * design artifact. Decisions made in either place live in one `resolved` map
 * so the list and the detail never disagree.
 */
export function ApprovalsDemo() {
  const [view, setView] = useState<View>({ mode: "list" });
  const [resolved, setResolved] = useState<Record<string, ApprovalState>>({});

  const approvals = useMemo(
    () =>
      APPROVALS.map((approval) => {
        const state = resolved[approval.id];
        return state === undefined ? approval : { ...approval, state };
      }),
    [resolved],
  );

  const queue = useMemo(
    () => approvals.filter((approval) => QUEUE_IDS.has(approval.id)),
    [approvals],
  );

  function decide(ids: string[], state: ApprovalState | null) {
    setResolved((current) => {
      const next = { ...current };
      for (const id of ids) {
        if (state === null) delete next[id];
        else next[id] = state;
      }
      return next;
    });
  }

  if (view.mode === "detail") {
    const detailId = view.id;
    const approval = approvals.find((item) => item.id === detailId);
    if (approval === undefined) throw new Error(`unknown approval: ${detailId}`);
    return (
      <MerivioPage>
        <ApprovalDetail
          key={approval.id}
          approval={approval}
          queue={queue}
          onBack={() => setView({ mode: "list" })}
          onNavigate={(id) => setView({ mode: "detail", id })}
          onDecide={(id, state) => decide([id], state)}
        />
      </MerivioPage>
    );
  }

  return (
    <MerivioPage>
      <ApprovalsList
        approvals={approvals}
        onOpen={(id) => setView({ mode: "detail", id })}
        onResolve={(ids, state) => decide(ids, state)}
      />
    </MerivioPage>
  );
}
