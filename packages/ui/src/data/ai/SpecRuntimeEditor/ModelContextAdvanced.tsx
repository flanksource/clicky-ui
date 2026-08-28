import type { AISpecRuntimeValue } from "../SpecRuntimeEditor.model";
import {
  SUPPORT_ALL_RUNTIME_FIELDS,
  type RuntimeFieldSupport,
} from "../../runtime/runtime-field-support";
import { CheckboxField } from "./fields";
import { PermissionPolicyList } from "./PermissionPolicyList";
import type {
  PermissionDomain,
  PermissionListEntry,
  PermissionListMode,
} from "./permissions-model";
import { withMemory } from "./update";

const SKILL_DOMAINS: readonly PermissionDomain[] = ["skills"];

export function ModelContextAdvanced({
  value,
  onChange,
  entries,
  onApplyEntries,
  onAddEntry,
  showSkills = true,
  supports = SUPPORT_ALL_RUNTIME_FIELDS,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  entries: PermissionListEntry[];
  onApplyEntries: (
    entries: PermissionListEntry[],
    mode: PermissionListMode,
  ) => void;
  onAddEntry: (domain: PermissionDomain, id: string) => void;
  showSkills?: boolean | undefined;
  supports?: RuntimeFieldSupport | undefined;
}) {
  const memorySupport = {
    skipProject: supports("memory.skipProject"),
    skipUser: supports("memory.skipUser"),
    skipHooks: supports("memory.skipHooks"),
    skipMemory: supports("memory.skipMemory"),
    skipSkills: supports("memory.skipSkills"),
    bare: supports("memory.bare"),
  };
  const hasMemory = Object.values(memorySupport).some(Boolean);
  const hasSkills = showSkills && supports("permissions.skills");

  return (
    <div className="grid gap-density-3">
      {hasMemory && (
        <div className="grid gap-density-2">
          <div className="text-xs font-semibold text-muted-foreground">
            Memory
          </div>
          <div className="grid gap-density-2 sm:grid-cols-2 md:grid-cols-3">
            {memorySupport.skipProject && (
              <CheckboxField
                label="Skip project"
                checked={value.memory?.skipProject}
                onChange={(skipProject) =>
                  onChange(withMemory(value, { skipProject }))
                }
              />
            )}
            {memorySupport.skipUser && (
              <CheckboxField
                label="Skip user"
                checked={value.memory?.skipUser}
                onChange={(skipUser) =>
                  onChange(withMemory(value, { skipUser }))
                }
              />
            )}
            {memorySupport.skipHooks && (
              <CheckboxField
                label="Skip hooks"
                checked={value.memory?.skipHooks}
                onChange={(skipHooks) =>
                  onChange(withMemory(value, { skipHooks }))
                }
              />
            )}
            {memorySupport.skipMemory && (
              <CheckboxField
                label="Skip memory"
                checked={value.memory?.skipMemory}
                onChange={(skipMemory) =>
                  onChange(withMemory(value, { skipMemory }))
                }
              />
            )}
            {memorySupport.skipSkills && (
              <CheckboxField
                label="Skip skills"
                checked={value.memory?.skipSkills}
                onChange={(skipSkills) =>
                  onChange(withMemory(value, { skipSkills }))
                }
              />
            )}
            {memorySupport.bare && (
              <CheckboxField
                label="Bare"
                checked={value.memory?.bare}
                onChange={(bare) => onChange(withMemory(value, { bare }))}
              />
            )}
          </div>
        </div>
      )}
      {hasSkills && (
        <div className="grid gap-density-2">
          <div className="text-xs font-semibold text-muted-foreground">
            Skills
          </div>
          <PermissionPolicyList
            entries={entries}
            supportedDomains={SKILL_DOMAINS}
            emptyLabel="No model skills configured"
            onApply={onApplyEntries}
            onAdd={onAddEntry}
          />
        </div>
      )}
    </div>
  );
}
