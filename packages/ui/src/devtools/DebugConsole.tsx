import { useMemo, useState } from "react";
import { IconButton } from "../components/IconButton";
import { UiClose, UiTrash } from "../icons";
import { Tabs, type TabItem } from "../layout/Tabs";
import { DebugClient } from "./debugClient";
import { debugStore, type DebugStore, type DebugStoreState } from "./debugStore";
import { ConsoleTab } from "./tabs/ConsoleTab";
import { InspectionTab } from "./tabs/InspectionTab";
import { NetworkTab } from "./tabs/NetworkTab";
import { QueriesTab } from "./tabs/QueriesTab";
import {
  LEVEL_HELP,
  SELECTABLE_LEVELS,
  type DebugLevel,
  type DebugTab,
  type ExecutionSummary,
} from "./types";

export type { DebugTab };

/**
 * The console itself: a header that says what is being captured and at what
 * cost, and one of four tabs below it.
 *
 * Three tabs are scoped to a selected capture and one is not. Queries is the
 * list; Network and Inspection explain the row you picked from it; Console is
 * the process tail, which belongs to the server rather than to any one request.
 */

export type DebugConsoleProps = {
  state: DebugStoreState;
  store?: DebugStore | undefined;
  client?: DebugClient | undefined;
  onClose?: (() => void) | undefined;
  /** Controlled tab, so the host can deep-link into one. */
  tab?: DebugTab | undefined;
  onTabChange?: ((tab: DebugTab) => void) | undefined;
};

export function DebugConsole({
  state,
  store = debugStore,
  client,
  onClose,
  tab: controlledTab,
  onTabChange,
}: DebugConsoleProps) {
  const [uncontrolledTab, setUncontrolledTab] = useState<DebugTab>("queries");
  const tab = controlledTab ?? uncontrolledTab;
  const selectTab = (next: DebugTab) => {
    setUncontrolledTab(next);
    onTabChange?.(next);
  };

  const [selectedId, setSelectedId] = useState<string | undefined>();
  const selected = useSelectedRecord(state.records, selectedId);

  const tabs: TabItem[] = useMemo(
    () => [
      { id: "queries", label: "Queries", count: state.records.length },
      { id: "network", label: "Network", count: selected?.counts.harEntries ?? 0 },
      { id: "console", label: "Console", count: state.logs.length },
      {
        id: "inspection",
        label: "Inspection",
        count: (selected?.counts.inspections ?? 0) + (selected?.counts.probes ?? 0),
      },
    ],
    [state.records.length, state.logs.length, selected],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <div className="flex shrink-0 items-center gap-density-3 border-border border-b px-density-3">
        <Tabs tabs={tabs} value={tab} onChange={(id) => selectTab(id as DebugTab)} className="flex-1" />

        <LevelPicker level={state.level} onChange={(level) => store.setLevel(level)} />

        <ConnectionDot connected={state.connected} error={state.streamError} />

        <IconButton
          icon={UiTrash}
          label="Clear captures"
          iconClassName="size-4"
          onClick={() => {
            store.clear();
            void (client ?? new DebugClient()).clear().catch(() => {
              // The server's buffer outliving the client's view is a cosmetic
              // mismatch, not a reason to fail the click the user just made.
            });
          }}
        />
        {onClose ? (
          <IconButton icon={UiClose} label="Close console" iconClassName="size-4" onClick={onClose} />
        ) : null}
      </div>

      {/* A bounded flex column. Every tab below hands its height to a component
          that scrolls internally (DataTable, LogsTable, HarPanel), and each of
          those sizes itself as `flex-1 min-h-0` — which needs a flex parent with
          a definite height, or it resolves to content height and the console
          body grows instead of scrolling. */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {tab === "queries" ? (
          <QueriesTab
            records={state.records}
            client={client}
            onSelect={(record) => setSelectedId(record.id)}
          />
        ) : null}
        {tab === "network" ? <NetworkTab record={selected} client={client} /> : null}
        {tab === "console" ? <ConsoleTab lines={state.logs} /> : null}
        {tab === "inspection" ? (
          <InspectionTab
            record={selected}
            client={client}
            refreshInspection={state.refreshInspection}
            onRefreshInspectionChange={(refresh) => store.setRefreshInspection(refresh)}
          />
        ) : null}
      </div>
    </div>
  );
}

/**
 * The selected capture, falling back to the most recent one.
 *
 * Without the fallback, Network and Inspection open empty on a console that is
 * plainly full of rows, which reads as a broken tab rather than as "pick one".
 */
function useSelectedRecord(
  records: ExecutionSummary[],
  selectedId: string | undefined,
): ExecutionSummary | undefined {
  return useMemo(() => {
    if (selectedId) {
      const found = records.find((record) => record.id === selectedId);
      if (found) return found;
    }
    return records[records.length - 1];
  }, [records, selectedId]);
}

function LevelPicker({
  level,
  onChange,
}: {
  level: DebugLevel;
  onChange: (level: DebugLevel) => void;
}) {
  return (
    <label className="flex items-center gap-density-1 text-xs">
      <span className="text-muted-foreground">Capture</span>
      <select
        className="rounded border border-border bg-background px-density-1 py-0.5 font-mono text-xs"
        value={level}
        title={LEVEL_HELP[level]}
        onChange={(event) => onChange(event.target.value as DebugLevel)}
      >
        {SELECTABLE_LEVELS.map((option) => (
          <option key={option} value={option} title={LEVEL_HELP[option]}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function ConnectionDot({
  connected,
  error,
}: {
  connected: boolean;
  error?: string | undefined;
}) {
  return (
    <span
      className="flex items-center gap-density-1 text-muted-foreground text-xs"
      title={error ?? (connected ? "Streaming" : "Not connected")}
    >
      <span
        aria-hidden
        className={`inline-block size-2 rounded-full ${connected ? "bg-green-500" : "bg-muted-foreground/40"}`}
      />
      {connected ? "live" : "offline"}
    </span>
  );
}
