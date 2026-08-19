import type {
  AISpecRuntimeMemory,
  AISpecRuntimePermissions,
  AISpecRuntimePrompt,
  AISpecRuntimeSandbox,
  AISpecRuntimeSandboxPolicy,
  AISpecRuntimeSetup,
  AISpecRuntimeValue,
  SpecCheckoutMode,
  SpecCommitPhase,
  SpecStashMode,
  SpecWorktreeMode,
} from "../SpecRuntimeEditor.model";

type SpecCheckout = NonNullable<AISpecRuntimeSetup["checkout"]>;
type SpecWorktree = NonNullable<SpecCheckout["worktree"]>;
type SpecDirty = NonNullable<SpecCheckout["dirty"]>;
type SpecWorkflow = NonNullable<AISpecRuntimeValue["workflow"]>;
type SpecCommit = NonNullable<SpecWorkflow["commits"]>[number];
type SpecBudget = NonNullable<AISpecRuntimeValue["budget"]>;

export function withRoot(
  value: AISpecRuntimeValue,
  patch: Partial<AISpecRuntimeValue>,
): AISpecRuntimeValue {
  return { ...value, ...patch };
}

// Sets a top-level scalar, deleting the key entirely when cleared so the
// compacted payload omits it instead of carrying an empty string/undefined.
export function withOptionalRoot(
  value: AISpecRuntimeValue,
  key: keyof AISpecRuntimeValue,
  next: unknown,
): AISpecRuntimeValue {
  const updated = { ...value } as Record<string, unknown>;
  if (next === undefined || next === "") {
    delete updated[key];
  } else {
    updated[key] = next;
  }
  return updated as AISpecRuntimeValue;
}

export function withPrompt(
  value: AISpecRuntimeValue,
  patch: Partial<AISpecRuntimePrompt>,
): AISpecRuntimeValue {
  return withRoot(value, { prompt: { ...value.prompt, ...patch } });
}

export function withBudget(
  value: AISpecRuntimeValue,
  budget: SpecBudget,
): AISpecRuntimeValue {
  return withRoot(value, { budget });
}

export function withBudgetValue(
  value: AISpecRuntimeValue,
  key: keyof SpecBudget,
  next: number | string | undefined,
): AISpecRuntimeValue {
  const budget = { ...value.budget } as Record<string, unknown>;
  if (next === undefined || next === "") {
    delete budget[key];
  } else {
    budget[key] = next;
  }
  return withRoot(value, { budget: budget as SpecBudget });
}

export function withMemory(
  value: AISpecRuntimeValue,
  patch: Partial<AISpecRuntimeMemory>,
): AISpecRuntimeValue {
  return withRoot(value, { memory: { ...value.memory, ...patch } });
}

export function withPermissions(
  value: AISpecRuntimeValue,
  patch: Partial<AISpecRuntimePermissions>,
): AISpecRuntimeValue {
  return withRoot(value, { permissions: { ...value.permissions, ...patch } });
}

/**
 * Reads the sandbox ref in object form regardless of which form it is stored
 * in, so the section's controls do not each have to re-narrow the union.
 */
export function sandboxRef(value: AISpecRuntimeValue): AISpecRuntimeSandbox {
  if (typeof value.sandbox === "string") return { backend: value.sandbox };
  return value.sandbox ?? {};
}

/**
 * Patches the sandbox ref. Clearing the backend drops the whole ref: `sandbox:
 * ""` is present-but-selecting-nothing, which api.SandboxRef.Validate rejects,
 * and agent/policy overrides have nothing to apply to without one.
 *
 * The stored shape stays the object form while editing; compactAISpecRuntime
 * collapses it back to a scalar on save when only a backend is set.
 */
export function withSandbox(
  value: AISpecRuntimeValue,
  patch: Partial<AISpecRuntimeSandbox>,
): AISpecRuntimeValue {
  const next: AISpecRuntimeSandbox = { ...sandboxRef(value), ...patch };
  if (!next.backend?.trim()) return withOptionalRoot(value, "sandbox", undefined);
  return withRoot(value, { sandbox: next });
}

/**
 * Selects the adapter, discarding any previous overrides. Switching backends
 * must not carry an agent pin or a path policy across: an agent enrolled on one
 * git-agent backend does not exist on another, and a stale pin would fail at
 * dispatch rather than at the click that caused it.
 */
export function withSandboxBackend(
  value: AISpecRuntimeValue,
  backend: string,
): AISpecRuntimeValue {
  if (!backend.trim()) return withOptionalRoot(value, "sandbox", undefined);
  return withRoot(value, { sandbox: { backend } });
}

export function withSandboxPolicy(
  value: AISpecRuntimeValue,
  patch: Partial<AISpecRuntimeSandboxPolicy>,
): AISpecRuntimeValue {
  return withSandbox(value, {
    policy: { ...sandboxRef(value).policy, ...patch },
  });
}

