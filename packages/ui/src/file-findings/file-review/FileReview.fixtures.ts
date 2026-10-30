import type { Comment, CommentAuthor } from "../../comments/comment-types";
import type { FileFinding } from "../types";

import type { BlameCommit, BlameRange } from "./blame";
import { quoteAnchor, type QuoteLocator } from "./quote-anchor";
import { locateSource, sourceAnchor } from "./source-anchor";

export const DOC_PATH = "docs/release-checklist.md";

// Every paragraph is one source line so a soft break never splits a quote.
export const DOC_SOURCE = [
  "# Release checklist", // 1
  "", // 2
  "This guide walks a maintainer through cutting a release of the example service, from freezing the branch to announcing the build.", // 3
  "", // 4
  "## Before you start", // 5
  "", // 6
  "Confirm the changelog lists every merged change and that the staging deploy has been green for a full day.", // 7
  "", // 8
  "- Freeze the release branch", // 9
  "- Run the full test suite", // 10
  "- Ask a second maintainer to review the notes", // 11
  "", // 12
  "## Cutting the build", // 13
  "", // 14
  "Tag the commit with the next semantic version and push the tag; CI builds the artifacts and publishes them to the registry.", // 15
  "", // 16
  "| Step | Owner | Time |", // 17
  "| --- | --- | --- |", // 18
  "| Tag | Release lead | 5 min |", // 19
  "| Publish | CI | 20 min |", // 20
  "| Announce | Release lead | 10 min |", // 21
  "", // 22
  "## After the release", // 23
  "", // 24
  "Watch the error dashboard for an hour and roll back if the error rate doubles.", // 25
  "", // 26
  "Post a short summary in the team channel with a link to the changelog.", // 27
  "", // 28
  "> Releases on a Friday need a second approver.", // 29
].join("\n");

function finding(line: number, severity: FileFinding["severity"], rule: string, message: string): FileFinding {
  return { file: DOC_PATH, line, severity, rule, message, source: "markdownlint", kind: "lint" };
}

export const DOC_FINDINGS: FileFinding[] = [
  finding(3, "warning", "MD013", "Line length exceeds 80 characters"),
  finding(3, "info", "write-good", "“cutting” is jargon; consider “publishing”"),
  finding(15, "warning", "MD013", "Line length exceeds 80 characters"),
  finding(20, "error", "vale.Units", "Spell out “min” as “minutes”"),
];

const DANA: CommentAuthor = { id: "dana", name: "Dana Reyes", kind: "user" };
const SAM: CommentAuthor = { id: "sam", name: "Sam Okafor", kind: "user" };
const PRIYA: CommentAuthor = { id: "priya", name: "Priya Shah", kind: "user" };

const BEFORE = ["Release checklist", "Before you start"];
const BUILD = ["Release checklist", "Cutting the build"];
const AFTER = ["Release checklist", "After the release"];

function root(id: string, author: CommentAuthor, at: QuoteLocator, body: string, status = "open"): Comment {
  return { id, author, body, status, anchor: quoteAnchor(at), createdAt: "2026-10-24T09:00:00.000Z" };
}

function reply(id: string, parentId: string, author: CommentAuthor, body: string): Comment {
  return { id, parentId, author, body, createdAt: "2026-10-25T14:00:00.000Z" };
}

