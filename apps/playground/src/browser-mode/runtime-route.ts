import { useSyncExternalStore } from "react";

const event = "playground-runtime-route";
function subscribe(listener: () => void) {
  window.addEventListener("popstate", listener); window.addEventListener(event, listener);
  return () => { window.removeEventListener("popstate", listener); window.removeEventListener(event, listener); };
}
export function useRuntimeRoute(key: string): [string, (value: string) => void] {
  const search = useSyncExternalStore(subscribe, () => location.search, () => "");
  return [new URLSearchParams(search).get(`runtime.${key}`) ?? "", value => {
    const url = new URL(location.href);
    if (value) url.searchParams.set(`runtime.${key}`, value); else url.searchParams.delete(`runtime.${key}`);
    history.replaceState(history.state, "", url); window.dispatchEvent(new Event(event));
  }];
}
