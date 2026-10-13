import { Button } from "../components/button";
import { ErrorDetails } from "../data/diagnostics/ErrorDetails";
import { Icon } from "../data/Icon";
import { UiPlay } from "../icons";
import { operationErrorDiagnostics } from "./operationErrorDiagnostics";

export type InlineErrorProps = {
  title: string;
  error: unknown;
  className?: string;
  runNow?: {
    onClick: () => void;
    loading?: boolean;
  };
};

export function InlineError({ title, error, className, runNow }: InlineErrorProps) {
  return (
    <ErrorDetails
      title={title}
      diagnostics={operationErrorDiagnostics(error)}
      {...(className ? { className } : {})}
      actions={
        runNow && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={runNow.onClick}
            loading={runNow.loading ?? false}
            loadingLabel={runNow.loading ? "Running…" : undefined}
          >
            <Icon icon={UiPlay} />
            Run now
          </Button>
        )
      }
    />
  );
}
