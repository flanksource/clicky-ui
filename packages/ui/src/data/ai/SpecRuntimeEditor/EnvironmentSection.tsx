import { SecretKeySelector } from "../../../components/SecretKeySelector";
import { Icon } from "../../Icon";
import { UiAdd, UiBraces, UiFileText, UiKey, UiTrash } from "../../../icons";
import type {
  AISpecRuntimeEnvVar,
  AISpecRuntimeValue,
} from "../SpecRuntimeEditor.model";
import { envVarFromSecretValue, secretValueFromEnvVar } from "./env-model";
import { ListField, SpecButton, SpecInput } from "./fields";
import { withSetup } from "./update";
import type { SpecRuntimeSecretSelectorConfig } from "./types";
import { IconButton } from "../../../components";

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
    <EnvVarRows
      value={value.setup?.envVars}
      onChange={(envVars) => onChange(withSetup(value, { envVars }))}
      secretSelector={secretSelector}
    />
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
  const rows = value && value.length > 0 ? value : [{ name: "", value: "" }];
  const updateRow = (index: number, patch: AISpecRuntimeEnvVar) => {
    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index ? { ...row, ...patch } : row,
      ),
    );
  };
  return (
    <div className="space-y-density-2">
      <div className="flex items-center justify-between gap-density-2">
        <div className="text-xs font-medium text-muted-foreground">
          Environment variables
        </div>
        <SpecButton
          onClick={() => onChange([...rows, { name: "", value: "" }])}
        >
          <Icon icon={UiAdd} className="size-3.5" />
          Add
        </SpecButton>
      </div>
      <div className="overflow-hidden rounded-md border border-border">
        <div className="grid grid-cols-[minmax(6rem,1fr)_minmax(0,1fr)_auto] gap-density-2 border-b border-border bg-muted/40 px-density-2 py-density-1 text-[10px] font-semibold uppercase text-muted-foreground md:grid-cols-[minmax(8rem,12rem)_minmax(0,1fr)_auto]">
          <span>Name</span>
          <span>Value</span>
          <span className="sr-only">Actions</span>
        </div>
        <div className="divide-y divide-border">
          {rows.map((row, index) => (
            <div
              key={index}
              className="grid gap-density-2 px-density-1 py-density-1 md:grid-cols-[minmax(8rem,12rem)_minmax(0,1fr)_auto]"
            >
              <SpecInput
                value={row.name}
                onChange={(name) => updateRow(index, { name })}
                ariaLabel="Environment variable name"
                icon={UiBraces}
                mono
              />
              <div className="min-w-0">
                {secretSelector ? (
                  <SecretKeySelector
                    value={secretValueFromEnvVar(row)}
                    onChange={(next) =>
                      onChange(
                        rows.map((current, rowIndex) =>
                          rowIndex === index
                            ? envVarFromSecretValue(current.name ?? "", next)
                            : current,
                        ),
                      )
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
                      updateRow(index, { value: next, valueFrom: "" })
                    }
                    placeholder="secret://name/key"
                    ariaLabel="Environment variable value"
                    icon={UiKey}
                    mono
                  />
                )}
              </div>
              <div className="flex items-center">
                <IconButton
                  icon={UiTrash}
                  label="Remove"
                  onClick={() =>
                    onChange(rows.filter((_, rowIndex) => rowIndex !== index))
                  }
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
