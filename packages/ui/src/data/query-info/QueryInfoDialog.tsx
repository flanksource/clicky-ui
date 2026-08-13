import { useEffect, useState } from "react";
import { Modal } from "../../overlay/Modal";
import { Properties } from "../Properties";
import { QueryBrowserDiagnosticsPanel } from "../query-browser/QueryBrowserDiagnosticsPanel";
import type { QueryExecutionInfo, QueryInfoLoader } from "./queryInfo";

export type QueryInfoDialogProps = {
  open: boolean;
  onClose: () => void;
  /** Reads the details. Keep the reference stable — it runs on every open. */
  load: QueryInfoLoader;
  title?: string;
};

type LoadState =
  | { status: "pending" }
  | { status: "loaded"; info: QueryExecutionInfo }
  | { status: "failed"; message: string };

/**
 * QueryInfoDialog shows what a result surface actually ran.
 *
 * It reads on open rather than alongside the rows: the details cost a second
 * execution, and a table nobody asked a question about should not pay for one.
 */
export function QueryInfoDialog({
  open,
  onClose,
  load,
  title = "Query",
}: QueryInfoDialogProps) {
  const [state, setState] = useState<LoadState>({ status: "pending" });

  useEffect(() => {
    if (!open) return;
    let active = true;
    setState({ status: "pending" });
    load()
      .then((info) => {
        if (active) setState({ status: "loaded", info });
      })
      .catch((error: unknown) => {
        if (!active) return;
        setState({
          status: "failed",
          message:
            error instanceof Error
              ? error.message
              : "Reading the query details failed",
        });
      });
    return () => {
      active = false;
    };
  }, [open, load]);

  const info = state.status === "loaded" ? state.info : undefined;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      subtitle={info?.profile ?? info?.provider}
      size="2xl"
      closeOnEsc
      expandable
    >
      {state.status === "pending" && (
        <p className="text-sm text-muted-foreground">Reading query details…</p>
      )}

      {state.status === "failed" && (
        <div
          role="alert"
          className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {state.message}
        </div>
      )}

      {info && (
        <div className="space-y-3">
          {info.error && (
            <div
              role="alert"
              className="rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive"
            >
              {info.error}
            </div>
          )}

          {info.url && (
            <section aria-label="Request URL" className="min-w-0">
              <h3 className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Request
              </h3>
              <pre className="overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/60 p-2 text-xs">
                {info.url}
              </pre>
            </section>
          )}

          <Properties
            items={summaryItems(info)}
            density="compact"
            showDensityMenu={false}
          />

          {info.diagnostics && (
            <QueryBrowserDiagnosticsPanel diagnostics={info.diagnostics} />
          )}

          {info.headers && Object.keys(info.headers).length > 0 && (
            <section aria-label="Response headers" className="min-w-0">
              <h3 className="mb-1 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                Response headers
              </h3>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted/60 p-2 text-xs">
                {Object.entries(info.headers)
                  .map(([key, value]) => `${key}: ${value}`)
                  .join("\n")}
              </pre>
            </section>
          )}
        </div>
      )}
    </Modal>
  );
}

function summaryItems(info: QueryExecutionInfo) {
  const items: { key: string; value: unknown; hidden?: boolean }[] = [
    { key: "Profile", value: info.profile },
    { key: "Provider", value: info.provider },
    { key: "Connection", value: info.connection },
    { key: "Mode", value: info.mode },
    {
      key: "Rows",
      value: info.rows === undefined ? undefined : info.rows.toLocaleString(),
    },
    {
      key: "Duration",
      value:
        info.durationMs === undefined
          ? undefined
          : `${Math.round(info.durationMs)} ms`,
    },
    {
      key: "Parameters",
      value:
        info.params && Object.keys(info.params).length > 0
          ? JSON.stringify(info.params)
          : undefined,
    },
  ];
  return items.filter((item) => item.value !== undefined && item.value !== "");
}
