# Git pickers

Controlled Git connection, repository, branch, ref, commit, pipeline, execution and file controls use the shared Combobox. Branch values remain qualified (`refs/heads/main`), commit values retain the full SHA, and selected commits display their short SHA with author and date metadata. The OIPA iconography reference pickers provide the visual baseline.

Import the controls and types from `@flanksource/clicky-ui`. `GitPickersDemo.tsx` is a runnable client-backed example in Storybook under Data/GitPickers and in the kitchen sink under Git pickers.

```tsx
const [value, setValue] = useState<GitFileValue>({
  connection: "example", repo: "acme/rules", ref: "refs/heads/main", path: "", sha: "",
});
return <GitFilePicker client={client} value={value} onChange={setValue} accept={[".xlsx"]} />;
```

`client` implements `GitPickerClient`: connection, repository, ref and file discovery are required; commit, pipeline and execution discovery are optional capabilities. Requests receive an AbortSignal. File discovery returns paths plus the resolved full commit SHA. Persist the emitted `GitFileValue`, including SHA, and submit that SHA for subsequent file reads.

Standalone controls accept `value`, `onChange` and either `items` or `load`. `load` receives `signal` and optional `cursor`, and returns `{ items, nextCursor }`; the control provides retry and load-more actions. Change `scope` when parent selection changes so pending requests are cancelled and old pages are discarded. `label`, `help`, `disabled`, `loading`, `error` and `size` customize the shared field presentation. Consumers own dependent values: clear execution when pipeline changes, and clear repository/ref/file when their parent changes. The composed source and file pickers perform these resets themselves.

For Go-backed consumers, `commons-db/git/httpapi` supplies the handlers and OpenAPI contract, and `commons-db/git/browse` owns catalog resolution and immutable file reads. Inject authorization and connection resolution; never send provider credentials to a browser. Azure DevOps and GitHub implement the optional pipeline capability. Other provider types return an explicit unsupported-capability error.