export function withSetup(
  value: AISpecRuntimeValue,
  patch: Partial<AISpecRuntimeSetup>,
): AISpecRuntimeValue {
  return withRoot(value, { setup: { ...value.setup, ...patch } });
}

export function withCheckout(
  value: AISpecRuntimeValue,
  patch: SpecCheckout,
): AISpecRuntimeValue {
  return withSetup(value, {
    checkout: { ...value.setup?.checkout, ...patch },
  });
}

export function withWorktree(
  value: AISpecRuntimeValue,
  patch: SpecWorktree,
): AISpecRuntimeValue {
  return withCheckout(value, {
    worktree: { ...value.setup?.checkout?.worktree, ...patch },
  });
}

export function withDirty(
  value: AISpecRuntimeValue,
  patch: SpecDirty,
): AISpecRuntimeValue {
  return withCheckout(value, {
    dirty: { ...value.setup?.checkout?.dirty, ...patch },
  });
}

export function withVerify(
  value: AISpecRuntimeValue,
  patch: NonNullable<SpecWorkflow["verify"]>,
): AISpecRuntimeValue {
  return withRoot(value, {
    workflow: {
      ...value.workflow,
      verify: { ...value.workflow?.verify, ...patch },
    },
  });
}

// The editor drives a single commit policy. A spec authored by hand may declare
// several stanzas; the ones past the first are carried through untouched rather
// than collapsed away by an edit to a field the editor does surface.
export function withCommit(
  value: AISpecRuntimeValue,
  patch: Partial<SpecCommit>,
): AISpecRuntimeValue {
  const [first, ...rest] = value.workflow?.commits ?? [];
  return withRoot(value, {
    workflow: { ...value.workflow, commits: [{ ...first, ...patch }, ...rest] },
  });
}

// "Never" drops every stanza rather than flagging one off: an absent list is how
// the spec says "commit nothing", and a surviving {dryRun: true} would leave the
// section reading as configured.
export function withCommitPhase(
  value: AISpecRuntimeValue,
  phase: SpecCommitPhase | "none",
): AISpecRuntimeValue {
  if (phase === "none") {
    return withRoot(value, { workflow: { ...value.workflow, commits: [] } });
  }
  return withCommit(value, { on: phase });
}

// A stanza with no explicit phase commits at the end of the run, matching
// api.Commit.Phase()'s default.
export function commitPhase(
  value: AISpecRuntimeValue,
): SpecCommitPhase | "none" {
  const commits = value.workflow?.commits;
  if (!commits?.length) return "none";
  const on = commits[0]?.on;
  return on === "turn" || on === "agent" ? on : "run";
}

// Mode switches clear the fields that no longer apply, so stale values from a
// previous mode never leak into the compacted payload.
export function withCheckoutMode(
  value: AISpecRuntimeValue,
  mode: SpecCheckoutMode,
): AISpecRuntimeValue {
  if (mode === "none") {
    return withCheckout(value, {
      mode,
      url: "",
      path: "",
      connection: "",
      ref: "",
      depth: 0,
    });
  }
  if (mode === "local") return withCheckout(value, { mode, url: "", connection: "" });
  return withCheckout(value, { mode, path: "" });
}

export function withWorktreeMode(
  value: AISpecRuntimeValue,
  mode: SpecWorktreeMode,
): AISpecRuntimeValue {
  if (mode === "none") {
    return withWorktree(value, {
      mode,
      prefix: "",
      base: "",
      path: "",
      keep: false,
    });
  }
  if (mode === "existing") {
    return withWorktree(value, { mode, prefix: "", base: "", keep: false });
  }
  return withWorktree(value, { mode });
}

export function withStashMode(
  value: AISpecRuntimeValue,
  stash: SpecStashMode,
): AISpecRuntimeValue {
  return withDirty(value, stash === "none" ? { stash, since: "" } : { stash });
}

export function checkoutMode(value: AISpecRuntimeValue): SpecCheckoutMode {
  const checkout = value.setup?.checkout;
  if (checkout?.mode === "remote") return "remote";
  if (checkout?.mode === "local" || checkout?.path) return "local";
  return "none";
}

export function worktreeMode(value: AISpecRuntimeValue): SpecWorktreeMode {
  const mode = value.setup?.checkout?.worktree?.mode;
  if (mode === "existing") return "existing";
  if (mode === "new") return "new";
  return "none";
}

export function stashMode(value: AISpecRuntimeValue): SpecStashMode {
  const stash = value.setup?.checkout?.dirty?.stash;
  if (
    stash === "untracked" ||
    stash === "unstaged" ||
    stash === "staged" ||
    stash === "all"
  ) {
    return stash;
  }
  return "none";
}

export function parseOptionalNumber(
  value: string,
  integer = false,
): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return undefined;
  return integer ? Math.max(0, Math.trunc(parsed)) : parsed;
}
