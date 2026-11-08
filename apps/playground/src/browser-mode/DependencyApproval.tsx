import { Button, Modal } from "@flanksource/clicky-ui";
import { approveDependencies, type DependencyScope } from "./dependency-defaults";
import { SCOPE_LABELS } from "./problems";

/**
 * The `ask` prompt: the page declares packages the policy has not allowed yet. Approvals are remembered in this
 * browser (for this page or every page); "Add to package.json" makes the package allowed for everyone.
 */
export function DependencyApproval({ slug, pending, onAddToPackageJson, onDeny }: { slug: string; pending: Array<{ name: string; scope: DependencyScope }>; onAddToPackageJson: (name: string) => void; onDeny: () => void }) {
  const allow = (names: string[], scope: "page" | "workspace") => approveDependencies({ names, scope, slug });
  const names = pending.map(item => item.name);
  return <Modal open title={`Allow ${names.length === 1 ? names[0] : `${names.length} packages`} for this page?`} subtitle={slug} size="lg" onClose={onDeny}>
    <div className="space-y-3 text-sm">
      <p>The dependency policy is <strong>ask</strong>. This page declares packages that package.json does not list and that you have not allowed yet. Approvals are stored in this browser.</p>
      <ul aria-label="Packages awaiting approval" className="divide-y divide-border rounded border border-border">
        {pending.map(item => <li key={item.name} className="flex flex-wrap items-center gap-2 px-3 py-2">
          <span className="mr-auto min-w-0"><code className="font-medium">{item.name}</code> <span className="text-muted-foreground">declared in {SCOPE_LABELS[item.scope]}</span></span>
          <Button size="sm" variant="outline" onClick={() => allow([item.name], "page")}>Allow for this page</Button>
          <Button size="sm" variant="outline" onClick={() => allow([item.name], "workspace")}>Allow for every page</Button>
          <Button size="sm" variant="ghost" onClick={() => onAddToPackageJson(item.name)}>Add to package.json…</Button>
        </li>)}
      </ul>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" onClick={onDeny}>Deny</Button>
        {names.length > 1 && <Button onClick={() => allow(names, "page")}>Allow all for this page</Button>}
      </div>
    </div>
  </Modal>;
}
