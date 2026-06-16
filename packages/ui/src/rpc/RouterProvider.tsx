import { type ReactNode } from "react";
import { RouterContext, type RouterAdapter } from "./router";

/** Supplies a RouterAdapter to clicky-ui nav surfaces (AppSidebar,
 *  EntityExplorerApp, …). Hosts build the adapter from their own router (see
 *  useBrowserRouter / useMemoryRouter, or a react-router adapter). */
export function RouterProvider({ adapter, children }: { adapter: RouterAdapter; children: ReactNode }) {
  return <RouterContext.Provider value={adapter}>{children}</RouterContext.Provider>;
}
