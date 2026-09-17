import { type AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import {
  SPEC_RUNTIME_FAMILIES,
  type RuntimeSpecSchema,
  type SpecRuntimeFamily,
} from "../../runtime/runtime-mode";
import { PermissionModeField } from "./PermissionModeField";
import {
  publishedPermissionModes,
  type PermissionDomain,
  type PermissionListEntry,
  type PermissionListMode,
} from "./permissions-model";
import { PermissionPolicyList } from "./PermissionPolicyList";
import {
  SUPPORT_ALL_RUNTIME_FIELDS,
  type RuntimeFieldSupport,
} from "../../runtime/runtime-field-support";

export function PermissionsSection({
  value,
  onChange,
  families = SPEC_RUNTIME_FAMILIES,
  schema,
  effectiveMode,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  families?: SpecRuntimeFamily[] | undefined;
  /** Runtime schema used to narrow the published `permissions.mode` enum. */
  schema?: RuntimeSpecSchema | undefined;
  effectiveMode?: string | undefined;
}) {
  return (
    <div className="grid gap-density-3">
      <PermissionModeField
        value={value}
        onChange={onChange}
        families={families}
        availableModes={publishedPermissionModes(schema)}
        effectiveMode={effectiveMode}
      />
    </div>
  );
}

export function PermissionsAdvanced({
  entries,
  onApplyEntries,
  onAddEntry,
  includeSkills = false,
  supports = SUPPORT_ALL_RUNTIME_FIELDS,
}: {
  entries: PermissionListEntry[];
  onApplyEntries: (
    entries: PermissionListEntry[],
    mode: PermissionListMode,
  ) => void;
  onAddEntry: (domain: PermissionDomain, id: string) => void;
  includeSkills?: boolean | undefined;
  supports?: RuntimeFieldSupport | undefined;
}) {
  const domains: PermissionDomain[] = ["tools", "mcp", "plugins"];
  if (includeSkills) domains.push("skills");
  const supportedDomains = domains.filter((domain) =>
    supports(`permissions.${domain}`),
  );
  return supportedDomains.length > 0 ? (
    <PermissionPolicyList
      entries={entries}
      supportedDomains={supportedDomains}
      emptyLabel={
        includeSkills
          ? "No tools, MCP servers, plugins, or skills configured"
          : "No tools, MCP servers, or plugins configured"
      }
      onApply={onApplyEntries}
      onAdd={onAddEntry}
    />
  ) : null;
}
