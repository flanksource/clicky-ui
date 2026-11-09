import { useQuery } from "@tanstack/react-query";
import { StatusDot } from "../data/cells/StatusDot";
import { stripTrailingSlashes } from "../lib/string";

const STATUS = {
  ready: { label: "KEK ready", status: "success" },
  missing: { label: "KEK missing", status: "warning" },
  unavailable: { label: "KEK unavailable", status: "error" },
  not_configured: { label: "KEK not configured", status: "warning" },
} as const;

type KEKStatus = { state: keyof typeof STATUS; detail: string };

export function ConnectionStorageStatus({ apiBase }: { apiBase: string }) {
  const query = useQuery({
    queryKey: ["connection-storage", apiBase],
    queryFn: async (): Promise<KEKStatus> => {
      const response = await fetch(
        `${stripTrailingSlashes(apiBase)}/connections/storage`,
      );
      if (!response.ok)
        throw new Error(`Cannot read KEK status (${response.status})`);
      const body = (await response.json()) as { kek?: KEKStatus };
      if (!body.kek || !Object.hasOwn(STATUS, body.kek.state))
        throw new Error("Invalid KEK status response");
      return body.kek;
    },
    retry: false,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const state = query.isPending
    ? undefined
    : STATUS[query.data?.state ?? "unavailable"];
  return (
    <span role="status" className="ml-auto shrink-0">
      <StatusDot
        status={state?.status ?? "info"}
        label={state?.label ?? "Checking KEK…"}
        title={
          query.error?.message ??
          query.data?.detail ??
          "Checking connection encryption key availability"
        }
      />
    </span>
  );
}
