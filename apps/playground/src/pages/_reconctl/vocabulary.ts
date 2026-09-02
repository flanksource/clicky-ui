/**
 * Every closed vocabulary reconctl has, with the glyph and tone each value earns.
 *
 * The values are recon's own, copied from the Go source rather than invented:
 * `Severity` and `Phase` from `internal/api/{finding,scan}.go`, `Class`,
 * `TargetKind` and `CredentialMode` from `internal/api/target.go`, `Failure`
 * from `internal/probe/failure.go`, the `TLS` booleans from the same file,
 * `ResourceKind`/`ResourceState` from `internal/api/resource.go`, the engine
 * list from `internal/engines/all/all.go`, and the eleven entities from
 * `internal/entities/entities.go`.
 *
 * `meaning` is not decoration. Three of these vocabularies have a value whose
 * name misleads — `unclassified` sounds neutral but recon counts it as risky,
 * `info` is a severity rather than an absence of one, and `absent` on a
 * resource means "was here and is gone" rather than "never seen". A design
 * system that lists the tokens without saying that has published a colour chart,
 * not a vocabulary.
 */

import type { Severity } from "../_recon/severity";
import type { GlyphToken } from "./icons";
import type { Tone } from "./tone";

export type Term<T extends string = string> = {
  value: T;
  label: string;
  glyph: GlyphToken;
  tone: Tone;
  meaning: string;
};

export type Vocabulary = {
  id: string;
  title: string;
  /** Where the values come from, so a reader can check them. */
  source: string;
  description: string;
  terms: readonly Term[];
};

// ---------------------------------------------------------------------------
// Findings
// ---------------------------------------------------------------------------

const SEVERITY_TERMS: readonly Term<Severity>[] = [
  {
    value: "critical",
    label: "Critical",
    glyph: "sev:critical",
    tone: "critical",
    meaning: "Exploitable now, or already exposed. The only level that justifies waking someone.",
  },
  {
    value: "high",
    label: "High",
    glyph: "sev:high",
    tone: "high",
    meaning: "A real weakness with a plausible path to it. Separate hue from critical, not a lighter red.",
  },
  {
    value: "medium",
    label: "Medium",
    glyph: "sev:medium",
    tone: "medium",
    meaning: "The bulk of any Prowler run. Triage fodder — the long tail that is the actual problem.",
  },
  {
    value: "low",
    label: "Low",
    glyph: "sev:low",
    tone: "low",
    meaning: "Hardening rather than risk. Worth fixing, never worth paging.",
  },
  {
    value: "info",
    label: "Info",
    glyph: "sev:info",
    tone: "info",
    meaning: "A finding that reports rather than warns. Still a finding — not an absence of one.",
  },
  {
    value: "unknown",
    label: "Unknown",
    glyph: "sev:unknown",
    tone: "unknown",
    meaning:
      "recon could not parse the engine's severity. Deliberately not an alias for info: a level nobody could read is not a level someone decided was harmless.",
  },
];

// ---------------------------------------------------------------------------
// Scans
// ---------------------------------------------------------------------------

const PHASE_TERMS: readonly Term[] = [
  { value: "idle", label: "Idle", glyph: "phase:idle", tone: "absent", meaning: "Registered and never run." },
  { value: "queued", label: "Queued", glyph: "phase:queued", tone: "chrome", meaning: "Accepted, waiting for a slot." },
  {
    value: "running",
    label: "Running",
    glyph: "phase:running",
    tone: "action",
    meaning: "In flight. The only phase that changes on its own, so the only one that earns the action hue.",
  },
  {
    value: "done",
    label: "Done",
    glyph: "phase:done",
    tone: "healthy",
    meaning:
      "The run completed. Emerald is honest here — a finished scan is an observed event, unlike an account with no findings.",
  },
  { value: "failed", label: "Failed", glyph: "phase:failed", tone: "critical", meaning: "The engine exited non-zero." },
  {
    value: "cancelled",
    label: "Cancelled",
    glyph: "phase:cancelled",
    tone: "unknown",
    meaning: "Stopped by a human. Not a failure, and not a result — the findings it did write are partial.",
  },
];

// ---------------------------------------------------------------------------
// Targets
// ---------------------------------------------------------------------------

