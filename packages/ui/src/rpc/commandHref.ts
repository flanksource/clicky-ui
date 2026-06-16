import type { ClickyResolvedCommand } from "../data/Clicky";

// buildCommandHref maps a resolved clicky command to a navigable href. Entity
// `get` commands route to the surface detail URL (/<surface>/<id>); everything
// else routes to the generic /commands/<id> form carrying args/flags as query
// params. Shared between EntityExplorerApp's own navigation and host apps that
// drive the leaf operation components through their own router.

export const AUTORUN_QUERY_PARAM = "autoRun";
export const ARG_QUERY_PREFIX = "__arg";

export function trimTrailingSlash(value: string): string {
  if (!value) return "";
  return value.length > 1 ? value.replace(/\/+$/, "") : value;
}

export function withBasePath(basePath: string, pathname: string): string {
  const base = trimTrailingSlash(basePath);
  if (!base || base === "/") {
    return pathname;
  }
  return `${base}${pathname}`;
}

export function buildCommandHref(
  basePath: string,
  resolved: ClickyResolvedCommand,
): string | undefined {
  const commandId = resolved.operation?.operation.operationId ?? resolved.request.command;
  if (!commandId) return undefined;

  const meta = resolved.operation?.operation["x-clicky"];
  const args = resolved.request.args ?? [];
  const flags = resolved.request.flags ?? {};

  // Entity `get` commands route to the surface detail URL: /<surface>/<id>?<flags>
  if (meta?.verb === "get" && meta?.scope === "entity" && meta.surface && args[0]) {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(flags)) {
      if (value !== undefined && value !== "") {
        search.set(key, value);
      }
    }
    const query = search.toString();
    const suffix = query ? `?${query}` : "";
    return withBasePath(
      basePath,
      `/${encodeURIComponent(meta.surface)}/${encodeURIComponent(args[0])}${suffix}`,
    );
  }

  const search = new URLSearchParams();
  args.forEach((value, index) => {
    if (value !== undefined && value !== "") {
      search.set(`${ARG_QUERY_PREFIX}${index}`, value);
    }
  });
  for (const [key, value] of Object.entries(flags)) {
    if (value !== undefined && value !== "") {
      search.set(key, value);
    }
  }
  if (resolved.request.autoRun) {
    search.set(AUTORUN_QUERY_PARAM, "1");
  }

  const query = search.toString();
  const suffix = query ? `?${query}` : "";
  return withBasePath(basePath, `/commands/${encodeURIComponent(commandId)}${suffix}`);
}
