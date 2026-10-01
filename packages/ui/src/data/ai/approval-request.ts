// Typed mirror of captain's `api.ApprovalRequest` / `api.ApprovalDecision` JSON
// (pkg/api/approval.go). Every field beyond `tool`/`input` is optional here: a
// host that predates the unified approval callback sends only the old shape and
// the viewer must keep rendering it.

export type ApprovalKind =
  | "tool"
  | "command"
  | "filesystem"
  | "network"
  | "permissions"
  | "question"
  | "elicitation"
  | "plan";

/** How far an approval reaches. Absent or "request" means this request only. */
export type ApprovalScope = "request" | "turn" | "session";

export interface StdinWrite {
  terminal: string;
  chars: string;
}

export interface CommandApproval {
  command?: string;
  cwd?: string;
  unsandboxed?: boolean;
  stdin?: StdinWrite;
  /** The provider's suggested persistent rule. Shown, never offered as an action. */
  proposedPolicy?: string[];
}

export type FilesystemOperation = "read" | "write" | "edit" | "delete" | "patch";

export interface FileChange {
  path: string;
  kind: string;
}

export interface FilesystemApproval {
  operation: FilesystemOperation;
  paths?: string[];
  changes?: FileChange[];
}

export interface NetworkApproval {
  host?: string;
  protocol?: string;
  url?: string;
  command?: string;
}

export type SandboxFilesystemAccess = "read-only" | "workspace-write";
export type SandboxNetworkAccess = "disabled" | "restricted" | "unrestricted";

export interface SandboxFilesystemPolicy {
  access?: SandboxFilesystemAccess;
  writableRoots?: string[];
  readableRoots?: string[];
  deniedReadRoots?: string[];
  deniedWriteRoots?: string[];
  includeSystemTemp?: boolean;
}

export interface SandboxNetworkPolicy {
  access?: SandboxNetworkAccess;
  allowedDomains?: string[];
  deniedDomains?: string[];
  allowedUnixSockets?: string[];
  allowAllUnixSockets?: boolean;
  allowLocalBinding?: boolean;
  allowedMachServices?: string[];
  httpProxyPort?: number;
  socksProxyPort?: number;
}

export interface SandboxCommandPolicy {
  excludedFromSandbox?: string[];
  allowUnsandboxed?: boolean;
}

export interface SandboxCredentialsPolicy {
  deniedFiles?: string[];
  deniedEnv?: string[];
  maskedEnv?: string[];
}

export interface SandboxPlatformPolicy {
  allowAppleEvents?: boolean;
  weakerNestedIsolation?: boolean;
  weakerNetworkIsolation?: boolean;
}

/** captain `api.NativeSandboxPolicy`: the sandbox vocabulary a permissions
 *  request is expressed in and a grant is answered in. A grant may carry only
 *  `filesystem.writableRoots`/`readableRoots` and `network`, and only entries the
 *  request listed. */
export interface NativeSandboxPolicy {
  required?: boolean;
  filesystem?: SandboxFilesystemPolicy;
  network?: SandboxNetworkPolicy;
  commands?: SandboxCommandPolicy;
  credentials?: SandboxCredentialsPolicy;
  platform?: SandboxPlatformPolicy;
}

/** captain `api.TerminalQuestion`. Answers are keyed by `id`, or by `text` when
 *  the provider gives questions no id (Claude). */
export interface ApprovalQuestion {
  id?: string;
  text: string;
  context?: string;
  options?: string[];
  optionDescriptions?: Record<string, string>;
  multiSelect?: boolean;
  secret?: boolean;
}

export type ElicitationMode = "form" | "url";

export interface ElicitationApproval {
  server: string;
  mode: ElicitationMode;
  message: string;
  /** The requested form: a flat object schema of primitive fields. */
  schema?: Record<string, unknown>;
  url?: string;
  elicitationId?: string;
}

/** The plan an agent asks to implement (captain `TerminalPlan`). */
export interface ApprovalPlan {
  content: string;
  path?: string;
}