const KIND_TERMS: readonly Term[] = [
  {
    value: "host",
    label: "Host",
    glyph: "kind:host",
    tone: "chrome",
    meaning: "Addressable: something an engine can point a packet at.",
  },
  {
    value: "provider-context",
    label: "Provider context",
    glyph: "kind:provider-context",
    tone: "chrome",
    meaning: "A cloud account or project. Not addressable — a scan context, not an endpoint.",
  },
];

const CLASS_TERMS: readonly Term[] = [
  {
    value: "public",
    label: "Public",
    glyph: "class:public",
    tone: "critical",
    meaning: "Internet-facing. Counted as risky by Class.Risky().",
  },
  {
    value: "prod",
    label: "Prod",
    glyph: "class:prod",
    tone: "high",
    meaning: "Production. Counted as risky.",
  },
  {
    value: "non-prod",
    label: "Non-prod",
    glyph: "class:non-prod",
    tone: "info",
    meaning: "Staging, dev, test. Real systems, lower blast radius.",
  },
  {
    value: "internal",
    label: "Internal",
    glyph: "class:internal",
    tone: "low",
    meaning: "Reachable only from inside. Lower exposure, not lower value.",
  },
  {
    value: "unclassified",
    label: "Unclassified",
    glyph: "class:unclassified",
    tone: "unknown",
    meaning:
      "Nobody has said what this is — and recon counts it as RISKY, alongside prod and public. Grey here means unresolved, never safe.",
  },
  {
    value: "deactivated",
    label: "Deactivated",
    glyph: "class:deactivated",
    tone: "absent",
    meaning: "Explicitly taken out of scope. The one class that is not scanned.",
  },
];

const CREDENTIAL_TERMS: readonly Term[] = [
  {
    value: "ambient",
    label: "Ambient",
    glyph: "cred:ambient",
    tone: "action",
    meaning: "Whatever the runner already holds — an instance role, a logged-in CLI.",
  },
  {
    value: "configured",
    label: "Configured",
    glyph: "cred:configured",
    tone: "chrome",
    meaning: "A credential recon was given on purpose, tied to this target.",
  },
];

// ---------------------------------------------------------------------------
// Hosts — liveness and transport
// ---------------------------------------------------------------------------

const PROBE_TERMS: readonly Term[] = [
  {
    value: "up",
    label: "Up",
    glyph: "probe:up",
    tone: "healthy",
    meaning: "Answered. The one emerald on this axis, and it is an observation.",
  },
  { value: "dns", label: "DNS", glyph: "proto:dns", tone: "high", meaning: "The name did not resolve." },
  {
    value: "refused",
    label: "Refused",
    glyph: "proto:ports",
    tone: "medium",
    meaning: "The host answered and said no. Reachable, port closed.",
  },
  {
    value: "unreachable",
    label: "Unreachable",
    glyph: "probe:unreachable",
    tone: "high",
    meaning: "No route. Distinct from refused: nothing answered at all.",
  },
  {
    value: "timeout",
    label: "Timeout",
    glyph: "probe:timeout",
    tone: "medium",
    meaning: "Silence. Could be a filter, could be load — the one class that is genuinely ambiguous.",
  },
  { value: "tls", label: "TLS", glyph: "proto:tls", tone: "high", meaning: "The handshake failed." },
  { value: "http", label: "HTTP", glyph: "proto:http", tone: "low", meaning: "Connected; the HTTP exchange failed." },
  {
    value: "other",
    label: "Other",
    glyph: "probe:other",
    tone: "unknown",
    meaning: "Classified from the typed Go error chain and none of the above matched.",
  },
];

const TLS_TERMS: readonly Term[] = [
  { value: "expired", label: "Expired", glyph: "tls:expired", tone: "critical", meaning: "notAfter is in the past." },
  {
    value: "self_signed",
    label: "Self-signed",
    glyph: "tls:self-signed",
    tone: "high",
    meaning: "Its own issuer. Normal inside a mesh, alarming on the edge.",
  },
  {
    value: "mismatched",
    label: "Mismatched",
    glyph: "tls:mismatched",
    tone: "high",
    meaning: "The name served does not match the name requested.",
  },
  { value: "revoked", label: "Revoked", glyph: "tls:revoked", tone: "critical", meaning: "Withdrawn by its issuer." },
  {
    value: "untrusted",
    label: "Untrusted",
    glyph: "tls:untrusted",
    tone: "high",
    meaning: "Chains to a root the prober does not trust.",
  },
  {
    value: "wildcard_certificate",
    label: "Wildcard",
    glyph: "tls:wildcard",
    tone: "info",
    meaning: "A fact, not a fault. Worth showing because it widens what one key covers.",
  },
];

