import { createContext, useContext } from "react";

export type PageReloadRequest =
  | { reason: "changes"; revision: string }
  | { reason: "packages"; revision: string; packages: string[] }
  | { reason: "review"; page: string };
export type PageReload = (request: PageReloadRequest) => void | Promise<void>;

export const PageReloadContext = createContext<PageReload>(() => window.location.reload());
export const PageReloadProvider = PageReloadContext.Provider;
export const usePageReload = () => useContext(PageReloadContext);
