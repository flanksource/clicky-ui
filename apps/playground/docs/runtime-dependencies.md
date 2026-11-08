# Runtime problems and page dependencies

In browser mode, blocked pages show **Runtime problems** grouped by package and issue type. Expand a row to see every source location, open a source excerpt, or choose a recovery action. Filters and the selected problem are saved in the URL. **Runtime activity** and **Configuration** remain available before the frame starts and after a failure; **Copy diagnostics** includes the original error details. **Recheck** reads the current page and its imports again.

Choose **Add runtime import…**, select a version or range, and **Preview fix**. The preview resolves the proposed dependency set, validates the affected import subpaths, and shows a source diff. **Apply and recheck** writes the current page using its expected source hash, so concurrent edits are refused. Save or revert an open source draft first.
## Dependency layers

**Save dependency to** chooses where a dependency is declared. You can also use **Configuration → Add dependency…** without an existing problem. Layers merge from lowest to highest, and the higher declaration wins:

| Layer | Persistence | Applies to | May set the policy |
| --- | --- | --- | --- |
| Browser runtime default | localStorage `playground.runtime.profile` | Every page in this browser | Yes |
| Runtime profile | Git root `.playground/runtime-profile.json` | Every browser | Yes |
| package.json | Git root `package.json` → `pageRuntime` | Every browser | Yes |
| Browser override for every page | localStorage `playground.runtime.dependencies` | Every page in this browser | No |
| Browser override for this page | localStorage `playground.runtime.dependencies.page:<slug>` | This page in this browser | No |
| Page header | YAML header comment, or Markdown frontmatter | This page | No |

Local folder overrides take precedence over matching published dependencies. The preview shows the destination diff and the resolved versions. It refuses a change the dependency policy would still reject. File writes and browser settings both reject stale previews. package.json writes keep package-manager dependencies and unrelated fields.

## Dependency policy

`policy.dependencies` is a guardrail on which declared packages a page may load:

- `strict`: only packages named in package.json `dependencies`, `peerDependencies` or `pageRuntime.dependencies`. This is the default.
- `ask`: the strict set, plus packages you approve in this browser. A page that declares an unapproved package pauses with a prompt: **Allow for this page**, **Allow for every page**, **Add to package.json…** or **Deny**.
- `any`: every declared package.

Only the three profile layers may set the policy, and the highest one that sets it wins. Browser overrides and page headers can add or pin dependencies, but they can never loosen the policy. Change it in **Configuration → Runtime profile**, which previews each change as a diff. That section also lists this browser's approvals, each with a **Revoke** action.

A rejected package shows up as a **policy** problem naming the layer that declared it. Its actions are **Add to package.json…**, **Remove from <layer>…** and, under `ask`, the two allow actions.

For example, a git-root `package.json` that asks before loading anything it doesn't list is:

```json
{
  "pageRuntime": {
    "policy": { "dependencies": "ask" },
    "dependencies": {
      "entities": "^7"
    }
  }
}
```

`.playground/runtime-profile.json` uses the same `{ "policy": { "dependencies": … }, "dependencies": { … } }` shape at the top level. Published runtime profiles set `policy: { "dependencies": "strict", "allow": [...] }` directly.

TSX and JSX pages declare dependencies in a leading YAML comment:

```tsx
/*
---
dependencies:
  entities: "^7"
---
*/
import { decode } from "entities";

export default function Example() {
  return <p>{decode("A &amp; B")}</p>;
}
```

Markdown and MDX use the same `dependencies` mapping in YAML frontmatter. Existing header fields and YAML comments are retained. Dependency declarations affect only that page; shared helper imports use the root page's declarations. Invalid names, unsupported version syntax, duplicate YAML keys, and malformed headers appear as problems with source locations. The runtime profile's registry, release-age rules, conversion settings, and singleton constraints still apply.

## Local package folders

Open **Configuration → Local overrides → Select package folder…** in desktop Chrome or another browser with File System Access support. Select the package directory containing `package.json` and prepared `dist/runtime/link.json`, review its identity, then choose **Apply override**. The folder handle is saved in IndexedDB on this origin. Matching imports across pages use that checkout, including unpublished packages and declared subpath entries, before consulting the registry. Page headers retain their published version declarations.

Build the library normally first. For the UI package:

```bash
pnpm --filter @flanksource/clicky-ui build
```

Then prepare `dist/runtime/link.json` with the existing link build CLI. Supply entrypoint and build-constant JSON files as described in the [runtime link documentation](../../../packages/page-runtime/src/link/README.md#build-a-checkout):

```bash
pnpm --filter @flanksource/page-runtime exec tsx src/link/build-cli.ts --library /absolute/checkout --entries /absolute/entrypoints.json --defines /absolute/build-inputs.json
```

The Node API is `buildLinkRuntime({ libraryDir, outDir, entries, defines, base })` from `@flanksource/page-runtime/link/build`. `outDir` is `<package>/dist/runtime`; `entries` maps the package's public import names to checkout source files. Libraries that inherit clicky-ui's singleton set supply its compatible runtime fragment as `base` (CLI: `--base /absolute/clicky-ui/dist/runtime/importmap.json`). Rebuild metadata when adding imports or changing package exports or dependencies.

**Reconnect** requests permission for a saved folder and reloads its metadata. **Refresh metadata** rereads a prepared build. **Remove override** returns future resolutions to the page's published declaration. Replacing an existing package shows the old and new folder identities before applying. Revoked permission, stale metadata, missing exports, and incompatible singleton versions remain visible errors; they never silently select a registry package.

The current page watches only the local packages it uses and their selected local dependencies. Source changes use the existing **Page reloads** preference: manual by default, or automatic when idle after drafts and source edits are saved. Removing browser site data removes saved overrides. Overrides are local browser settings and are never written into repository dependency files.