// Every anchor names its section and carries the words around its quote, so a
// word that repeats ("error", "Release lead") still lands on the one meant.
// The two list-item quotes share a block, so block anchoring has to stack them.
export const DOC_COMMENTS: Comment[] = [
  root(
    "c-day",
    DANA,
    { path: BEFORE, prefix: "staging deploy has been", quote: "green for a full day", suffix: "." },
    "Is a full day enough? The last release regressed after 30 hours.",
  ),
  reply("c-day-r1", "c-day", SAM, "Let's make it 48 hours for major versions."),
  root(
    "c-freeze",
    SAM,
    { path: BEFORE, prefix: "", quote: "Freeze the release branch", suffix: "Run the full" },
    "Who owns the freeze? Name the role.",
  ),
  root(
    "c-review",
    PRIYA,
    { path: BEFORE, prefix: "full test suite", quote: "Ask a second maintainer", suffix: "to review the" },
    "Should this be the on-call reviewer instead?",
  ),
  root(
    "c-semver",
    DANA,
    { path: BUILD, prefix: "commit with the", quote: "next semantic version", suffix: "and push the" },
    "Link to the versioning policy here.",
  ),
  root(
    "c-publish",
    PRIYA,
    { path: BUILD, prefix: "lead 5 min", quote: "Publish", suffix: "CI 20 min" },
    "Publishing took 45 minutes last time; 20 is optimistic.",
  ),
  root(
    "c-announce",
    SAM,
    { path: BUILD, prefix: "20 min Announce", quote: "Release lead", suffix: "10 min" },
    "The announcement should come from the on-call lead, not the release lead.",
  ),
  root(
    "c-error",
    DANA,
    { path: AFTER, prefix: "roll back if the", quote: "error", suffix: "rate doubles" },
    "Which error rate: 5xx only, or client errors too?",
  ),
  root(
    "c-rollback",
    PRIYA,
    { path: AFTER, prefix: "for an hour and", quote: "roll back if the error rate doubles", suffix: "." },
    "Doubles from what baseline?",
    "resolved",
  ),
  reply("c-rollback-r1", "c-rollback", DANA, "Added the 7-day median as the baseline."),
];

/** A document to annotate: its markdown, people's comments on it and lint findings against it. */
export type DocFixture = { id: string; label: string; path: string; source: string; comments: Comment[]; findings: FileFinding[]; blame?: BlameRange[] };

export const SHORT_DOC: DocFixture = {
  id: "short",
  label: "Short",
  path: DOC_PATH,
  source: DOC_SOURCE,
  comments: DOC_COMMENTS,
  findings: DOC_FINDINGS,
};

const RUNBOOK_PATH = "docs/incident-runbook.md";
const RUNBOOK_TITLE = "Incident response runbook";

// Every paragraph, list item and table row is one source line.
const RUNBOOK_SECTIONS: { heading: string; lines: string[] }[] = [
  {
    heading: "Overview",
    lines: [
      "This runbook covers how the on-call engineer detects, triages, mitigates and closes an incident in the example platform, and who to involve at each stage.",
      "It assumes access to the paging tool, the metrics dashboards and the deploy pipeline; request access during onboarding rather than mid-incident.",
    ],
  },
  {
    heading: "Severity levels",
    lines: [
      "Pick the severity from customer impact, not from how alarming the alert looks.",
      "- SEV1: the product is down for most customers",
      "- SEV2: a core feature is degraded for many customers",
      "- SEV3: a minor feature is broken or a single tenant is affected",
      "When in doubt, start one level higher and downgrade once the impact is understood.",
    ],
  },
  {
    heading: "Detection",
    lines: [
      "Most incidents start from an alert in the paging tool; others arrive as a support ticket or a message from a customer success manager.",
      "Every alert links to a dashboard and a short description of what it measures; an alert without a dashboard link should be fixed after the incident.",
    ],
  },
  {
    heading: "Acknowledge the page",
    lines: [
      "Acknowledge the page within five minutes so the escalation policy does not wake the secondary.",
      "- Open the incident channel from the paging tool",
      "- Post the alert link and your first read of the impact",
      "- Set the severity, even if it is a guess",
    ],
  },
  {
    heading: "Triage",
    lines: [
      "Start with the four golden signals: latency, traffic, errors and saturation, for the service named in the alert and its direct dependencies.",
      "Check the deploy log for changes in the last two hours; a recent deploy is the most common cause and the fastest to undo.",
      "If no deploy lines up, compare the failing region with a healthy one before digging into a single host.",
    ],
  },
  {
    heading: "Roles",
    lines: [
      "| Role | Responsibility | Default |",
      "| --- | --- | --- |",
      "| Incident commander | Coordinates and decides | On-call engineer |",
      "| Communications lead | Status page and updates | Support lead |",
      "| Scribe | Timeline in the channel | Anyone free |",
      "For a SEV1, hand the incident commander role to someone not debugging so decisions do not wait on a terminal.",
    ],
  },
  {
    heading: "Mitigation",
    lines: [
      "Prefer actions that are quick to apply and quick to reverse: roll back the deploy, disable the feature flag, or shift traffic to the healthy region.",
      "Write down each action in the channel before you take it, with the time and the expected effect, so the scribe can build the timeline.",
    ],
  },
  {
    heading: "Rolling back",
    lines: [
      "Roll back with the deploy pipeline's revert button rather than a manual redeploy, which skips the pre-flight checks.",
      "- Confirm the previous build is still in the registry",
      "- Revert and watch the error rate for ten minutes",
      "- Leave the faulty commit on the branch until the review",
    ],
  },
  {
    heading: "Customer communication",
    lines: [
      "Post the first status page update within fifteen minutes of declaring a SEV1 or SEV2, even if it only says that the team is investigating.",
      "Update the status page every thirty minutes until resolution; silence reads as neglect.",
    ],
  },
  {
    heading: "Escalation",
    lines: [
      "Page the owning team's secondary if you have made no progress in thirty minutes, and the engineering manager for any SEV1.",
      "> Never wait for permission to escalate; a page that turns out to be unneeded costs far less than a slow response.",
    ],
  },
  {
    heading: "Resolution",
    lines: [
      "Declare the incident resolved once the signals have been normal for thirty minutes and no mitigation is still being applied.",
      "Close the status page incident with a one-line summary and a promise of a review.",
    ],
  },
  {
    heading: "Post-incident review",
    lines: [
      "Schedule the review within five working days while the details are fresh; invite everyone who joined the channel.",
      "- Build the timeline from the channel and the deploy log",
      "- Name contributing factors, not a single root cause",
      "- File every follow-up as a tracked task with an owner",
    ],
  },
  {
    heading: "Follow-up",
    lines: [
      "Review open follow-ups in the weekly operations meeting; a follow-up with no owner after two weeks is escalated to the engineering manager.",
      "Close the review document once every follow-up is done or explicitly declined.",
    ],
  },
  {
    heading: "Contacts",
    lines: [
      "| Team | Channel | Escalation |",
      "| --- | --- | --- |",
      "| Platform | #platform-oncall | Platform manager |",
      "| Payments | #payments-oncall | Payments manager |",
      "| Support | #support-leads | Head of support |",
    ],
  },
];

