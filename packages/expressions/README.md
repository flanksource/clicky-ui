# @flanksource/expressions

Monaco language support and a playground for the expression languages gomplate evaluates: CEL, Go templates (bare and embedded in YAML/JSON/text), and JSONPath.

Two entries, so a host that only wants highlighting in its own editor does not pull React and the Monaco editor in with it:

```ts
import { registerGomplateLanguages } from "@flanksource/expressions";
import { ExpressionPlayground } from "@flanksource/expressions/playground";
```

## Language support

```ts
import * as monaco from "monaco-editor";
import { registerGomplateLanguages } from "@flanksource/expressions";

const languages = registerGomplateLanguages(monaco);
```

Registers `cel`, `gomplate`, `yaml-gomplate`, `json-gomplate`, `text-gomplate` and `jsonpath` with tokenizers, completion, hover documentation and colour themes.

With `@monaco-editor/react`, register in `beforeMount` — a model created before registration resolves to plaintext and is never revisited.

### Your own functions

The catalogue baked in is gomplate's. A host binary registers more on top and serves the result from its `GET /api/spec`; fold it in with `setSpec`:

```ts
fetch("/api/spec")
  .then((r) => r.json())
  .then((served) => languages.setSpec(served));
```

No new grammar is involved. The tokenizers match any dotted call and dispatch on word lists — `namespaces`, `globalFunctions`, `memberFunctions`, `macros` — so `catalog.query(…)` highlights the moment `catalog` joins `namespaces`.

### Completing the document

Pass `environment` to complete the keys of the document being evaluated against, not just the function catalogue:

```ts
registerGomplateLanguages(monaco, { environment: () => currentDocument });
```

A getter, not a value: registration happens once, before the first editor mounts, while the document keeps being edited.

## The playground

```tsx
import { ExpressionPlayground } from "@flanksource/expressions/playground";

<ExpressionPlayground apiBase="/playground/api" />;
```

Renders the expression editor, the input document, and the Result / Object graph / Tokens / Functions panels. Deliberately shell-less — a host frames it with its own navigation.

It talks to the Go handler in [`gomplate/playground`](https://github.com/flanksource/gomplate/tree/main/playground), which a host mounts with its own CEL options, template functions and sample documents. **That handler carries no authorization**: mount it behind the same authorization as any other query endpoint.

## `src/lang` is generated — do not edit it

The tokenizers come from cel-go's ANTLR grammar, `text/template`'s lexer and gomplate's live function registries, none of which is readable outside a Go toolchain. `scripts/vendor-lang.ts` clones gomplate, runs its generator, and commits the result:

```sh
pnpm vendor                          # from github.com/flanksource/gomplate@main
pnpm vendor --ref v3.2.0             # from a tag
pnpm vendor --from ../../../gomplate # from a local checkout, while iterating
pnpm vendor:check                    # fail if the tree is stale or hand-edited
```

The whole `src` tree is copied, not just the generated JSON: the completion, hover and path-expression runtime changes with the generated shape, and a second copy of it here would drift within a release. `VENDOR` records the gomplate commit it came from.

A weekly workflow re-runs the vendoring and opens a PR when it changes; a PR touching `src/lang` runs `vendor:check` against a fresh clone.

**Fix language behaviour in gomplate, not here.** An edit under `src/lang` is overwritten by the next vendoring, and `vendor:check` fails the PR that makes one.
