import { SecretKeySelector } from "../../../components/SecretKeySelector";
import { AccordionList } from "../../../components/AccordionList";
import { UiBraces, UiFileText, UiKey } from "../../../icons";
import type {
  AISpecRuntimeEnvVar,
  AISpecRuntimeValue,
} from "../SpecRuntimeEditor.model";
import { envVarFromSecretValue, secretValueFromEnvVar } from "./env-model";
import { ListField, SpecField, SpecInput } from "./fields";
import { withConnections, withSetup } from "./update";
import type { SpecRuntimeSecretSelectorConfig } from "./types";

export function EnvironmentSection({
  value,
  onChange,
  secretSelector,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
}) {
  return (
    <div className="grid gap-density-3">
      <SpecField label="Connection config item">
        <SpecInput
          ariaLabel="Connection config item"
          value={value.setup?.connections?.fromConfigItem}
          onChange={(fromConfigItem) =>
            onChange(withConnections(value, { fromConfigItem }))
          }
          icon={UiKey}
          mono
        />
      </SpecField>
      <EnvVarRows
        value={value.setup?.envVars}
        onChange={(envVars) => onChange(withSetup(value, { envVars }))}
        secretSelector={secretSelector}
      />
    </div>
  );
}

export function EnvironmentAdvanced({
  value,
  onChange,
}: {
  value: AISpecRuntimeValue;
  onChange: (value: AISpecRuntimeValue) => void;
}) {
  return (
    <ListField
      label="Dotenv files"
      value={value.setup?.dotenv}
      onChange={(dotenv) => onChange(withSetup(value, { dotenv }))}
      placeholder=".env"
      icon={UiFileText}
    />
  );
}

function EnvVarRows({
  value,
  onChange,
  secretSelector,
}: {
  value?: AISpecRuntimeEnvVar[] | undefined;
  onChange: (value: AISpecRuntimeEnvVar[]) => void;
  secretSelector?: SpecRuntimeSecretSelectorConfig | undefined;
}) {
  const rows = value ?? [];
  return (
    <div className="space-y-density-2">
      <div className="text-xs font-medium text-muted-foreground">
        Environment variables
      </div>
      <AccordionList
        items={rows}
        onChange={onChange}
        allowRemove
        onCreate={() => ({ name: "", value: "" })}
        addLabel="Add environment variable"
        idPrefix="environment-variable"
        itemLabel={({ item, index }) =>
          item.name?.trim() || `Environment variable ${index + 1}`
        }
        renderHeader={({ item }) => (
          <div className="flex min-w-0 flex-1 items-center gap-density-2">
            <span className="min-w-0 flex-1 truncate font-mono text-xs font-medium">
              {item.name?.trim() || "New variable"}
            </span>
            <span className="max-w-48 truncate font-mono text-xs text-muted-foreground">
              {environmentValueSummary(item)}
            </span>
          </div>
        )}
        renderBody={({ item: row, onChange: updateRow }) => (
          <div className="grid gap-density-2 md:grid-cols-[minmax(8rem,12rem)_minmax(0,1fr)]">
            <SpecInput
              value={row.name}
              onChange={(name) => updateRow({ ...row, name })}
              ariaLabel="Environment variable name"
              icon={UiBraces}
              mono
            />
            <div className="min-w-0">
              {secretSelector ? (
                <SecretKeySelector
                  value={secretValueFromEnvVar(row)}
                  onChange={(next) =>
                    updateRow(envVarFromSecretValue(row.name ?? "", next))
                  }
                  loadResources={secretSelector.loadResources}
                  loadKeyPreview={secretSelector.loadKeyPreview}
                  {...(secretSelector.allowLiteral !== undefined
                    ? { allowLiteral: secretSelector.allowLiteral }
                    : {})}
                  {...(secretSelector.strict !== undefined
                    ? { strict: secretSelector.strict }
                    : {})}
                  className="min-w-0 flex-wrap text-xs"
                />
              ) : (
                <SpecInput
                  value={
                    typeof row.valueFrom === "string"
                      ? row.valueFrom
                      : row.value
                  }
                  onChange={(next) =>
                    updateRow({ ...row, value: next, valueFrom: "" })
                  }
                  placeholder="secret://name/key"
                  ariaLabel="Environment variable value"
                  icon={UiKey}
                  mono
                />
              )}
            </div>
          </div>
        )}
      />
    </div>
  );
}

function environmentValueSummary(value: AISpecRuntimeEnvVar): string {
  if (value.value !== undefined) return value.value || "Empty value";
  if (typeof value.valueFrom === "string") {
    return value.valueFrom.trim() || "No value";
  }
  const reference =
    value.valueFrom?.secretKeyRef ?? value.valueFrom?.configMapKeyRef;
  if (reference)
    return [reference.name, reference.key].filter(Boolean).join("/");
  return "No value";
}
