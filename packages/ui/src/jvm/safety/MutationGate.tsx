import { Checkbox } from "../../components/Checkbox";
import type { MutationGateState } from "./mutation-allowed";

export type MutationGateProps = MutationGateState & {
  /** Checkbox label, e.g. "Allow MBean changes". */
  label: string;
  onConsentChange: (consent: boolean) => void;
};

/**
 * The one place an operator learns why JVM writes are unavailable and opts in
 * to them. Changes affect the whole JVM, including other applications in it.
 */
export function MutationGate({ runtime, permitted, consent, requireConsent, label, onConsentChange }: MutationGateProps) {
  if (!permitted) return null;
  if (runtime === undefined) {
    return (
      <p role="status" className="text-xs text-muted-foreground">
        Checking whether this JVM accepts changes…
      </p>
    );
  }
  if (!runtime) {
    return (
      <p role="status" className="text-xs text-muted-foreground">
        Runtime changes are disabled for this JVM. Enable mutations in the agent configuration to write or invoke.
      </p>
    );
  }
  if (!requireConsent) return null;
  return <Checkbox className="text-xs" checked={consent} onChange={onConsentChange} label={label} />;
}
