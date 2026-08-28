import { useState } from "react";
import { Button } from "../../../components/button";
import { UiPlay } from "../../../icons";
import { CodeBlock } from "../../CodeBlock";
import {
  errorMessage,
  parseVariables,
  seedVariables,
} from "./prompt-page-model";
import type {
  PromptCatalogEntry,
  PromptRenderInput,
  PromptRenderResult,
} from "./types";

export type PromptPagePreviewProps = {
  entry: PromptCatalogEntry;
  render: (input: PromptRenderInput) => Promise<PromptRenderResult>;
  // draftRaw is the unsaved document to render instead of the saved one;
  // undefined renders what is saved.
  draftRaw?: string | undefined;
};

// PromptPagePreview renders the template with caller-supplied variables and no
// model call, so an edit can be checked against real inputs before it is
// trusted — the unsaved draft when there is one.
export function PromptPagePreview({
  entry,
  render,
  draftRaw,
}: PromptPagePreviewProps) {
  const [variablesText, setVariablesText] = useState(() =>
    seedVariables(entry),
  );
  const [result, setResult] = useState<PromptRenderResult | null>(null);
  const [error, setError] = useState("");
  const [rendering, setRendering] = useState(false);

  async function run() {
    const parsed = parseVariables(variablesText);
    if ("error" in parsed) {
      setError(`variables: ${parsed.error}`);
      return;
    }
    setRendering(true);
    setError("");
    try {
      setResult(await render({ raw: draftRaw, variables: parsed.variables }));
    } catch (cause) {
      setError(errorMessage(cause, "render failed"));
    } finally {
      setRendering(false);
    }
  }

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <label className="flex flex-col gap-1 text-xs font-medium text-muted-foreground">
        Variables (JSON)
        <textarea
          aria-label="Preview variables"
          className="min-h-[8rem] resize-y rounded-md border border-border bg-background p-2 font-mono text-xs leading-relaxed text-foreground"
          value={variablesText}
          spellCheck={false}
          onChange={(event) => setVariablesText(event.currentTarget.value)}
        />
      </label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          size="sm"
          onClick={run}
          disabled={rendering}
          loading={rendering}
        >
          <UiPlay className="mr-1" />
          Render
        </Button>
        <span className="text-xs text-muted-foreground">
          {draftRaw !== undefined
            ? "Renders the unsaved draft."
            : "Renders the saved document."}
        </span>
        {error ? (
          <span role="alert" className="text-xs text-destructive">
            {error}
          </span>
        ) : null}
      </div>
      {result ? (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto">
          {result.model ? (
            <p className="text-xs text-muted-foreground">
              model <span className="font-mono">{result.model}</span>
              {result.backend ? (
                <>
                  {" "}
                  · backend <span className="font-mono">{result.backend}</span>
                </>
              ) : null}
            </p>
          ) : null}
          {result.system ? (
            <section aria-label="Rendered system prompt">
              <h3 className="mb-1 text-xs font-medium text-muted-foreground">
                System
              </h3>
              <CodeBlock language="markdown" source={result.system} copyable />
            </section>
          ) : null}
          <section aria-label="Rendered user prompt">
            <h3 className="mb-1 text-xs font-medium text-muted-foreground">
              User
            </h3>
            <CodeBlock language="markdown" source={result.user} copyable />
          </section>
        </div>
      ) : null}
    </div>
  );
}