// ---------------------------------------------------------------------------
// Resources
// ---------------------------------------------------------------------------

const RESOURCE_KIND_TERMS: readonly Term[] = [
  {
    value: "account",
    label: "Account",
    glyph: "res:account",
    tone: "chrome",
    meaning: "A cloud account, subscription or project.",
  },
  {
    value: "cloud-resource",
    label: "Cloud resource",
    glyph: "res:cloud-resource",
    tone: "chrome",
    meaning: "A bucket, role, instance — anything with a provider uid.",
  },
  {
    value: "artifact",
    label: "Artifact",
    glyph: "res:artifact",
    tone: "chrome",
    meaning: "A container image or package — identified by digest rather than by an address, so it has no region and no host.",
  },
  {
    value: "endpoint",
    label: "Endpoint",
    glyph: "res:endpoint",
    tone: "chrome",
    meaning: "Something addressable that a scan reached.",
  },
];

const RESOURCE_STATE_TERMS: readonly Term[] = [
  {
    value: "present",
    label: "Present",
    glyph: "phase:done",
    tone: "healthy",
    meaning: "Seen in the most recent scan.",
  },
  {
    value: "absent",
    label: "Absent",
    glyph: "class:deactivated",
    tone: "absent",
    meaning:
      "Seen before and gone now — NOT 'never seen'. A resource with no failing findings never enters the inventory at all, because Prowler drops PASS before recon writes it.",
  },
];

// ---------------------------------------------------------------------------
// Engines
// ---------------------------------------------------------------------------

export type EngineFamily = "scan" | "discovery";

export type EngineTerm = Term & { family: EngineFamily };

export const ENGINE_TERMS: readonly EngineTerm[] = [
  {
    value: "nuclei",
    label: "nuclei",
    glyph: "engine:nuclei",
    tone: "chrome",
    family: "scan",
    meaning: "Template-driven active scanning against addressable targets. The engine whose profiles decide how intrusive a run is.",
  },
  {
    value: "prowler",
    label: "prowler",
    glyph: "engine:prowler",
    tone: "chrome",
    family: "scan",
    meaning: "Cloud posture against the CIS benchmarks. Runs on a provider context rather than a host, and drops PASS records before recon writes them.",
  },
  {
    value: "trivy",
    label: "trivy",
    glyph: "engine:trivy",
    tone: "chrome",
    family: "scan",
    meaning: "Known vulnerabilities in container images and packages, keyed by digest rather than by address.",
  },
  {
    value: "inspec",
    label: "inspec",
    glyph: "engine:inspec",
    tone: "chrome",
    family: "scan",
    meaning: "CINC Auditor compliance profiles — the engine behind the requirement-level compliance tags on a finding.",
  },
  {
    value: "subfinder",
    label: "subfinder",
    glyph: "engine:subfinder",
    tone: "chrome",
    family: "discovery",
    meaning: "Subdomain enumeration. Usually the first link of a full discovery chain, and the one that decides how wide the estate looks.",
  },
  {
    value: "dnsx",
    label: "dnsx",
    glyph: "proto:dns",
    tone: "chrome",
    family: "discovery",
    meaning: "Resolution and record probing. Shares the DNS mark with the probe failure class, because it is the same concept seen from two sides.",
  },
  {
    value: "naabu",
    label: "naabu",
    glyph: "engine:naabu",
    tone: "chrome",
    family: "discovery",
    meaning: "Port discovery. What fills a target's open_ports, and the engine most likely to be considered intrusive.",
  },
  {
    value: "httpx",
    label: "httpx",
    glyph: "proto:http",
    tone: "chrome",
    family: "discovery",
    meaning: "HTTP fingerprinting — status, title, webserver, technology. Populates the http and tech sections of a target.",
  },
  {
    value: "tlsx",
    label: "tlsx",
    glyph: "proto:tls",
    tone: "chrome",
    family: "discovery",
    meaning: "Certificate collection. Everything on the TLS posture axis above comes from this engine.",
  },
  {
    value: "katana",
    label: "katana",
    glyph: "engine:katana",
    tone: "chrome",
    family: "discovery",
    meaning: "Crawling for reachable paths, which become the known_paths a scanning engine can then be pointed at.",
  },
];

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

