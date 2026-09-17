# Verification fixture schemas

`PromptRunEditor` and `SpecRuntimeEditor` accept an optional `fixtureSchemas` prop. Use the runner's schemas to enable structured fence editing and populate the verification editor's Add fence menu.

```tsx
import { PromptRunEditor, type FixtureFenceSchemas } from "@flanksource/clicky-ui/data";

const fixtureSchemas: FixtureFenceSchemas = {
  test: {
    type: "object",
    properties: { name: { type: "string", title: "Name" } },
  },
  "yaml contract": {
    type: "object",
    properties: { policy: { type: "string", title: "Policy" } },
  },
};

<PromptRunEditor
  value={value}
  onChange={setValue}
  fixtureSchemas={fixtureSchemas}
/>
```

`fixtureSchemas` is a `Record<string, JsonSchemaObject>`, keyed by a fixture kind such as `test`, or a full fence info string such as `yaml contract`. It has the same shape as `FixtureEditor.schemas`. If the host exposes a schema document containing `fences`, project each fence's `schema` into this map before passing it. Schemas are editor metadata and are never written to the runtime spec or fixture markdown.

Omitting the prop keeps the existing generic fixture editor behavior. The shared library does not fetch schemas or define runner-specific contracts.

Run the example with `pnpm --filter storybook dev`, then open [the verification fixture story](http://localhost:5270/?path=/story/ai-promptruneditor-verification-fixture--host-schemas). Open the runtime bar's **⋮ → Advanced**, expand the **contract** fence, and edit **Policy**. Close the modal to inspect the resulting fixture markdown.

## Resolved runtime display

Pass the render response's `resolution` to display the effective model family and mode while keeping `value.spec` limited to operator overrides. A profile or preset's inherited model belongs in `resolution.spec`; copying it into `value.spec` makes it an explicit override on the next request.

Open [the resolved profile story](http://localhost:5270/?path=/story/ai-promptruneditor-resolved-profile--inherited-runtime) to see a profile with an empty request spec. Switch the family and select a model to inspect the explicit request override. The family control filters model choices; selecting a model changes the request's model identity.

## Recently used runtimes

Pass `recentRuntimes` to list the operator's recent runtimes under the runtime bar. The host owns where they come from, such as session history or local storage. After a run, record its rows with `recordRecentRuntimes`, which keeps the newest runtimes first, drops repeats and rows that inherit both model and mode, and keeps at most `RECENT_RUNTIME_LIMIT` runtimes.

```tsx
import { PromptRunEditor, recordRecentRuntimes, runtimeRows } from "@flanksource/clicky-ui/ai";

const [recent, setRecent] = useState<AISpecRuntimeModel[]>([]);

<PromptRunEditor value={value} onChange={setValue} recentRuntimes={recent} />
<Button onClick={() => { run(value); setRecent((current) => recordRecentRuntimes(current, runtimeRows(value))); }}>Run</Button>
```

In single-model mode a chip replaces the runtime's model identity and keeps the spec's timeout and max cost. In multi-model mode it adds another comparison row. Open [the tabbed spec story](http://localhost:5270/?path=/story/ai-promptruneditor--tabbed-spec) and click the **Recent** chip.

## Raw YAML request

`promptRunYaml(value)` serializes the request for a raw editor tab. `parsePromptRunYaml(text)` parses an edit back. It throws on non-mapping documents, unknown top-level fields, and top-level fields of the wrong shape, so hosts can keep the invalid text and show the error instead of rendering a broken form. The library ships no editor for it; the playground's `captain/prompt-run` page pairs these helpers with `MonacoEditor` from `@flanksource/clicky-ui/monaco`.
