export type MutationGateState = {
  /** The agent permits mutations (`JvmStatus.allowMutation`); undefined while unknown. */
  runtime: boolean | undefined;
  /** The host lets this operator change the JVM (permissions). */
  permitted: boolean;
  /** The operator has opted in on this surface; ignored when consent is not required. */
  consent: boolean;
  requireConsent: boolean;
};

/** Whether a write may be sent: the runtime, the host and (when asked) the operator all agree. */
export function mutationAllowed({ runtime, permitted, consent, requireConsent }: MutationGateState): boolean {
  return runtime === true && permitted && (consent || !requireConsent);
}
