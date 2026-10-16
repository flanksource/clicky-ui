import type { FormActionsRenderer } from "../rpc/SchemaActionForm";
import { ConnectionTestButton } from "./connectionTestButton";

/**
 * Builds the form-footer renderer that adds a "Test" split-button (with a
 * "Resolve values" dropdown option) to the connection create/edit form. Test
 * probes the resolved URL's reachability; Resolve hydrates the draft (expanding
 * secret:// and svc:// / ip:// / proxy:// / host:// workload URLs) and shows the
 * resolved values with secrets masked. Both POST the live form value to
 * `{apiBase}/connection/{test|resolve}`, so they work before the connection is
 * saved. Forms of other entities get no extra actions, so the renderer can be
 * handed to an EntityExplorerApp that hosts every entity.
 */
export function createConnectionFormActions({
  apiBase,
}: {
  apiBase: string;
}): FormActionsRenderer {
  return ({ value, action, canSubmit }) =>
    action.path.includes("/connection") ? (
      <ConnectionTestButton apiBase={apiBase} value={value} canSubmit={canSubmit} />
    ) : null;
}
