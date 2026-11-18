import { useId, useState } from "react";
import { Button } from "../../components/button";
import { Field } from "../../components/Field";
import { InputField } from "../../components/InputField";
import type { JsonSchemaObject } from "../../components/json-schema-form-types";
import { Select } from "../../components/select";
import type { ChatModel } from "../../data/chat/types";
import { PromptRunEditor } from "../../data/ai/PromptRunEditor";
import type { AIPromptRunSpec, AIPromptRunValue } from "../../data/ai/PromptRunEditor/model";
import type { RuntimePreset } from "../../data/ai/runtime-profile";
import type { SpecRuntimeFamily } from "../../data/runtime/runtime-mode";
import { draftOfAgent, runSettingsPatch, type RunSettingsDraft } from "./comment-agent-model";
import type { CommentAgent, CommentAgentPatch } from "./gavel-delivery";

/** A captain prompt the comment agent can run. */
export type CommentAgentPromptOption = {
  id: string;
  label: string;
  description?: string;
  /** The form its variables are edited with; without it they are edited as raw JSON. */
  variablesSchema?: JsonSchemaObject;
};

/**
 * What the runtime and model controls choose from: the host's model catalog,
 * the agent runtime families it offers, and the presets a run can layer.
 */
export type CommentAgentRuntimeOptions = {
  models: ChatModel[];
  families: SpecRuntimeFamily[];
  presets?: RuntimePreset[];
};

type RunSettingsProps = {
  /** The agent as resolved now; the form starts from it and saves only what it changes. */
  agent: CommentAgent;
  prompts?: CommentAgentPromptOption[] | undefined;
  runtimes?: CommentAgentRuntimeOptions | undefined;
  busy: boolean;
  onSave: (patch: CommentAgentPatch) => void;
};

/** The prompt, runtime, presets, variables and instructions of the comment agent, edited as one form. Mount with a `key` per resolved agent. */
export function CommentAgentRunSettings({ agent, prompts, runtimes, busy, onSave }: RunSettingsProps) {
  const id = useId();
  const [draft, setDraft] = useState<RunSettingsDraft>(() => draftOfAgent(agent));
  const [variablesValid, setVariablesValid] = useState(true);
  const patch = runSettingsPatch(agent, draft);
  const dirty = Object.keys(patch).length > 0;
  const prompt = prompts?.find((option) => option.id === draft.prompt);
  const promptOptions = prompts && [...prompts.map((option) => ({ value: option.id, label: option.label })), ...(prompt ? [] : [{ value: draft.prompt, label: `${draft.prompt} (not in the catalog)` }])];

  const changeRun = (next: AIPromptRunValue) => setDraft({ ...draft, spec: next.spec ?? {}, presets: next.presets ?? [], variables: next.variables ?? {} });
  return (
    <div className="space-y-3">
      {promptOptions && (
        <Field label="Prompt" htmlFor={`${id}-prompt`} helper={prompt?.description ?? "The captain prompt that works each new thread."}>
          <Select id={`${id}-prompt`} value={draft.prompt} options={promptOptions} onChange={(event) => setDraft({ ...draft, prompt: event.currentTarget.value, variables: {} })} />
        </Field>
      )}
      {runtimes && (
        <PromptRunEditor
          key={draft.prompt}
          value={{ spec: draft.spec as AIPromptRunSpec, presets: draft.presets, variables: draft.variables }}
          onChange={changeRun}
          models={runtimes.models}
          families={runtimes.families}
          presets={runtimes.presets}
          variablesSchema={prompt?.variablesSchema}
          onVariablesValidityChange={setVariablesValid}
        />
      )}
      <Field label="Instructions" htmlFor={`${id}-instructions`} helper="Appended to every thread the agent is given.">
        <InputField as="textarea" id={`${id}-instructions`} rows={3} value={draft.instructions} onChange={(instructions) => setDraft({ ...draft, instructions })} />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" disabled={busy || !dirty} onClick={() => setDraft(draftOfAgent(agent))}>
          Reset
        </Button>
        <Button size="sm" disabled={busy || !dirty || !variablesValid} onClick={() => onSave(patch)}>
          Save run settings
        </Button>
      </div>
    </div>
  );
}
