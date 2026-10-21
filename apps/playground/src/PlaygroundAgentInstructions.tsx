import { useState } from "react";
import { Button, Modal } from "@flanksource/clicky-ui";
import { writeClipboard } from "./comments/clipboard";
import { playgroundInstructions } from "./agent-instructions";

export function PlaygroundAgentInstructions() {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState<"instructions" | "install" | null>(null);
  const [error, setError] = useState("");

  const copy = (install: boolean) => {
    setCopied(null);
    setError("");
    void writeClipboard(
      Promise.resolve(playgroundInstructions({ url: location.href, install })),
    ).then(
      () => setCopied(install ? "install" : "instructions"),
      (cause: unknown) =>
        setError(cause instanceof Error ? cause.message : String(cause)),
    );
  };

  return (
    <>
      <Button
        size="sm"
        variant="outline"
        onClick={() => {
          setCopied(null);
          setError("");
          setOpen(true);
        }}
      >
        Agent instructions
      </Button>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Use the playground with an agent"
      >
        <div className="space-y-4 text-sm">
          <p>
            Copy instructions for creating pages, using shared components,
            checking layouts, and responding to feedback. The current page URL
            and feedback API address are included.
          </p>
          <div className="space-y-2">
            <Button className="w-full" onClick={() => copy(false)}>
              Copy playground instructions
            </Button>
            <p className="text-muted-foreground">
              Paste into your coding agent for the current task.
            </p>
          </div>
          <div className="space-y-2">
            <Button
              className="w-full"
              variant="outline"
              onClick={() => copy(true)}
            >
              Copy skill installation instructions
            </Button>
            <p className="text-muted-foreground">
              Ask your agent to save the reusable clicky-ui-playground skill in
              your workspace.
            </p>
          </div>
          {copied && (
            <p role="status" className="text-muted-foreground">
              {copied === "install"
                ? "Skill installation instructions copied."
                : "Playground instructions copied."}
            </p>
          )}
          {error && (
            <p role="alert" className="text-destructive">
              Nothing was copied — {error}
            </p>
          )}
        </div>
      </Modal>
    </>
  );
}
