import type { EventSourceFactory, EventSourceLike } from "./event-source";

// Browsers allow only six HTTP/1.1 connections per host, shared across every
// tab. An app that opens one native EventSource per topic (list view, status
// badge, detail pane, activity feed, ...) lets a second tab or a reload starve
// ordinary fetches behind a queue that never drains.
//
// An event hub multiplexes every topic a tab opens onto a single real
// connection to the server's events endpoint (`/api/events` by default): one
// native EventSource, with each logical stream registered as a "sub"
// (POST {url}/{conn}/subs, DELETE {url}/{conn}/subs/{id}) whose frames arrive
// prefixed `<subId>/<name>`. Callers never see any of this — the factory
// returned by createEventHub() hands back an EventSourceLike that behaves like
// `new EventSource(url)` from their point of view, so it plugs straight into
// `<EventSourceProvider value={...}>`.

export interface EventHubOptions {
  /** Server endpoint of the multiplexed stream. Defaults to `/api/events`. */
  url?: string;
  /**
   * The build id this page was served with. When the server's hello frame
   * reports a different build, `onBuildMismatch` fires once. `null`/absent
   * (tests, Storybook, a bare dev server with no backend in front of it)
   * means the hub never reloads.
   */
  buildId?: string | null;
  /** Called once on a build mismatch. Defaults to `window.location.reload()`. */
  onBuildMismatch?: () => void;
}

const DEFAULT_URL = "/api/events";

// How long an idle hub (no subs left) keeps the real connection open before
// tearing it down — long enough to survive React StrictMode's mount → unmount
// → mount churn and a component swap that closes one stream and immediately
// opens its replacement.
const TEARDOWN_GRACE_MS = 1000;

// Delay before re-subscribing after a sub's handler ends with a 2xx status
// (server-side stream completed normally and can be re-opened), mirroring
// native EventSource's own reconnect delay.
const RESUBSCRIBE_DELAY_MS = 1000;

const READY_STATE_CONNECTING = 0;
const READY_STATE_OPEN = 1;
const READY_STATE_CLOSED = 2;

type DomListener = EventListenerOrEventListenerObject;

function invokeListener(listener: DomListener, event: Event): void {
  if (typeof listener === "function") listener(event);
  else listener.handleEvent(event);
}

// Sub is both the internal bookkeeping for one logical stream and the public
// EventSourceLike handed back to the caller — there is no separate wrapper
// object, so `readyState`/`url` always reflect live state.
class Sub implements EventSourceLike {
  readyState = READY_STATE_CONNECTING;
  onopen: ((ev: Event) => unknown) | null = null;
  onmessage: ((ev: MessageEvent) => unknown) | null = null;
  onerror: ((ev: Event) => unknown) | null = null;

  readonly listeners = new Map<string, Set<DomListener>>();
  // Real-connection listeners this sub has registered, keyed by the prefixed
  // event name (`${id}/${name}`), so close() can remove exactly what it added.
  readonly routedHandlers = new Map<string, (ev: Event) => void>();
  resubscribeTimer: ReturnType<typeof setTimeout> | null = null;
  disposed = false;

  constructor(
    readonly id: string,
    readonly url: string,
    private readonly hooks: { route(sub: Sub, name: string): void; close(sub: Sub): void },
  ) {}

  addEventListener(type: string, listener: DomListener): void {
    let set = this.listeners.get(type);
    if (!set) {
      set = new Set();
      this.listeners.set(type, set);
    }
    set.add(listener);
    this.hooks.route(this, type);
  }

  removeEventListener(type: string, listener: DomListener): void {
    this.listeners.get(type)?.delete(listener);
  }

  close(): void {
    this.hooks.close(this);
  }
}

function dispatch(sub: Sub, name: string, event: Event): void {
  // Snapshot the set so a listener that (un)registers listeners mid-dispatch
  // doesn't change who receives this frame.
  for (const listener of Array.from(sub.listeners.get(name) ?? [])) invokeListener(listener, event);
  // onmessage/onerror/onopen mirror native EventSource: each is just the
  // single-slot form of addEventListener('message'|'error'|'open', ...), so a
  // frame named "error" (server-sent) reaches both a registered
  // addEventListener('error', ...) and .onerror, exactly like the browser.
  if (name === "message") sub.onmessage?.(event as MessageEvent);
  if (name === "error") sub.onerror?.(event);
  if (name === "open") sub.onopen?.(event);
}

