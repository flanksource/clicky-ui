import { useCallback, useEffect, useRef, useState } from "react";
import {
  registerDebugConsole,
  setDebugCaptureLevel,
  setDebugConsoleOpen,
  setDebugRefreshInspection,
} from "../data/debugConsoleSignal";
import { DebugClient } from "./debugClient";
import { DebugConsole, type DebugTab } from "./DebugConsole";
import { debugStore, type DebugStore } from "./debugStore";
import { useDebugStream } from "./useDebugStream";
import { readDockState, writeDockState } from "./dockState";

/**
 * Where the console lives: a flex sibling that shrinks the page, not an overlay
 * on top of it.
 *
 * Chrome devtools docks for a reason — an overlay hides the rows you opened the
 * console to explain. A sibling costs the host one wrapper it already has, and
 * covers the takeover pages that bypass the app shell entirely, which a shell
 * slot would not.
 */

export const MIN_DOCK_HEIGHT = 160;
export const DEFAULT_DOCK_HEIGHT = 320;
const HEIGHT_STORAGE_KEY = "clicky-ui.devtools.height";

export type DebugConsoleDockProps = {
  client?: DebugClient | undefined;
  store?: DebugStore | undefined;
  /** Starts open. Otherwise the dock renders nothing until its trigger is used. */
  defaultOpen?: boolean | undefined;
  /**
   * Builds the stream connection. A host whose API needs an auth-wrapped
   * EventSource supplies one; a test supplies one that never connects.
   */
  createEventSource?: ((url: string) => EventSource) | undefined;
};

export function DebugConsoleDock({
  client,
  store = debugStore,
  defaultOpen,
  createEventSource,
}: DebugConsoleDockProps) {
  const initial = readDockState();
  const [open, setOpen] = useState(defaultOpen ?? initial.open);
  const [tab, setTab] = useState<DebugTab>(initial.tab);
  const [height, setHeight] = useState(() => readHeight());

  // Only an open console holds the stream. A closed one that kept streaming
  // would make "the console is off" untrue for the server.
  const state = useDebugStream({ enabled: open, client, store, createEventSource });

  // A link that names a level arms at it, once. After that the picker owns the
  // level, so re-applying it on every render would make the control unusable.
  useEffect(() => {
    store.setLevel(initial.level);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- seeded from the URL at mount only
  }, []);

  useEffect(() => {
    writeDockState({ open, tab, level: state.level });
    // Published for the call sites that fetch without going through the wrapped
    // client — they arm from this rather than from a flag of their own.
    setDebugCaptureLevel(open ? state.level : "off");
    // Dropped with the console, like the level: a rebuild-everything setting
    // left on behind a closed console would make every page slow with nothing
    // on screen to explain why.
    setDebugRefreshInspection(open && state.refreshInspection);
    // And for the trigger, which lives in the app's navbar rather than in this
    // tree and cannot otherwise tell whether it is showing an open console.
    setDebugConsoleOpen(open);
  }, [open, tab, state.level, state.refreshInspection]);

  // Registering is also what makes the trigger and a table's "Debug" menu item
  // appear: both are offered only where a console exists to reveal.
  useEffect(
    () =>
      registerDebugConsole((request) => {
        setOpen((current) => (request.toggle ? !current : true));
        if (request.tab) setTab(request.tab as DebugTab);
      }),
    [],
  );

  // Unmounting has to retract the claim as well as the registration, or the
  // trigger keeps rendering pressed against a console that is gone.
  useEffect(() => () => setDebugConsoleOpen(false), []);

  const startResize = useResizeHandle(height, (next) => {
    setHeight(next);
    writeHeight(next);
  });

  // Closed, the dock occupies nothing at all. Its trigger — and the counts that
  // used to justify a permanent strip here — live in the navbar instead; see
  // DebugConsoleButton.
  if (!open) return null;

  return (
    <div
      className="flex shrink-0 flex-col border-border border-t bg-background"
      style={{ height }}
      data-testid="devtools-dock"
    >
      <button
        type="button"
        aria-label="Resize console"
        className="h-1 w-full cursor-row-resize bg-transparent hover:bg-border"
        onMouseDown={startResize}
      />
      <div className="flex min-h-0 flex-1 flex-col">
        <DebugConsole
          state={state}
          store={store}
          client={client}
          tab={tab}
          onTabChange={setTab}
          onClose={() => setOpen(false)}
        />
      </div>
    </div>
  );
}

function useResizeHandle(height: number, onHeight: (next: number) => void) {
  const heightRef = useRef(height);
  heightRef.current = height;

  return useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const startY = event.clientY;
      const startHeight = heightRef.current;
      const onMove = (move: MouseEvent) => {
        // Dragging up grows the dock, so the delta is inverted: the handle is on
        // its top edge.
        onHeight(Math.max(MIN_DOCK_HEIGHT, startHeight + (startY - move.clientY)));
      };
      const onUp = () => {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
      };
      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [onHeight],
  );
}

function readHeight(): number {
  if (typeof window === "undefined") return DEFAULT_DOCK_HEIGHT;
  const stored = Number(window.localStorage?.getItem(HEIGHT_STORAGE_KEY));
  return Number.isFinite(stored) && stored >= MIN_DOCK_HEIGHT ? stored : DEFAULT_DOCK_HEIGHT;
}

function writeHeight(height: number): void {
  if (typeof window === "undefined") return;
  window.localStorage?.setItem(HEIGHT_STORAGE_KEY, String(height));
}