export const ENTITY_TERMS: readonly Term[] = [
  { value: "target", label: "Target", glyph: "entity:target", tone: "chrome", meaning: "The inventory unit — a host or a provider context." },
  { value: "scan", label: "Scan", glyph: "entity:scan", tone: "chrome", meaning: "One engine run against one selector." },
  { value: "finding", label: "Finding", glyph: "entity:finding", tone: "chrome", meaning: "One FAIL or MANUAL record. PASS never becomes one." },
  { value: "discover", label: "Discover", glyph: "entity:discover", tone: "chrome", meaning: "A discovery chain: full, targeted or explicit." },
  {
    value: "probe",
    label: "Probe",
    glyph: "entity:probe",
    tone: "chrome",
    meaning: "A liveness sweep over a selector, recorded as its own run with engine \"probe\" and profile \"liveness\".",
  },
  { value: "profile", label: "Profile", glyph: "entity:profile", tone: "chrome", meaning: "Engine configuration, keyed kind:engine:name." },
  { value: "mute", label: "Mute", glyph: "entity:mute", tone: "chrome", meaning: "A rule that suppresses findings — dimensions ANDed, values ORed, plus a CEL expression." },
  { value: "template", label: "Template", glyph: "entity:template", tone: "chrome", meaning: "A check an engine can run." },
  { value: "engine", label: "Engine", glyph: "entity:engine", tone: "chrome", meaning: "An installed scanner or discovery tool." },
  { value: "zone", label: "Zone", glyph: "entity:zone", tone: "chrome", meaning: "A DNS zone the inventory is grouped by." },
  { value: "connection", label: "Connection", glyph: "entity:connection", tone: "chrome", meaning: "Stored credentials a target can reference." },
];

// ---------------------------------------------------------------------------
// The published set
// ---------------------------------------------------------------------------

export const VOCABULARIES: readonly Vocabulary[] = [
  {
    id: "severity",
    title: "Finding severity",
    source: "Severity — internal/api/finding.go",
    description:
      "Six levels, not four. clicky-ui's BadgeStatus has four, which is why every recon severity column supplies its own render rather than using DataTable's built-in status kind.",
    terms: SEVERITY_TERMS,
  },
  {
    id: "phase",
    title: "Scan phase",
    source: "Phase — internal/api/scan.go",
    description: "done, failed and cancelled are terminal. Only running earns the action hue, because it is the only one that changes on its own.",
    terms: PHASE_TERMS,
  },
  {
    id: "kind",
    title: "Target kind",
    source: "TargetKind — internal/api/target.go",
    description: "An empty kind means host. The traits table decides whether a target is addressable or a provider context.",
    terms: KIND_TERMS,
  },
  {
    id: "class",
    title: "Target class",
    source: "Class — internal/api/target.go",
    description:
      "The exposure axis, and the one with a trap in it: Class.Risky() counts unclassified alongside prod and public.",
    terms: CLASS_TERMS,
  },
  {
    id: "credential",
    title: "Credential mode",
    source: "CredentialMode — internal/api/target.go",
    description: "How recon authenticates to a provider context.",
    terms: CREDENTIAL_TERMS,
  },
  {
    id: "probe",
    title: "Host liveness",
    source: "Failure — internal/probe/failure.go",
    description:
      "Classified from the typed Go error chain, never by matching error strings. refused and unreachable are deliberately separate: one answered, one did not.",
    terms: PROBE_TERMS,
  },
  {
    id: "tls",
    title: "TLS posture",
    source: "TLS — internal/api/target.go",
    description: "Boolean flags, so a certificate can carry several at once. Wildcard is a fact rather than a fault.",
    terms: TLS_TERMS,
  },
  {
    id: "resource-kind",
    title: "Resource kind",
    source: "ResourceKind — internal/api/resource.go",
    description: "Identity, not state — so every value takes the chrome hue and none of them takes a severity colour.",
    terms: RESOURCE_KIND_TERMS,
  },
  {
    id: "resource-state",
    title: "Resource state",
    source: "ResourceState — internal/api/resource.go",
    description: "Two values, and the second one does not mean what its name suggests.",
    terms: RESOURCE_STATE_TERMS,
  },
];