/** Blank lines between paragraphs; list items and table rows stay together as one block. */
function runbookSource(): string {
  const out = [`# ${RUNBOOK_TITLE}`];
  for (const { heading, lines } of RUNBOOK_SECTIONS) {
    out.push("", `## ${heading}`);
    lines.forEach((line, i) => {
      const previous = lines[i - 1];
      const joined = previous !== undefined && /^[-|]/.test(previous) && line[0] === previous[0];
      if (!joined) out.push("");
      out.push(line);
    });
  }
  return out.join("\n");
}

export const RUNBOOK_SOURCE = runbookSource();

/** The 1-based line holding `text`; throws so a fixture edit cannot silently misplace a finding. */
function runbookLine(text: string): number {
  const index = RUNBOOK_SOURCE.split("\n").findIndex((line) => line.includes(text));
  if (index < 0) throw new Error(`runbook fixture has no line containing ${JSON.stringify(text)}`);
  return index + 1;
}

function runbookFinding(text: string, severity: FileFinding["severity"], rule: string, message: string): FileFinding {
  return { file: RUNBOOK_PATH, line: runbookLine(text), severity, rule, message, source: "markdownlint", kind: "lint" };
}

const at = (heading: string, prefix: string, quote: string, suffix: string): QuoteLocator => ({
  path: [RUNBOOK_TITLE, heading],
  prefix,
  quote,
  suffix,
});

