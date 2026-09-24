import { useState } from "react";
import { VerificationResults } from "../verification/VerificationResults";
import type { UnifiedSessionInput } from "./SessionViewer.unified";

type Verifications = UnifiedSessionInput["verifications"];

export function SessionVerificationPanel({
  verifications,
}: {
  verifications: Verifications;
}) {
  const [selected, setSelected] = useState<string | null>(null);
  if (!verifications?.length) {
    return (
      <p className="p-density-4 text-sm text-muted-foreground">
        No verification has run yet.
      </p>
    );
  }
  const current =
    verifications.find(
      (item) => `${item.sourceSessionId ?? ""}:${item.iteration}` === selected,
    ) ?? verifications[verifications.length - 1]!;
  return (
    <div className="flex h-full min-h-0 flex-col gap-density-3 p-density-3">
      <div
        className="flex shrink-0 flex-wrap gap-density-2"
        aria-label="Verification iterations"
      >
        {verifications.map(({ iteration, report, sourceSessionId }) => (
          <button
            key={`${sourceSessionId ?? ""}:${iteration}`}
            type="button"
            aria-pressed={
              iteration === current.iteration &&
              sourceSessionId === current.sourceSessionId
            }
            onClick={() => setSelected(`${sourceSessionId ?? ""}:${iteration}`)}
            className="rounded border border-border px-density-2 py-1 text-xs text-foreground aria-pressed:bg-muted"
          >
            {sourceSessionId ? `${sourceSessionId.slice(0, 8)} · ` : ""}
            {iteration}. {report.kind} · {report.state}
          </button>
        ))}
      </div>
      <VerificationResults
        className="min-h-0 flex-1"
        report={current.report}
        title={`${current.report.name || current.report.kind} · iteration ${current.iteration}`}
      />
    </div>
  );
}