/**
 * Creates an `EventSourceFactory` that multiplexes every stream it opens over
 * one real connection to `options.url`. Each returned stream behaves like
 * `new EventSource(url)` to the caller: CONNECTING until the subscription is
 * live, dispatches 'open'/'message'/'error' (and any server-named event), and
 * auto-reconnects the way native EventSource does.
 *
 * All state (real connection, connection id, sub registry, teardown timer,
 * reload guard) is per hub, so two hubs never share a connection.
 */
export function createEventHub(options: EventHubOptions = {}): EventSourceFactory {
  const { url: hubUrl = DEFAULT_URL, buildId = null, onBuildMismatch = () => window.location.reload() } = options;

  let real: EventSourceLike | null = null;
  let connId: string | null = null;
  let subCounter = 0;
  const subs = new Map<string, Sub>();
  let teardownTimer: ReturnType<typeof setTimeout> | null = null;
  // Guards against a reload loop within one page load: once triggered, further
  // __hello frames (e.g. after the reload's own new connection reconnects
  // mid-flight) never trigger a second one.
  let reloadedForBuildMismatch = false;

  // A stale tab still serving an old bundle would otherwise keep working
  // against a server that has moved on — including racing the six-connection
  // cap this hub exists to close, since an old bundle may hold raw
  // EventSources of its own. When the server's hello reports a different build
  // than the one this page was served with, reload once to pick up the
  // current bundle.
  function maybeReloadForBuildMismatch(helloBuildId: string | undefined): void {
    if (reloadedForBuildMismatch) return;
    if (!helloBuildId || !buildId) return;
    if (helloBuildId === buildId) return;
    reloadedForBuildMismatch = true;
    onBuildMismatch();
  }

  function failSub(sub: Sub, message: string, cause?: unknown): void {
    sub.readyState = READY_STATE_CLOSED;
    dispatch(sub, "error", new Event("error"));
    if (cause !== undefined) console.error(`[event-hub] ${message} for ${sub.url}:`, cause);
    else console.error(`[event-hub] ${message} for ${sub.url}`);
  }

  async function postSub(sub: Sub): Promise<void> {
    const conn = connId;
    if (!conn || sub.disposed || sub.readyState === READY_STATE_CLOSED) return;
    // A response for a connection that has since dropped (or a sub that has
    // since failed) is stale: the next __hello re-subscribes on the live one.
    const stale = () => sub.disposed || conn !== connId || sub.readyState === READY_STATE_CLOSED;
    try {
      const res = await fetch(`${hubUrl}/${conn}/subs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: sub.id, path: sub.url }),
      });
      if (stale()) return;
      if (res.status === 204) {
        sub.readyState = READY_STATE_OPEN;
        dispatch(sub, "open", new Event("open"));
        return;
      }
      if (res.status === 404) return; // stale conn id; the next __hello retries
      failSub(sub, `subscribe failed: ${res.status}`);
    } catch (err) {
      if (stale()) return;
      failSub(sub, "subscribe request failed", err);
    }
  }

  function onHello(event: MessageEvent): void {
    const payload = JSON.parse(event.data) as { conn: string; build?: string };
    connId = payload.conn;
    maybeReloadForBuildMismatch(payload.build);
    // A hello means every currently-active sub needs a fresh subscription: the
    // first hello of a brand-new connection, or a reconnect hello after a
    // drop, both start from a server side with no subs registered yet.
    for (const sub of subs.values()) {
      if (!sub.disposed) void postSub(sub);
    }
  }

  function onRealError(es: EventSourceLike): void {
    connId = null;
    for (const sub of subs.values()) {
      if (sub.disposed || sub.readyState === READY_STATE_CLOSED) continue;
      sub.readyState = READY_STATE_CONNECTING;
      dispatch(sub, "error", new Event("error"));
    }
    // Native EventSource reconnects on its own after a transient error; the
    // next __hello re-subscribes everything and dispatches 'open' again. A
    // CLOSED source (non-200 or wrong Content-Type) never reconnects, so drop
    // it and open a replacement after a delay.
    if (es.readyState !== READY_STATE_CLOSED || real !== es) return;
    for (const sub of subs.values()) {
      for (const [eventName, handler] of sub.routedHandlers) es.removeEventListener(eventName, handler);
      sub.routedHandlers.clear();
    }
    es.onerror = null;
    real = null;
    setTimeout(() => {
      if (!real && subs.size > 0) ensureRealOpen();
    }, RESUBSCRIBE_DELAY_MS);
  }

  function ensureRealOpen(): EventSourceLike {
    if (real) {
      if (teardownTimer) {
        clearTimeout(teardownTimer);
        teardownTimer = null;
      }
      return real;
    }
    connId = null;
    const es = new EventSource(hubUrl);
    es.addEventListener("__hello", (event) => onHello(event as MessageEvent));
    es.onerror = () => onRealError(es);
    real = es;
    routeActiveSubs();
    return es;
  }

  // routeActiveSubs binds every live sub's routing onto a freshly created real
  // connection (a replacement after a terminal error has none yet).
  function routeActiveSubs(): void {
    for (const sub of subs.values()) {
      if (sub.disposed) continue;
      routeName(sub, "message");
      for (const name of sub.listeners.keys()) routeName(sub, name);
      routeClosed(sub);
    }
  }

  const eventNameFor = (sub: Sub, name: string) => `${sub.id}/${name}`;

  // routeName registers, at most once per sub+name, a real-connection listener
  // that re-dispatches `${sub.id}/${name}` frames to this sub's own listeners.
  // "open" is synthetic (dispatched locally on subscribe/reconnect) and never
  // arrives on the wire, so it is never routed. A closed sub has no routing to
  // register: its real connection may already be torn down, and no frame for
  // it can arrive. With no real connection (awaiting a replacement after a
  // terminal error) routing is deferred to routeActiveSubs.
  function routeName(sub: Sub, name: string): void {
    const eventName = eventNameFor(sub, name);
    if (!real || name === "open" || sub.disposed || sub.routedHandlers.has(eventName)) return;
    const handler = (event: Event) => {
      const message = event as MessageEvent;
      dispatch(sub, name, new MessageEvent(name, { data: message.data, lastEventId: message.lastEventId }));
    };
    real.addEventListener(eventName, handler);
    sub.routedHandlers.set(eventName, handler);
  }

  function onSubClosed(sub: Sub, event: MessageEvent): void {
    if (sub.disposed) return;
    let payload: { status: number; error?: string };
    try {
      payload = JSON.parse(event.data) as { status: number; error?: string };
    } catch (err) {
      failSub(sub, "closed frame was malformed", err);
      return;
    }
    if (payload.status >= 200 && payload.status < 300) {
      // The server-side handler ended on its own with a success status — the
      // same shape as a native stream simply reconnecting.
      sub.readyState = READY_STATE_CONNECTING;
      dispatch(sub, "error", new Event("error"));
      sub.resubscribeTimer = setTimeout(() => {
        sub.resubscribeTimer = null;
        if (!sub.disposed) void postSub(sub);
      }, RESUBSCRIBE_DELAY_MS);
      return;
    }
    failSub(sub, `sub closed with status ${payload.status}`, payload.error);
  }

  // routeClosed wires the sub's terminal frame: unlike every other name, its
  // payload drives re-subscription rather than being handed to consumers.
  function routeClosed(sub: Sub): void {
    const eventName = eventNameFor(sub, "__closed");
    if (!real || sub.routedHandlers.has(eventName)) return;
    const handler = (event: Event) => onSubClosed(sub, event as MessageEvent);
    real.addEventListener(eventName, handler);
    sub.routedHandlers.set(eventName, handler);
  }

  function scheduleTeardownIfIdle(): void {
    if (subs.size > 0 || teardownTimer) return;
    teardownTimer = setTimeout(() => {
      teardownTimer = null;
      if (subs.size > 0) return; // something re-subscribed during the grace window
      real?.close();
      real = null;
      connId = null;
    }, TEARDOWN_GRACE_MS);
  }

  function closeSub(sub: Sub): void {
    if (sub.disposed) return;
    sub.disposed = true;
    sub.readyState = READY_STATE_CLOSED;
    if (sub.resubscribeTimer) {
      clearTimeout(sub.resubscribeTimer);
      sub.resubscribeTimer = null;
    }
    for (const [eventName, handler] of sub.routedHandlers) real?.removeEventListener(eventName, handler);
    sub.routedHandlers.clear();
    subs.delete(sub.id);

    const conn = connId;
    if (conn) {
      fetch(`${hubUrl}/${conn}/subs/${sub.id}`, { method: "DELETE" })
        .then((res) => {
          if (!res.ok && res.status !== 404) console.error(`[event-hub] unsubscribe failed for ${sub.url}: ${res.status}`);
        })
        .catch((err) => console.error(`[event-hub] unsubscribe request failed for ${sub.url}:`, err));
    }
    scheduleTeardownIfIdle();
  }

  const hooks = { route: routeName, close: closeSub };

  return (url) => {
    const sub = new Sub(`s${++subCounter}`, url, hooks);
    subs.set(sub.id, sub);
    ensureRealOpen();
    // Routing must be registered before the subscribe POST is sent: frames can
    // start arriving on the real connection as soon as the server accepts the
    // subscription, which can race the POST's own response.
    routeName(sub, "message");
    routeClosed(sub);
    if (connId) void postSub(sub);
    return sub;
  };
}
