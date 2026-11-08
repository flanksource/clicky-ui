import type { DependencyPolicy, RuntimeError } from "@flanksource/page-runtime/schema";
import type { CompatibilityIssue } from "./project";
import type { DependencyScope } from "./dependency-defaults";

export const importPackage = (specifier: string) => specifier.startsWith("@") ? specifier.split("/").slice(0, 2).join("/") : specifier.split("/")[0]!;
const SINGLETONS = ["react", "react-dom", "scheduler", "jotai", "@tanstack/react-query"];
export type RuntimeProblem = { id: string; message: string; kind: string; package: string | null; locations: CompatibilityIssue[]; fix: string };

export const SCOPE_LABELS: Record<DependencyScope, string> = { page: "the page header", "browser-page": "this page's browser override", "browser-workspace": "the browser workspace override", workspace: "package.json", profile: ".playground/runtime-profile.json", "browser-default": "the browser runtime default" };

export function groupRuntimeProblems(issues: readonly CompatibilityIssue[]): RuntimeProblem[] {
  const groups = new Map<string, RuntimeProblem>();
  for (const issue of issues) {
    const policy = issue.class === "policy" && issue.specifier ? issue.specifier : null;
    const pkg = policy ?? (issue.class === "external-package" && issue.specifier ? importPackage(issue.specifier) : null);
    const kind = issue.class ?? "runtime";
    const id = `${kind}:${pkg ?? issue.reason}`;
    const group = groups.get(id);
    if (group) group.locations.push(issue);
    else groups.set(id, { id, kind, package: pkg && !SINGLETONS.includes(pkg) ? pkg : null, message: policy ? issue.reason : pkg ? `Missing runtime import: ${pkg}` : issue.reason, locations: [issue], fix: pkg && SINGLETONS.includes(pkg) ? "This export is outside the shared singleton runtime set. Use a supported browser export or update the shared runtime configuration." : issue.fix });
  }
  return [...groups.values()];
}

/** One blocking problem per declared package the dependency policy rejects. */
export function policyIssues(options: { pending: Array<{ name: string; scope: DependencyScope }>; policy: DependencyPolicy; file: string }): CompatibilityIssue[] {
  return options.pending.map(({ name, scope }) => ({ blocking: true, class: "policy", specifier: name, file: options.file, line: 1,
    reason: `${name}, declared in ${SCOPE_LABELS[scope]}, is not allowed by dependency policy ${options.policy}`,
    fix: options.policy === "ask" ? "Allow it for this page or the workspace, add it to package.json, or remove the declaration." : "Add it to package.json (dependencies or pageRuntime.dependencies), or remove the declaration." }));
}

export function runtimeIssue(error: unknown, file: string): CompatibilityIssue {
  const detail = error && typeof error === "object" && "pageRuntime" in error ? error.pageRuntime as RuntimeError : null;
  return { blocking: true, class: detail?.phase ?? "resolve", reason: detail?.message ?? (error instanceof Error ? error.message : String(error)), file: detail?.file ?? file, line: detail?.line ?? 1, ...(detail?.column ? { column: detail.column } : {}), fix: "Inspect runtime activity and configuration, correct the reported cause, then recheck." };
}
