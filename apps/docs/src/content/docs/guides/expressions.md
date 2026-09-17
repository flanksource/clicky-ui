---
title: Expressions
description: Add expression language support to Monaco or embed the evaluation playground.
---

Clicky UI provides Monaco support for CEL, Go templates, and JSONPath. Use `@flanksource/clicky-ui/expressions` to register languages in an existing editor, or `@flanksource/clicky-ui/expressions/playground` to embed the React editing and evaluation surface.

## Register editor languages

Install Monaco alongside Clicky UI for a host-managed editor:

```sh
pnpm add @flanksource/clicky-ui monaco-editor
```

Register the languages before creating the first editor model:

```ts
import * as monaco from "monaco-editor";
import { registerGomplateLanguages } from "@flanksource/clicky-ui/expressions";

const languages = registerGomplateLanguages(monaco, {
  environment: () => ({ service: { name: "example", replicas: 3 } }),
});

const container = document.getElementById("expression-editor");
if (!container) throw new Error("Missing expression-editor container");

const editor = monaco.editor.create(container, {
  language: "cel",
  value: "service.replicas > 1",
});

export function disposeEditor() {
  editor.dispose();
  languages.dispose();
}
```

The host supplies the `expression-editor` element with a non-zero height and configures Monaco's workers for its bundler. With `@monaco-editor/react`, register in `beforeMount` so the initial model receives its language. The registration entry point does not import the React playground or bundle a Monaco instance.

| Language ID     | Editor content                      |
| --------------- | ----------------------------------- |
| `cel`           | CEL expressions                     |
| `gomplate`      | Go templates                        |
| `yaml-gomplate` | Go templates embedded in YAML       |
| `json-gomplate` | Go templates embedded in JSON       |
| `text-gomplate` | Go templates embedded in plain text |
| `jsonpath`      | JSONPath expressions                |

Registration supplies tokenizers, completion, hover documentation, and themes. Use an `environment` getter that reads the current input document to complete document keys as the input changes.

## Host function catalog

The package contains gomplate's function catalog. When the host adds functions, load its served spec into the registration handle so completion and hover match the running server:

```ts
const response = await fetch("/playground/api/spec");
if (!response.ok) {
  throw new Error(`Could not load expression spec: HTTP ${response.status}`);
}
languages.setSpec(await response.json());
```

`setSpec` merges the host spec with the packaged catalog. The host response must follow the exported `GomplateSpec` shape.

## Embed the playground

The playground includes expression and input editors plus Result, Object graph, Tokens, and Functions panels. Evaluation uses a host API; language registration alone does not evaluate expressions.

```tsx
import { ExpressionPlayground } from "@flanksource/clicky-ui/expressions/playground";
import { DensityProvider, ThemeProvider } from "@flanksource/clicky-ui/hooks";
import "@flanksource/clicky-ui/styles.css";

export function ExpressionsPage() {
  return (
    <ThemeProvider>
      <DensityProvider>
        <div className="flex h-dvh min-h-0 flex-col">
          <ExpressionPlayground apiBase="/playground/api" />
        </div>
      </DensityProvider>
    </ThemeProvider>
  );
}
```

The host owns navigation and gives the playground a bounded height. If the application already provides theme and density contexts, mount the playground inside them.

| Prop | Purpose |
| --- | --- |
| `apiBase` | Mounted API prefix; defaults to `/api`. Supply it without a trailing slash. |
| `languages` | Offered language configurations; defaults to all supported playground languages. |
| `examples` | Samples to offer. When omitted, the playground requests them from the host. |
| `spec` | Host function catalog. When supplied, the playground does not request `/spec`. |
| `evaluate` | Host evaluator used instead of `POST /eval`. |
| `executionMode` | `"explicit"` evaluates only on Run; `"automatic"` (default) also evaluates as the author types. |
| `beforeRun` | Receives every evaluation a run is about to make (one per sample for **All samples**); return `false` to cancel. |
| `samples` | Inputs the expression should hold for. With two or more, the Result tab offers **All samples**. |
| `expectation` | Allowed values, rules and a `validate` function for the result. Shown above the result with a verdict. |
| `formatPath` | Host syntax for paths inserted from the object graph. |
| `value`, `onChange` | Controlled editing state and its change callback. |
| `defaultValue` | Initial state for an uncontrolled playground. |

### Confirm runs, check results, cover every sample

When evaluation has side effects, confirm the whole run once with `useConfirm`. When the result feeds a typed field, pass its allowed values and a validator. When several inputs exist, pass them as `samples`:

```tsx
import { useConfirm } from "@flanksource/clicky-ui";
import { ExpressionPlayground } from "@flanksource/clicky-ui/expressions/playground";

const { confirm, dialog } = useConfirm();

<>
  <ExpressionPlayground
    executionMode="explicit"
    evaluate={evaluateOnServer}
    beforeRun={(requests) =>
      confirm({
        title: "Run against staging?",
        warning: "Custom functions may change data.",
        confirmLabel: requests.length > 1 ? `Run ${requests.length} samples` : "Run",
        remember: { key: "expression-run:staging" },
      })
    }
    expectation={{
      options: [{ value: "F", label: "Female" }, { value: "M", label: "Male" }],
      rules: ["String", "Required"],
      validate: (response) => (["F", "M"].includes(response.result) ? [] : ["Not an allowed value"]),
    }}
    samples={rows.map((row) => ({ id: row.id, label: `Row ${row.id}`, input: JSON.stringify(row) }))}
  />
  {dialog}
</>;
```

**All samples** evaluates the samples one after another, never in parallel, so functions with side effects see them in order. It lists each sample's outcome (valid, empty, invalid or failed), and **Next failure** steps through the broken ones.

The API prefix must expose these routes:

| Route | Contract |
| --- | --- |
| `GET /spec` | Host function catalog in `GomplateSpec` format. |
| `GET /examples` | Sample array with `name`, `language`, `source`, and `input` strings. |
| `POST /eval` | Receives `language`, `source`, optional `input`, and optional template delimiters. Returns `result`, `durationMs`, and optional `value`, `type`, or an error with `message`, `line`, and `column`. |

Mount the gomplate playground handler behind the host application's authentication and authorization. Access control belongs to the host; the handler does not provide it.