// Clusters (Acknowledge, Roles, Rolling back) stack several cards on nearby lines,
// so aligned cards get pushed below their anchors and the sidebar has to scroll on its own.
const RUNBOOK_COMMENTS: Comment[] = [
  root("r-impact", DANA, at("Severity levels", "severity from", "customer impact", ", not from"), "Can we give examples of impact per product area?"),
  root("r-higher", SAM, at("Severity levels", "doubt, start", "one level higher", "and downgrade"), "Downgrading later is cheap; agreed."),
  root("r-dashboard", PRIYA, at("Detection", "fixed after the", "incident", "."), "Who tracks these? Suggest a label on the follow-up."),
  root("r-five", DANA, at("Acknowledge the page", "page within", "five minutes", "so the"), "Five minutes is tight overnight; ten for SEV3?"),
  reply("r-five-r1", "r-five", SAM, "Keep five; the secondary page is the safety net."),
  root("r-channel", SAM, at("Acknowledge the page", "Open the", "incident channel", "from the"), "Link the channel naming convention."),
  root("r-guess", PRIYA, at("Acknowledge the page", "even if it is a", "guess", ""), "Worth saying it can change without asking anyone."),
  root("r-signals", DANA, at("Triage", "four", "golden signals", ": latency"), "Add a link to the dashboard that shows all four."),
  root("r-region", SAM, at("Triage", "compare the", "failing region", "with a healthy"), "We only have two regions; is this always possible?"),
  root("r-comms", PRIYA, at("Roles", "updates", "Support lead", "Scribe"), "Support lead is often asleep; name a backup."),
  root("r-scribe", DANA, at("Roles", "channel", "Anyone free", ""), "In practice nobody volunteers. Assign it explicitly."),
  root("r-terminal", SAM, at("Roles", "do not wait on a", "terminal", "."), "Great point, keep this."),
  root("r-flag", PRIYA, at("Mitigation", "deploy,", "disable the feature flag", ", or shift"), "Which flags are safe to flip without a review?"),
  root("r-revert", DANA, at("Rolling back", "deploy pipeline's", "revert button", "rather than"), "The revert button is hidden for non-admins."),
  reply("r-revert-r1", "r-revert", PRIYA, "Filed access change for on-call."),
  root("r-registry", SAM, at("Rolling back", "previous build is", "still in the registry", ""), "Registry keeps 30 builds; mention the retention."),
  root("r-ten", PRIYA, at("Rolling back", "error rate for", "ten minutes", ""), "Ten minutes misses slow leaks; make it thirty?"),
  root("r-fifteen", DANA, at("Customer communication", "update within", "fifteen minutes", "of declaring"), "Legal asked for ten for SEV1."),
  root("r-silence", SAM, at("Customer communication", "resolution;", "silence reads as neglect", "."), "Love this line."),
  root("r-permission", PRIYA, at("Escalation", "Never wait for", "permission", "to escalate"), "Should be bold, it is the most-missed rule."),
  root("r-normal", DANA, at("Resolution", "have been", "normal for thirty minutes", "and no"), "Normal by which threshold?", "resolved"),
  root("r-days", SAM, at("Post-incident review", "review within", "five working days", "while the"), "Three days for SEV1."),
  root("r-factors", PRIYA, at("Post-incident review", "Name", "contributing factors", ", not a"), "Link the review template."),
  root("r-weekly", DANA, at("Follow-up", "in the", "weekly operations meeting", "; a follow-up"), "This meeting was cancelled; use the ops review."),
  root("r-payments", SAM, at("Contacts", "Payments", "#payments-oncall", "Payments manager"), "Channel was renamed to #payments-incidents."),
];

const RUNBOOK_FINDINGS: FileFinding[] = [
  runbookFinding("This runbook covers", "warning", "MD013", "Line length exceeds 80 characters"),
  runbookFinding("golden signals", "info", "write-good", "“golden signals” is jargon; link a definition"),
  runbookFinding("revert button", "warning", "MD013", "Line length exceeds 80 characters"),
  runbookFinding("#payments-oncall", "error", "vale.Links", "Channel name is out of date"),
];

export const LONG_DOC: DocFixture = {
  id: "long",
  label: "Long",
  path: RUNBOOK_PATH,
  source: RUNBOOK_SOURCE,
  comments: RUNBOOK_COMMENTS,
  findings: RUNBOOK_FINDINGS,
};

export const CODE_PATH = "pkg/retry/retry.go";

