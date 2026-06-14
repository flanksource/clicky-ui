import { Button, ToastProvider, useToast } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

function Triggers() {
  const { toast } = useToast();
  return (
    <>
      <DemoRow label="Tones">
        <Button variant="secondary" onClick={() => toast("Comment posted")}>
          Neutral
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast({ message: "Approved — review submitted", tone: "success" })}
        >
          Success
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast({ message: "check \"e2e\" failed", tone: "danger" })}
        >
          Danger
        </Button>
        <Button
          variant="secondary"
          onClick={() => toast({ message: "Rebase recommended", tone: "warning" })}
        >
          Warning
        </Button>
      </DemoRow>
      <DemoRow label="Sticky">
        <Button
          variant="secondary"
          onClick={() => toast({ message: "Merge queued — dismiss me", tone: "info", durationMs: 0 })}
        >
          Stays until dismissed
        </Button>
      </DemoRow>
    </>
  );
}

export function ToastDemo() {
  return (
    <DemoSection
      id="toast"
      title="Toast"
      description="Imperative confirmation toasts (the Gavel PRDetail toast). Wrap a subtree in ToastProvider and call useToast().toast(...). Auto-dismisses after ~2.2s."
    >
      <ToastProvider>
        <Triggers />
      </ToastProvider>
    </DemoSection>
  );
}
