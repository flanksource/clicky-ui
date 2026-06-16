import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type MouseEvent as ReactMouseEvent,
} from "react";
import type { RenderLink } from "./EndpointList";

// A RouterAdapter bundles the three navigation concerns clicky-ui nav surfaces
// need — the current location, how to render a link, and how to navigate
// imperatively — into one object the host supplies once (via RouterProvider).
// This keeps the library router-agnostic: a react-router host builds the adapter
// from its own hooks, while router-less hosts/tests use the browser or memory
// adapters below. Nothing here imports any router package.
export interface RouterAdapter {
  /** Current path, used to compute active nav state. */
  pathname: string;
  /** Render a navigation link (host's <Link>, a plain <a>, etc.). */
  renderLink: RenderLink;
  /** Navigate imperatively. `replace` swaps the current entry instead of pushing. */
  navigate: (to: string, opts?: { replace?: boolean }) => void;
}

// RouterContext is consumed by useRouter and provided by RouterProvider (in its
// own module so this file exports only hooks/values, keeping fast-refresh happy).
export const RouterContext = createContext<RouterAdapter | null>(null);

// A plain left-click on a same-tab link is the only case we intercept for
// client-side navigation; modifier/middle clicks and new-tab links fall through
// to the browser so "open in new tab" and friends keep working.
function isPlainLeftClick(event: ReactMouseEvent<HTMLAnchorElement>): boolean {
  return (
    !event.defaultPrevented &&
    event.button === 0 &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.shiftKey &&
    !event.altKey &&
    event.currentTarget.target !== "_blank"
  );
}

function subscribeToHistory(onChange: () => void): () => void {
  window.addEventListener("popstate", onChange);
  return () => window.removeEventListener("popstate", onChange);
}

/** Live browser adapter: location from history, real <a href> links that
 *  navigate client-side via the History API (like react-router's <Link>). This
 *  is the router-agnostic default when no RouterProvider is mounted. */
export function useBrowserRouter(): RouterAdapter {
  const pathname = useSyncExternalStore(
    subscribeToHistory,
    () => window.location.pathname,
    () => "/",
  );
  const navigate = useCallback((to: string, opts?: { replace?: boolean }) => {
    if (typeof window === "undefined") return;
    if (opts?.replace)
      window.history.replaceState(window.history.state, "", to);
    else window.history.pushState(window.history.state, "", to);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);
  const renderLink = useCallback<RenderLink>(
    ({ to, className, children, title, key }) => (
      <a
        key={key}
        href={to}
        className={className}
        title={title}
        onClick={(event) => {
          if (!isPlainLeftClick(event)) return;
          event.preventDefault();
          navigate(to);
        }}
      >
        {children}
      </a>
    ),
    [navigate],
  );
  return useMemo(
    () => ({ pathname, renderLink, navigate }),
    [pathname, renderLink, navigate],
  );
}

/** In-memory adapter for demos and tests: location lives in React state, links
 *  intercept clicks to update it, and navigation never touches the browser URL —
 *  so a router-less demo can switch routes without hijacking the host page. */
export function useMemoryRouter(initialPath: string): RouterAdapter {
  const [pathname, setPathname] = useState(initialPath);
  const navigate = useCallback((to: string) => setPathname(to), []);
  const renderLink = useCallback<RenderLink>(
    ({ to, className, children, title, key }) => (
      <a
        key={key}
        href={to}
        className={className}
        title={title}
        onClick={(event) => {
          event.preventDefault();
          setPathname(to);
        }}
      >
        {children}
      </a>
    ),
    [],
  );
  return useMemo(
    () => ({ pathname, renderLink, navigate }),
    [pathname, renderLink, navigate],
  );
}

/** Resolve the active adapter: an explicit RouterProvider wins, otherwise fall
 *  back to a live browser adapter (the documented router-agnostic default). */
export function useRouter(): RouterAdapter {
  const ctx = useContext(RouterContext);
  const browser = useBrowserRouter();
  return ctx ?? browser;
}