export const CODE_SOURCE = [
  "package retry", // 1
  "", // 2
  "import (", // 3
  '\t"context"', // 4
  '\t"time"', // 5
  ")", // 6
  "", // 7
  "// Do calls fn until it succeeds, waiting longer after each failure.", // 8
  "func Do(ctx context.Context, attempts int, fn func() error) error {", // 9
  "\tdelay := 100 * time.Millisecond", // 10
  "\tvar err error", // 11
  "\tfor i := 0; i < attempts; i++ {", // 12
  "\t\tif err = fn(); err == nil {", // 13
  "\t\t\treturn nil", // 14
  "\t\t}", // 15
  "\t\tselect {", // 16
  "\t\tcase <-ctx.Done():", // 17
  "\t\t\treturn ctx.Err()", // 18
  "\t\tcase <-time.After(delay):", // 19
  "\t\t}", // 20
  "\t\tdelay *= 2", // 21
  "\t}", // 22
  "\treturn err", // 23
  "}", // 24
].join("\n");

const CODE_FINDINGS: FileFinding[] = [
  { file: CODE_PATH, line: 18, severity: "warning", rule: "wrapcheck", message: "error returned from external package is unwrapped", source: "golangci", kind: "lint" },
  { file: CODE_PATH, line: 21, severity: "info", rule: "mnd", message: "Magic number: 2", source: "golangci", kind: "lint" },
  { file: CODE_PATH, line: 23, severity: "error", rule: "errcheck", message: "Wrap the last error with the attempt count", source: "golangci", kind: "lint" },
];

/** A thread on `quote`, the first time it appears on `line`. */
function codeRoot(id: string, author: CommentAuthor, line: number, quote: string, body: string): Comment {
  const column = CODE_SOURCE.split("\n")[line - 1]!.indexOf(quote);
  if (column < 0) throw new Error(`fixture: "${quote}" is not on line ${line}`);
  const locator = locateSource(CODE_SOURCE, { line, column }, { line, column: column + quote.length });
  if (!locator) throw new Error(`fixture: "${quote}" on line ${line} is blank`);
  return { id, author, body, status: "open", anchor: sourceAnchor(locator), createdAt: "2026-10-24T09:00:00.000Z" };
}

const CODE_COMMENTS: Comment[] = [
  codeRoot("g-delay", DANA, 10, "100 * time.Millisecond", "Should the first delay come from an option? Callers hitting rate limits want seconds."),
  reply("g-delay-r1", "g-delay", SAM, "Agreed, take a Backoff struct with Initial and Max."),
  codeRoot("g-double", PRIYA, 21, "delay *= 2", "No cap: ten attempts wait 51 seconds before the last one."),
];

const ADD_RETRY: BlameCommit = { sha: "3f9c2a1b7d4e5f60718293a4b5c6d7e8f9012345", author: "Dana Reyes", date: "2025-03-14T10:12:00Z", summary: "Add retry helper" };
const CONTEXT: BlameCommit = { sha: "8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b", author: "Sam Okafor", date: "2025-11-02T16:40:00Z", summary: "Stop retrying when the context is cancelled" };
const BACKOFF: BlameCommit = { sha: "c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0", author: "Priya Shah", date: "2026-10-20T09:05:00Z", summary: "Back off exponentially" };

const CODE_BLAME: BlameRange[] = [
  { startLine: 1, lineCount: 3, commit: ADD_RETRY },
  { startLine: 4, lineCount: 1, commit: CONTEXT },
  { startLine: 5, lineCount: 4, commit: ADD_RETRY },
  { startLine: 9, lineCount: 1, commit: CONTEXT },
  { startLine: 10, lineCount: 1, commit: BACKOFF },
  { startLine: 11, lineCount: 5, commit: ADD_RETRY },
  { startLine: 16, lineCount: 5, commit: CONTEXT },
  { startLine: 21, lineCount: 1, commit: BACKOFF },
  { startLine: 22, lineCount: 3, commit: ADD_RETRY },
];

export const CODE_FILE: DocFixture = {
  id: "code",
  label: "Go file",
  path: CODE_PATH,
  source: CODE_SOURCE,
  comments: CODE_COMMENTS,
  findings: CODE_FINDINGS,
  blame: CODE_BLAME,
};

export const DOCS = [SHORT_DOC, LONG_DOC, CODE_FILE] as const;


