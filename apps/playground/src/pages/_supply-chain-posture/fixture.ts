/**
 * One supply-chain posture row per repository in the trust repo's
 * `registers/sdlc-control-applicability-register.yaml`, joined to the breaches
 * recorded in `registers/risk-and-exception-register.yaml`.
 *
 * `posture.json` is a snapshot, not a live read — the playground cannot reach
 * across repos, and parsing the register here would need a `yaml` dependency the
 * app does not carry. It was emitted from trust's own derivation so the shape and
 * the gaps are the real ones.
 *
 * **The gaps are the point.** Twenty-one of the thirty-two rows have no Scorecard
 * assessment, one has no repository configuration records at all, several checks
 * scored `null` because Scorecard could not conclude, and no row carries operating
 * evidence for secret scanning. A design that only looks right on a fully
 * populated register is designing for a document that does not exist — so none of
 * these rows may be tidied away, and `not_recorded` must never render as a pass.
 */

import raw from "./posture.json";

export type ControlState = "enabled" | "disabled" | "reporting" | "not_recorded";
export type ControlRequirement = "required" | "conditional" | "optional";
export type FindingSeverity = "critical" | "high" | "medium" | "low";

export const FINDING_SEVERITIES: FindingSeverity[] = [
  "critical",
  "high",
  "medium",
  "low",
];

/**
 * The remediation SLA, in days from **first detection** — the date the detection
 * source first observed the finding, not the date anyone triaged it.
 *
 * Approved in Secure Development Lifecycle Policy §4.7 and held in the trust
 * repo's `controls/sdlc/catalog.yaml`. Transcribed rather than derived, because
 * these are four policy constants that change only by approval, not per snapshot;
 * `posture.json` already carries the counts measured against them.
 */
export const REMEDIATION_TARGET_DAYS: Record<FindingSeverity, number> = {
  critical: 7,
  high: 30,
  medium: 90,
  low: 180,
};

/**
 * A credential a secret-scanning source reports as both currently valid and
 * publicly leaked has a target of zero days: containment and revocation are
 * already required without waiting, so such a finding is out of SLA on detection.
 */
export const IMMEDIATE_TARGET_CONDITION =
  "a currently valid, publicly leaked credential";

/** A control catalog entry — title and glyph are identical across repositories. */
export type CatalogControl = {
  title: string;
  /** `sc:` token from the trust control catalog; resolved by `./icons`. */
  icon: string;
  requirement: ControlRequirement;
};

export type ScorecardCheck = {
  controlId: string;
  /** null where the tool ran but could not conclude — never a zero. */
  score: number | null;
  maxScore: number;
  reason: string;
};

export type VulnerabilityPosture = {
  open: Record<FindingSeverity, number>;
  breached: Record<FindingSeverity, number>;
  withinTarget: Record<FindingSeverity, number>;
  openTotal: number;
  breachedTotal: number;
  /** Share of open findings inside their remediation target; null when none are open. */
  adherence: number | null;
  oldestBreach: string | null;
};

export type SecretsPosture = {
  /** `GitHub:secret-scanning` — configuration evidence. */
  scanning: ControlState;
  /** `GitHub:secret-scanning-push-protection` — configuration evidence. */
  pushProtection: ControlState;
  /** `detection:GitHub Secret Scanning` — operating evidence it has ever reported. */
  reporting: ControlState;
  leaked: number;
};

export type CodeScanningPosture = {
  /**
   * `OpenSSF:SAST` — the only enablement fact the register evidences for code
   * scanning. There is no `GitHub:code-scanning` configuration record, so a
   * repository Scorecard never assessed is null rather than borrowing the
   * reporting answer.
   */
  enablement: ScorecardCheck | null;
  /** `detection:GitHub Code Scanning` — operating evidence. */
  reporting: ControlState;
};

export type LanguageVolume = { name: string; code: number; files: number };

export type CommitActivity = {
  total: number;
  /** The 30 days before the window, so the badge can say which way it is going. */
  previousTotal: number;
  /** Six five-day buckets, oldest first. */
  buckets: number[];
  windowDays: number;
};

/**
 * Code volume and commit activity.
 *
 * **Not register evidence.** The register records controls, not code — it carries
 * language names with no volume and no commit history at all — so these come from
 * the repository itself and are stamped with their source and revision. They are
 * context for reading the control columns (a dormant repository and a repository
 * shipping daily deserve different attention), never a control result.
 */
export type RepositoryActivity = {
  observedAt: string;
  source: string;
  revision: string;
  totalCode: number;
  languages: LanguageVolume[];
  /** Everything under the reporting threshold, kept so the total still adds up. */
  otherCode: number;
  commits: CommitActivity;
};

export type SupplyChainPosture = {
  repository: string;
  visibility: "public" | "private" | "unknown";
  languages: string[];
  observedAt: string | null;
  scorecard: { score: number; maxScore: number; reason: string } | null;
  /** Scored checks, worst first, with an inconclusive check sorted last. */
  checks: ScorecardCheck[];
  /** null where the entry carries no vulnerability posture block at all. */
  vulnerabilities: VulnerabilityPosture | null;
  secrets: SecretsPosture;
  codeScanning: CodeScanningPosture;
  /** null where no local checkout was available to measure. */
  activity: RepositoryActivity | null;
};

type Snapshot = {
  observedAt: string;
  /** When the code and commit figures were measured — a different clock. */
  activityObservedAt: string;
  controls: Record<string, CatalogControl>;
  postures: SupplyChainPosture[];
};

const snapshot = raw as Snapshot;

/** The date every projected control record in the snapshot was observed. */
export const OBSERVED_AT = snapshot.observedAt;

/** The date the code and commit figures were measured, which is not the same day. */
export const ACTIVITY_OBSERVED_AT = snapshot.activityObservedAt;

export const CONTROLS = snapshot.controls;

export const POSTURES = snapshot.postures;

/**
 * A control's catalog entry. Throws rather than falling back to a placeholder: a
 * mark whose glyph silently became a question mark would misreport the control it
 * stands for, which is the one thing this vocabulary exists to prevent.
 */
export function controlOf(controlId: string): CatalogControl {
  const control = CONTROLS[controlId];
  if (!control) {
    throw new Error(
      `${controlId} is not in the posture snapshot's control catalog — re-emit posture.json from the trust repo`,
    );
  }
  return control;
}

/** Controls whose answer is a recorded state — a setting, or a source reporting. */
export const SECRET_SCANNING = "GitHub:secret-scanning";
export const PUSH_PROTECTION = "GitHub:secret-scanning-push-protection";
export const SECRET_REPORTING = "detection:GitHub Secret Scanning";
export const CODE_SCANNING_REPORTING = "detection:GitHub Code Scanning";

/** Controls whose answer is a Scorecard result, reached through `checkOf`. */
export const SAST = "OpenSSF:SAST";
export const CI_TESTS = "OpenSSF:CI-Tests";
export const PINNED_DEPENDENCIES = "OpenSSF:Pinned-Dependencies";
export const DEPENDENCY_UPDATE_TOOL = "OpenSSF:Dependency-Update-Tool";
export const SIGNED_RELEASES = "OpenSSF:Signed-Releases";

/**
 * One repository's result for a scored check, or null where Scorecard never ran.
 *
 * Null and a zero are different answers and must not collapse into each other: a
 * repository nobody assessed has not failed the check.
 */
export function checkOf(
  posture: SupplyChainPosture,
  controlId: string,
): ScorecardCheck | null {
  return posture.checks.find((check) => check.controlId === controlId) ?? null;
}
