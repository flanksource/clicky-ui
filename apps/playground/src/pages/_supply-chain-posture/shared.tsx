/**
 * What every design on this page has in common: the props they take, and the one
 * control strip they all draw.
 *
 * The strip is a **fixed set in a fixed order**, identical on every row. That is
 * the whole point of merging what used to be a Secrets column and a Code scanning
 * column: with stable positions the reader scans *down* a position to compare one
 * control across the estate, which is how a missing control is actually found. A
 * column that only showed the controls a repository happened to have would hide
 * exactly the repositories worth looking at.
 *
 * The set deliberately mixes two kinds of evidence, because the register keeps
 * them apart and so must this page: a setting being on (configuration), a source
 * having reported (operating), and a Scorecard result (assessment) are three
 * different answers, and one standing in for another would be a false statement.
 */

import {
  checkOf,
  controlOf,
  CI_TESTS,
  CODE_SCANNING_REPORTING,
  DEPENDENCY_UPDATE_TOOL,
  PINNED_DEPENDENCIES,
  PUSH_PROTECTION,
  SAST,
  SECRET_REPORTING,
  SECRET_SCANNING,
  SIGNED_RELEASES,
  type SupplyChainPosture,
} from "./fixture";
import { ControlPip, type ControlOutcome } from "./marks";

export type DesignProps = { postures: SupplyChainPosture[] };

/**
 * The control strip, in the order it is drawn — secrets, then code scanning, then
 * the build and dependency checks. The legend lists these in the same order, and
 * that ordering is the only thing telling two controls that share a glyph apart.
 */
export const CONTROL_STRIP: {
  id: string;
  outcome: (posture: SupplyChainPosture) => ControlOutcome;
  /**
   * Overrides the catalog glyph, where the catalog's choice is right for a list
   * of controls but wrong for a strip that sets nine of them side by side —
   * either because it reuses the glyph of the setting a source reports on, or
   * because it files a control under a generic stage glyph another control also
   * claims. See `icons.tsx` for each one.
   */
  icon?: string;
}[] = [
  { id: SECRET_SCANNING, outcome: (p) => ({ state: p.secrets.scanning }) },
  { id: PUSH_PROTECTION, outcome: (p) => ({ state: p.secrets.pushProtection }) },
  {
    id: SECRET_REPORTING,
    icon: "sc:reported-secret",
    outcome: (p) => ({ state: p.secrets.reporting }),
  },
  { id: SAST, outcome: (p) => ({ check: checkOf(p, SAST) }) },
  {
    id: CODE_SCANNING_REPORTING,
    icon: "sc:reported-vulnerability",
    outcome: (p) => ({ state: p.codeScanning.reporting }),
  },
  { id: CI_TESTS, icon: "sc:tests", outcome: (p) => ({ check: checkOf(p, CI_TESTS) }) },
  { id: PINNED_DEPENDENCIES, outcome: (p) => ({ check: checkOf(p, PINNED_DEPENDENCIES) }) },
  { id: DEPENDENCY_UPDATE_TOOL, outcome: (p) => ({ check: checkOf(p, DEPENDENCY_UPDATE_TOOL) }) },
  { id: SIGNED_RELEASES, outcome: (p) => ({ check: checkOf(p, SIGNED_RELEASES) }) },
];

/** The glyph a strip position draws — its override, or the control's own. */
export function stripIcon(entry: (typeof CONTROL_STRIP)[number]): string {
  return entry.icon ?? controlOf(entry.id).icon;
}

export function ControlStrip({ posture }: { posture: SupplyChainPosture }) {
  return (
    <span className="flex shrink-0 items-center gap-0.5">
      {CONTROL_STRIP.map((entry) => (
        <ControlPip
          controlId={entry.id}
          icon={stripIcon(entry)}
          key={entry.id}
          outcome={entry.outcome(posture)}
        />
      ))}
    </span>
  );
}
