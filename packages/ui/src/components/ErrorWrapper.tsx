import {
  Component,
  useMemo,
  useState,
  type ErrorInfo,
  type ReactNode,
} from "react";
import { ErrorDetails } from "../data/diagnostics/ErrorDetails";
import {
  normalizeErrorDiagnostics,
  type ErrorDiagnostics,
} from "../data/diagnostics/error-diagnostics";
import { Icon } from "../data/Icon";
import { UiCheck, UiCopy, UiWarningTriangle } from "../icons";
import { cn } from "../lib/utils";
import { Button } from "./button";

export type ErrorWrapperProps = {
  children: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
};

type ErrorWrapperState = {
  error: Error | null;
  componentStack: string | null;
};

export class ErrorWrapper extends Component<
  ErrorWrapperProps,
  ErrorWrapperState
> {
  override state: ErrorWrapperState = {
    error: null,
    componentStack: null,
  };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ componentStack: errorInfo.componentStack ?? null });
    this.props.onError?.(error, errorInfo);
  }

  override render() {
    if (this.state.error) {
      return (
        <ErrorFallback
          error={this.state.error}
          componentStack={this.state.componentStack}
        />
      );
    }
    return this.props.children;
  }
}

type CopyState = "idle" | "copied" | "failed";

function copyStatusMessage(copyState: CopyState): string {
  if (copyState === "copied") return "Error details copied to clipboard.";
  if (copyState === "failed") {
    return "Clipboard access failed. Expand the error details to copy individual values.";
  }
  return "";
}

function ErrorFallback({
  error,
  componentStack,
}: {
  error: Error;
  componentStack: string | null;
}) {
  const [copyState, setCopyState] = useState<CopyState>("idle");
  const diagnostics = useMemo(
    () => errorDiagnostics(error, componentStack),
    [componentStack, error],
  );

  const copyDetails = async () => {
    if (!navigator.clipboard?.writeText) {
      setCopyState("failed");
      return;
    }
    try {
      await navigator.clipboard.writeText(errorReport(error, componentStack));
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  };

  return (
    <main
      data-slot="error-wrapper"
      role="alert"
      aria-labelledby="error-wrapper-title"
      className="flex min-h-dvh w-full items-center justify-center bg-background p-density-6 text-foreground"
    >
      <div className="w-full max-w-3xl">
        <div className="mb-density-4 flex items-start gap-density-3">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-destructive/10 text-destructive">
            <Icon icon={UiWarningTriangle} className="size-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-destructive">
              Unexpected application error
            </p>
            <h1
              id="error-wrapper-title"
              className="mt-density-1 text-2xl font-semibold tracking-tight"
            >
              Something went wrong
            </h1>
            <p className="mt-density-2 break-words text-sm text-muted-foreground">
              {diagnostics.message}
            </p>
          </div>
        </div>

        <div className="mb-density-3 flex items-center gap-density-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => void copyDetails()}
          >
            <Icon icon={copyState === "copied" ? UiCheck : UiCopy} />
            {/* Distinct from ErrorDetails' own "Copy error details" control
                below: this copies the page-level report (URL, user agent,
                React component stack), and two identically named buttons in
                one view are ambiguous to assistive tech. */}
            {copyState === "copied" ? "Copied" : "Copy error report"}
          </Button>
          <span
            aria-live="polite"
            className={cn(
              "text-xs",
              copyState === "failed"
                ? "text-destructive"
                : "text-muted-foreground",
            )}
          >
            {copyStatusMessage(copyState)}
          </span>
        </div>

        <ErrorDetails diagnostics={diagnostics} />
      </div>
    </main>
  );
}

function errorDiagnostics(
  error: Error,
  componentStack: string | null,
): ErrorDiagnostics {
  const diagnostics = normalizeErrorDiagnostics(
    error,
    "An unexpected error was thrown without a message.",
  );
  if (!diagnostics) {
    throw new Error("ErrorWrapper could not normalize the captured error");
  }

  const cause =
    error.cause === undefined
      ? []
      : [["cause", String(error.cause)] as [string, string]];
  const reactStack = componentStack?.trim();
  return {
    ...diagnostics,
    context: [...diagnostics.context, ...cause],
    ...(reactStack
      ? {
          stacktrace: [
            diagnostics.stacktrace,
            "React component stack:",
            reactStack,
          ]
            .filter(Boolean)
            .join("\n\n"),
        }
      : {}),
  };
}

function errorReport(error: Error, componentStack: string | null) {
  const lines = [
    `Error: ${error.message || "An unexpected error was thrown without a message."}`,
  ];
  if (error.name !== "Error") lines.push(`Type: ${error.name}`);
  if (error.cause !== undefined) lines.push(`Cause: ${String(error.cause)}`);
  if (typeof window !== "undefined") {
    // Origin and path only: an error report is pasted into issues and chats,
    // and a query string or fragment routinely carries a session token, a
    // signed URL or a search term the reporter did not mean to publish.
    lines.push(`Page: ${window.location.origin}${window.location.pathname}`);
  }
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    lines.push(`User agent: ${navigator.userAgent}`);
  }
  lines.push(`Time: ${new Date().toISOString()}`);
  if (error.stack) lines.push("", "Stack trace:", error.stack);
  if (componentStack?.trim()) {
    lines.push("", "React component stack:", componentStack.trim());
  }
  return lines.join("\n");
}