export interface ApprovalRequest {
  tool: string;
  input?: Record<string, unknown>;
  toolUseId?: string;
  sessionId?: string;
  kind: ApprovalKind;
  turnId?: string;
  reason?: string;
  /** Approving exceeds the run's initial sandbox posture. */
  escalates?: boolean;
  /** Cancel (deny + interrupt the turn) is available. */
  interruptible?: boolean;
  supportedScopes?: ApprovalScope[];
  command?: CommandApproval;
  filesystem?: FilesystemApproval;
  network?: NetworkApproval;
  permissions?: NativeSandboxPolicy;
  questions?: ApprovalQuestion[];
  elicitation?: ElicitationApproval;
  /** Approving leaves plan mode; a deny keeps planning with the message as feedback. */
  plan?: ApprovalPlan;
}

/** The decision fields beyond allow/message that a typed approval can carry. */
export interface ApprovalDecisionFields {
  /** Question answers, keyed by question id (or text). */
  answers?: Record<string, string | string[]>;
  /** Deny and interrupt the turn. Only valid on an `interruptible` request. */
  interrupt?: boolean;
  /** Widen an approval beyond this request; only a scope in `supportedScopes`. */
  scope?: Exclude<ApprovalScope, "request">;
  /** The approved subset of a `permissions` request. */
  grants?: NativeSandboxPolicy;
  /** Accepted form-mode elicitation content. */
  content?: Record<string, unknown>;
}

/** Kinds whose body the viewer draws itself instead of the generic tool row;
 *  `tool` and `question` keep their existing rows and only gain controls. */
const OWN_BODY_KINDS: ReadonlySet<ApprovalKind> = new Set([
  "command",
  "filesystem",
  "network",
  "permissions",
  "elicitation",
  "plan",
]);

export function hasApprovalBody(
  request: ApprovalRequest | undefined,
): request is ApprovalRequest {
  return request !== undefined && OWN_BODY_KINDS.has(request.kind);
}

/** One selectable entry of a permissions request. */
export interface GrantEntry {
  key: string;
  label: string;
  /** Adds this entry to a grant under construction. */
  apply: (grant: NativeSandboxPolicy) => void;
}

/** Lists exactly what a permissions request asks for, one entry per grantable
 *  item. Only the fields captain accepts back in a grant are listed. */
export function grantEntries(policy: NativeSandboxPolicy): GrantEntry[] {
  const entries: GrantEntry[] = [];
  for (const root of policy.filesystem?.writableRoots ?? []) {
    entries.push({
      key: `write:${root}`,
      label: `Write ${root}`,
      apply: (grant) => {
        const filesystem = (grant.filesystem ??= {});
        (filesystem.writableRoots ??= []).push(root);
      },
    });
  }
  for (const root of policy.filesystem?.readableRoots ?? []) {
    entries.push({
      key: `read:${root}`,
      label: `Read ${root}`,
      apply: (grant) => {
        const filesystem = (grant.filesystem ??= {});
        (filesystem.readableRoots ??= []).push(root);
      },
    });
  }
  const access = policy.network?.access;
  if (access) {
    entries.push({
      key: "network:access",
      label: `Network access: ${access}`,
      apply: (grant) => {
        (grant.network ??= {}).access = access;
      },
    });
  }
  for (const domain of policy.network?.allowedDomains ?? []) {
    entries.push({
      key: `domain:${domain}`,
      label: `Network domain ${domain}`,
      apply: (grant) => {
        const network = (grant.network ??= {});
        (network.allowedDomains ??= []).push(domain);
      },
    });
  }
  return entries;
}

/** Builds the grant for the selected entry keys. */
export function grantFromSelection(
  entries: readonly GrantEntry[],
  selected: ReadonlySet<string>,
): NativeSandboxPolicy {
  const grant: NativeSandboxPolicy = {};
  for (const entry of entries) {
    if (selected.has(entry.key)) entry.apply(grant);
  }
  return grant;
}

/** The scopes a host may offer beyond a single request. */
export function offeredScopes(
  request: ApprovalRequest | undefined,
): Exclude<ApprovalScope, "request">[] {
  return (request?.supportedScopes ?? []).filter(
    (scope): scope is Exclude<ApprovalScope, "request"> => scope !== "request",
  );
}
