import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { DOCUMENT_ANCHOR, ToastProvider, useToast } from "@flanksource/clicky-ui";

import { fetchPromptRuns, type PromptRun } from "./prompt-runs-api";
import { RunPromptDialog, type PromptTarget } from "./RunPromptDialog";
import { refreshDocumentProblems } from "../documents/problems";

type PromptRunsContext = {
  /** Opens the prompt dialog for an element from the right-click menu, or a whole page from its Lint button. */
  openPrompt: (target: PromptTarget) => void;
};

const PromptRuns = createContext<PromptRunsContext | null>(null);

export function usePromptRuns(): PromptRunsContext {
  const value = useContext(PromptRuns);
  if (!value) {
    throw new Error("usePromptRuns must be used inside <PromptRunsProvider>");
  }
  return value;
}

const POLL_MS = 3000;

function settledMessage(run: PromptRun): { message: string; tone: "success" | "info" | "danger" } {
  switch (run.state) {
    case "done":
      return {
        message: run.page.startsWith("folder:") ? `${run.promptName} finished; findings are on the reviewed documents.` : `${run.promptName} finished; its findings are a comment on the ${run.anchor === DOCUMENT_ANCHOR ? "page" : "element"}.`,
        tone: "success",
      };
    case "empty":
      return { message: `${run.promptName} found no issues.`, tone: "info" };
    default:
      return { message: `${run.promptName} failed: ${run.error ?? "unknown error"}`, tone: "danger" };
  }
}

/** Polls the runs this tab started and announces each as it settles. */
function PromptRunWatcher({
  pending,
  onSettled,
}: {
  pending: string[];
  onSettled: (runId: string) => void;
}) {
  const { toast } = useToast();
  useEffect(() => {
    if (pending.length === 0) return;
    const check = () => {
      fetchPromptRuns().then(
        (runs) => {
          for (const runId of pending) {
            const run = runs.find((entry) => entry.runId === runId);
            if (!run) {
              onSettled(runId);
              toast({
                message: `Prompt run ${runId} is no longer known (the playground restarted?)`,
                tone: "danger",
                durationMs: 0,
              });
            } else if (run.state !== "running") {
              void refreshDocumentProblems();
              onSettled(runId);
              const { message, tone } = settledMessage(run);
              toast({ message, tone, ...(tone === "danger" ? { durationMs: 0 } : {}) });
            }
          }
        },
        (cause: unknown) =>
          toast({
            message: `Prompt runs could not be read: ${cause instanceof Error ? cause.message : String(cause)}`,
            tone: "danger",
          }),
      );
    };
    const timer = window.setInterval(check, POLL_MS);
    return () => window.clearInterval(timer);
  }, [pending, onSettled, toast]);
  return null;
}

/**
 * Owns "Prompt…" from the element menu: the prompt dialog, and toasts for the
 * runs it starts. Results land as comments through the server.
 */
export function PromptRunsProvider({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <PromptRunsState>{children}</PromptRunsState>
    </ToastProvider>
  );
}

function PromptRunsState({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [target, setTarget] = useState<PromptTarget | null>(null);
  const [pending, setPending] = useState<string[]>([]);
  useEffect(() => {
    let cancelled = false;
    fetchPromptRuns().then((runs) => {
      if (!cancelled) setPending((current) => [...new Set([...current,...runs.filter((run) => run.state === "running").map((run) => run.runId)])]);
    }, (cause: unknown) => { if (!cancelled) toast({message:`Prompt runs could not be restored: ${cause instanceof Error ? cause.message : String(cause)}`,tone:"danger"}); });
    return () => { cancelled = true; };
  }, [toast]);

  const settle = useCallback(
    (runId: string) => setPending((current) => current.filter((id) => id !== runId)),
    [],
  );
  const value = useMemo<PromptRunsContext>(() => ({ openPrompt: setTarget }), []);

  return (
    <PromptRuns.Provider value={value}>
      {children}
      <RunPromptDialog
        target={target}
        onClose={() => setTarget(null)}
        onStarted={(run) => {
          setTarget(null);
          setPending((current) => [...current, run.runId]);
          toast({ message: `Running ${run.promptName}…`, tone: "info" });
        }}
      />
      <PromptRunWatcher pending={pending} onSettled={settle} />
    </PromptRuns.Provider>
  );
}
