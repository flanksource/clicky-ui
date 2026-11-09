import { useMemo } from "react";
import { App } from "../App";
import { PageReloadProvider } from "../page-reload";
import { BrowserSessionContext, createBrowserSession } from "./session";

export function BrowserApp() {
  const session = useMemo(createBrowserSession, []);
  return <BrowserSessionContext.Provider value={session}><PageReloadProvider value={session.reload}><App /></PageReloadProvider></BrowserSessionContext.Provider>;
}

export { BrowserApp as App };
