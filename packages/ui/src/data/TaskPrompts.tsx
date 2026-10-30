import { useState } from "react";
import { Button } from "../components/button";
import { answerPrompt, type PromptSnapshot } from "../hooks/use-prompts";
import { UiQuestion } from "../icons";
import { Icon } from "./Icon";
import { PromptDialog } from "./PromptDialog";

// TaskPrompts renders the questions a running task is blocked on (the Go side
// lists them on TaskSnapshot.prompts). A single-choice prompt with a few options
// is answered inline with one button per option; anything else opens the
// prompt's JSON Schema form in a PromptDialog.

const MAX_INLINE_OPTIONS = 4;

interface PromptOption {
  key: string;
  label: string;
}

// inlineOptions returns the options of a prompt whose schema is a single
// required enum field (clicky's SelectSchema), or null when it needs the form.
function inlineOptions(prompt: PromptSnapshot): { field: string; options: PromptOption[] } | null {
  const entries = Object.entries(prompt.schema.properties ?? {});
  if (entries.length !== 1) return null;
  const [field, property] = entries[0]!;
  const values = property.enum;
  if (property.type !== "string" || !values || values.length === 0 || values.length > MAX_INLINE_OPTIONS) return null;
  const labels = property["x-enum-labels"] ?? {};
  return {
    field,
    options: values.map((value) => ({ key: String(value), label: labels[String(value)] ?? String(value) })),
  };
}

export function TaskPrompts({ prompts, basePath }: { prompts: PromptSnapshot[]; basePath: string }) {
  return (
    <div className="mt-1 space-y-1" onClick={(event) => event.stopPropagation()}>
      {prompts.map((prompt) => (
        <TaskPrompt key={prompt.id} prompt={prompt} basePath={basePath} />
      ))}
    </div>
  );
}

function TaskPrompt({ prompt, basePath }: { prompt: PromptSnapshot; basePath: string }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const inline = inlineOptions(prompt);

  const choose = async (field: string, option: PromptOption) => {
    setBusy(option.key);
    setError("");
    try {
      await answerPrompt(basePath, prompt.id, { values: { [field]: option.key } });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2 py-1.5">
      <Icon icon={UiQuestion} className="shrink-0 text-amber-600 dark:text-amber-400" />
      <span className="min-w-0 flex-1 text-xs font-medium">{prompt.title}</span>
      <div className="flex shrink-0 flex-wrap items-center gap-1">
        {inline ? (
          inline.options.map((option, index) => (
            <Button
              key={option.key}
              type="button"
              size="sm"
              variant={index === 0 ? "default" : "outline"}
              loading={busy === option.key}
              disabled={busy !== null}
              onClick={() => void choose(inline.field, option)}
            >
              {option.label}
            </Button>
          ))
        ) : (
          <Button type="button" size="sm" aria-label={`Answer ${prompt.title}`} onClick={() => setFormOpen(true)}>
            Answer
          </Button>
        )}
      </div>
      {error && (
        <span role="alert" className="w-full text-xs text-red-600">
          {error}
        </span>
      )}
      {formOpen && (
        <PromptDialog prompt={prompt} basePath={basePath} open={true} onClose={() => setFormOpen(false)} />
      )}
    </div>
  );
}
