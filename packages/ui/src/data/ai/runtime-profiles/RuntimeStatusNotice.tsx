import { Button } from "../../../components/button";
import { Icon } from "../../Icon";
import { UiRefresh } from "../../../icons";

export function RuntimeStatusNotice({
  status,
  loadingText,
  error,
  onRetry,
  retryLabel = "Retry",
}: {
  status: "idle" | "loading" | "resolved" | "error";
  loadingText: string;
  error?: string | undefined;
  onRetry: () => void;
  retryLabel?: string | undefined;
}) {
  if (status === "loading") {
    return (
      <p
        role="status"
        className="rounded-md border border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground"
      >
        {loadingText}
      </p>
    );
  }
  if (status !== "error") return null;
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
    >
      <span>{error ?? "Unable to load runtime data."}</span>
      <Button size="sm" variant="outline" onClick={onRetry}>
        <Icon icon={UiRefresh} className="size-3.5" />
        {retryLabel}
      </Button>
    </div>
  );
}
