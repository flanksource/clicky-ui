import { lazy, Suspense, useState } from "react";
import {
  Button,
  ErrorWrapper,
  JsonSchemaForm,
  JsonView,
  SegmentedControl,
  type JsonSchemaObject,
} from "@flanksource/clicky-ui";
import type { MonacoValidationState } from "@flanksource/clicky-ui/monaco";
import { DemoSection } from "../Section";
import { LISTENER_EXAMPLES, type ListenerExample } from "./examples";
import { javascriptEvaluator, LISTENER_META_SCHEMA, parseSchemaText } from "./listener-editor";

// Lazy for the same reason ProfileEditor's raw tab is: the demo catalog is
// imported eagerly, and Monaco should load only when this demo is opened.
const MonacoSchemaEditor = lazy(() =>
  import("@flanksource/clicky-ui/monaco").then((module) => ({ default: module.MonacoSchemaEditor })),
);

const META_SCHEMA_URI = "clicky://kitchen-sink/json-schema-form-listeners.schema.json";

function schemaText(example: ListenerExample): string {
  return JSON.stringify(example.schema, null, 2);
}

// Example descriptions mark keywords with backticks; odd segments are code.
function withInlineCode(text: string) {
  return text.split("`").map((part, index) =>
    index % 2 === 1 ? (
      <code key={index} className="rounded bg-muted px-1 font-mono text-xs text-foreground">
        {part}
      </code>
    ) : (
      part
    ),
  );
}

export function JsonSchemaFormListenersDemo() {
  const [exampleId, setExampleId] = useState(LISTENER_EXAMPLES[0]!.id);
  const example = LISTENER_EXAMPLES.find((candidate) => candidate.id === exampleId) ?? LISTENER_EXAMPLES[0]!;
  const [text, setText] = useState(() => schemaText(example));
  // The form keeps rendering the last schema that parsed, so a half-typed edit
  // never blanks the preview.
  const [schema, setSchema] = useState<JsonSchemaObject>(example.schema);
  const [parseError, setParseError] = useState<string>();
  const [validation, setValidation] = useState<MonacoValidationState>({ status: "loading", errors: [] });
  const [value, setValue] = useState<Record<string, unknown>>(example.initialValue);

  const selectExample = (id: string) => {
    const next = LISTENER_EXAMPLES.find((candidate) => candidate.id === id);
    if (!next) throw new Error(`unknown listener example "${id}"`);
    setExampleId(next.id);
    setText(schemaText(next));
    setSchema(next.schema);
    setParseError(undefined);
    setValue(next.initialValue);
  };

  const editSchema = (nextText: string) => {
    setText(nextText);
    const parsed = parseSchemaText(nextText);
    if ("error" in parsed) {
      setParseError(parsed.error);
      return;
    }
    setParseError(undefined);
    setSchema(parsed.schema);
  };

  return (
    <DemoSection
      id="json-schema-form-listeners"
      title="JsonSchemaForm · x-on-change"
      description="Field listeners hide/show, enable/disable, require, reset and set sibling fields. Edit the schema on the left — the form re-renders live and keeps its value, so you can watch derived state follow your edits."
    >
      <SegmentedControl
        aria-label="Listener example"
        size="sm"
        wrap
        value={example.id}
        onChange={selectExample}
        options={LISTENER_EXAMPLES.map((candidate) => ({ id: candidate.id, label: candidate.label }))}
      />
      <p className="text-sm text-muted-foreground">{withInlineCode(example.description)}</p>
      <div className="grid min-w-0 gap-density-4 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-density-2">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Schema</h3>
            <span className="text-xs text-muted-foreground" data-testid="schema-validation">
              {parseError ? "invalid JSON" : validation.status}
            </span>
          </div>
          <Suspense fallback={<p className="text-sm text-muted-foreground">Loading editor…</p>}>
            {/* Remount per example: MonacoSchemaEditor settles its initial
                validation on mount, and a path change alone swaps the model
                without one, leaving a valid document stuck at "loading". */}
            <MonacoSchemaEditor
              key={example.id}
              value={text}
              onChange={editSchema}
              language="json"
              path={`listeners/${example.id}.json`}
              height="36rem"
              schema={LISTENER_META_SCHEMA}
              schemaUri={META_SCHEMA_URI}
              onValidationChange={setValidation}
            />
          </Suspense>
          {(parseError || validation.errors.length > 0) && (
            <ul role="alert" className="space-y-1 text-xs text-destructive">
              {parseError && <li>{parseError}</li>}
              {validation.errors.map((error) => <li key={error}>{error}</li>)}
            </ul>
          )}
        </div>
        <div className="flex min-w-0 flex-col gap-density-3">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">Form</h3>
            <Button type="button" variant="outline" size="sm" onClick={() => setValue(example.initialValue)}>
              Reset value
            </Button>
          </div>
          <div className="rounded-md border border-border p-density-3">
            {/* A listener the schema gets wrong throws; remounting on every
                schema edit lets the next fix clear the error. */}
            <ErrorWrapper key={text}>
              <JsonSchemaForm
                schema={schema}
                value={value}
                onChange={setValue}
                expressionEvaluator={javascriptEvaluator}
                showPreferencesMenu={false}
              />
            </ErrorWrapper>
          </div>
          <h3 className="text-sm font-semibold">Value</h3>
          <div className="overflow-auto rounded-md border border-border bg-muted/30 p-density-3 font-mono text-xs" data-testid="listener-value">
            <JsonView data={value} defaultOpenDepth={3} />
          </div>
        </div>
      </div>
    </DemoSection>
  );
}
