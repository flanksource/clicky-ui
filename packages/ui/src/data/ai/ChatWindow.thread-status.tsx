import { Button } from "../../components/button";
import type { ChatThreadSetup } from "./ChatWindow.thread";

export function ChatThreadSetupStatus({
  setup,
}: {
  setup: ChatThreadSetup;
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 p-4 text-sm text-muted-foreground">
      {setup.pending ? (
        <span>Starting conversation…</span>
      ) : (
        <>
          <span role="alert">{setup.error}</span>
          <Button type="button" size="sm" variant="outline" onClick={setup.retry}>
            Retry
          </Button>
        </>
      )}
    </div>
  );
}
