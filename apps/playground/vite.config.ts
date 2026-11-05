import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, isAbsolute, resolve } from "node:path";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import {
  defineConfig,
  loadEnv,
  searchForWorkspaceRoot,
  type Alias,
} from "vite";
import { configDefaults } from "vitest/config";

import {
  createAgentRuns,
  playgroundAgentRuns,
} from "./plugins/agent-runs-server";
import { configureComments } from "./plugins/comments-client";
import { playgroundComments } from "./plugins/comments-server";
import {
  createPromptRuns,
  playgroundPromptRuns,
} from "./plugins/prompt-runs-server";
import { playgroundBookmarklet } from "./plugins/bookmarklet-server";
import { playgroundExports } from "./plugins/exports-server";
import { playgroundMarkdown } from "./plugins/markdown-vite-plugin";
import { playgroundPageMeta } from "./plugins/page-meta-vite-plugin";
import { playgroundSources } from "./plugins/sources-server";
import { playgroundEditableSource } from "./plugins/editable-source-plugin";
import { playgroundVisualEdits } from "./plugins/visual-edits-server";
import { playgroundPageActivity } from "./plugins/page-activity";
import { playgroundRuntimeProfiles } from "./plugins/runtime-profiles-server";
import { playgroundWorkspaceFiles } from "./plugins/workspace-files-server";
import { playgroundGavelLint } from "./plugins/gavel-lint-server";
import { playgroundBlame } from "./plugins/blame-server";
import { playgroundProduction } from "./plugins/production-server";
import { playgroundReactDevtoolsHook } from "./plugins/react-devtools-hook";
import { fixedGavel, onDemandGavel } from "./plugins/gavel-launch-server";
import { authorizeDocumentDirectory, playgroundRepositoryDocuments } from "./plugins/repository-documents-server";
import { playgroundNavigation } from "./plugins/navigation-server";
import { playgroundVocabularies } from "./plugins/vocabularies-server";
import { playgroundConnections } from "./plugins/connections-server";

const root = dirname(fileURLToPath(import.meta.url));
const workspaceRoot = resolve(root, "../..");
const uiSrc = resolve(workspaceRoot, "packages/ui/src");
const playgroundDataDir = resolve(root, ".playground");

/*
 * A local scratch page can preview TSX that lives in another checkout, such as
 * an agent skill's report kit. Declare that checkout in the gitignored
 * `.env.local` beside this file, never here:
 *
 *   PLAYGROUND_EXTERNAL_ROOTS=/abs/checkout/dir
 *   PLAYGROUND_EXTERNAL_ALIASES=@scope/pkg=/abs/checkout/dir/index.ts,@scope/icons=/abs/icons/dir
 *
 * Roots join the files the dev server may serve (it refuses everything outside
 * the workspace), and each alias points a bare import at live source rather
 * than at an installed copy. An alias also maps subpaths, so `@scope/icons/a`
 * becomes `/abs/icons/dir/a`. Tailwind classes in those files still need an
 * `@source` in the page's own stylesheet.
 */
const localEnv = loadEnv("development", root, "PLAYGROUND_");

function envList(name: string): string[] {
  return (localEnv[name] ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function existingPath(name: string, path: string): string {
  if (!isAbsolute(path) || !existsSync(path)) {
    throw new Error(`${name}: "${path}" is not an existing absolute path`);
  }
  return path;
}

const externalRoots = envList("PLAYGROUND_EXTERNAL_ROOTS").map((path) =>
  existingPath("PLAYGROUND_EXTERNAL_ROOTS", path),
);
const vocabularyRoots = [resolve(root, "src/vocabularies"), ...envList("PLAYGROUND_VOCABULARY_DIRS").map(path => existingPath("PLAYGROUND_VOCABULARY_DIRS", path))];

const externalAliases: Alias[] = envList("PLAYGROUND_EXTERNAL_ALIASES").map(
  (entry) => {
    const separator = entry.indexOf("=");
    if (separator <= 0) {
      throw new Error(
        `PLAYGROUND_EXTERNAL_ALIASES: "${entry}" is not <package>=<absolute path>`,
      );
    }
    // A string `find` matches the package name and its subpaths only.
    return {
      find: entry.slice(0, separator),
      replacement: existingPath(
        "PLAYGROUND_EXTERNAL_ALIASES",
        entry.slice(separator + 1),
      ),
    };
  },
);

const gavelEndpoint = localEnv.PLAYGROUND_GAVEL_URL ? fixedGavel(localEnv.PLAYGROUND_GAVEL_URL) : onDemandGavel({ workspace: workspaceRoot, command: [localEnv.PLAYGROUND_GAVEL_BINARY ?? "gavel"], localRoots: [workspaceRoot, ...envList("PLAYGROUND_LOCAL_ROOTS").map((path) => existingPath("PLAYGROUND_LOCAL_ROOTS", path))] });
configureComments({ dir: playgroundDataDir, endpoint: gavelEndpoint, workspace: workspaceRoot });
const captainURL = "http://localhost:9020";
const agentRuns = createAgentRuns({
  dir: playgroundDataDir,
  captainURL,
  cwd: workspaceRoot,
  skillPath: resolve(workspaceRoot, ".agents/skills/clicky-ui-playground/SKILL.md"),
  resolveDocumentDirectory: (page) => authorizeDocumentDirectory({ dir: playgroundDataDir, endpoint: gavelEndpoint, page }),
});
const promptRuns = createPromptRuns({
  dir: playgroundDataDir,
  gavelURL: localEnv.PLAYGROUND_GAVEL_URL,
  endpoint: gavelEndpoint,
  workspace: workspaceRoot,
  onCreated: agentRuns.autoRunComment,
});

export default defineConfig(({ mode }) => ({
  plugins: [
    mode === "playground-prod" && playgroundProduction({ root }),
    react(),
    tailwindcss(),
    // Design mode's live preview needs react-dom registered with a DevTools hook.
    playgroundReactDevtoolsHook({ root }),
    // Pre-transform: stamps facet node call sites with data-editable-source for Design mode.
    playgroundEditableSource({ pagesDir: resolve(root, "src/pages") }),
    playgroundMarkdown({ sourceRoot: resolve(root, "src") }),
    playgroundPageMeta({ sourceRoot: resolve(root, "src") }),
    playgroundPageActivity(resolve(root, "src/pages")),
    playgroundVocabularies({ dir: playgroundDataDir, roots: vocabularyRoots }),
    playgroundConnections({ gavel: gavelEndpoint, captainURL }),
    // Before playgroundComments: that middleware answers every other
    // /__playground/comments/* path (including /:id/agent-run) with a 405.
    playgroundAgentRuns(agentRuns),
    playgroundRepositoryDocuments({ dir: playgroundDataDir, endpoint: gavelEndpoint }),
    playgroundPromptRuns(promptRuns),
    playgroundNavigation({
      dir: playgroundDataDir,
      pagesDir: resolve(root, "src/pages"),
      endpoint: gavelEndpoint,
      problems: promptRuns.problems,
    }),
    playgroundComments({
      dir: playgroundDataDir,
      pagesDir: resolve(root, "src/pages"),
      onCreated: agentRuns.autoRunComment,
    }),
    mode !== "test" && playgroundBookmarklet({
      root,
      dir: playgroundDataDir,
      compiled: mode === "playground-prod",
    }),
    playgroundExports({ dir: playgroundDataDir }),
    playgroundRuntimeProfiles({
      modelsURL: `${captainURL}/api/chat/models`,
      permissionsURL:
        `${captainURL}/api/captain/ai/permissions/catalog`,
      runtimesURL: `${captainURL}/api/chat/runtimes`,
      resolveURL: `${captainURL}/api/chat/runtime-profiles/resolve`,
    }),
    playgroundWorkspaceFiles({ cwd: workspaceRoot }),
    playgroundBlame({ cwd: workspaceRoot }),
    playgroundGavelLint({
      pagesDir: resolve(root, "src/pages"),
      workspaceRoot,
      promptFile: resolve(root, "prompts/markdown-review.prompt"),
    }),
    playgroundVisualEdits({ pagesDir: resolve(root, "src/pages"), workspaceRoot }),
    playgroundSources({
      pagesDir: resolve(root, "src/pages"),
      commentsDir: playgroundDataDir,
      workspaceRoot,
    }),
  ],
  resolve: {
    // External source (see PLAYGROUND_EXTERNAL_ALIASES) cannot see this app's
    // node_modules, so these resolve from the playground's own install.
    dedupe: ["react", "react-dom", "@iconify/react"],
    alias: [
      ...externalAliases,
      {
        find: /^@flanksource\/clicky-ui\/styles\.css$/,
        replacement: resolve(uiSrc, "styles.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/icons$/,
        replacement: resolve(uiSrc, "icons.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/comments$/,
        replacement: resolve(uiSrc, "comments.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/monaco$/,
        replacement: resolve(uiSrc, "monaco.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/file-findings$/,
        replacement: resolve(uiSrc, "file-findings.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/rpc$/,
        replacement: resolve(uiSrc, "rpc.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/connections$/,
        replacement: resolve(uiSrc, "connections.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/chat$/,
        replacement: resolve(uiSrc, "chat.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/ai$/,
        replacement: resolve(uiSrc, "ai.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/ai\/runtime-profile$/,
        replacement: resolve(uiSrc, "runtime-profile.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/utils$/,
        replacement: resolve(uiSrc, "utils.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/data$/,
        replacement: resolve(uiSrc, "data.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/git$/,
        replacement: resolve(uiSrc, "git.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/expressions\/playground$/,
        replacement: resolve(uiSrc, "expressions/playground.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui\/expressions$/,
        replacement: resolve(uiSrc, "expressions.ts"),
      },
      {
        find: /^@flanksource\/clicky-ui$/,
        replacement: resolve(uiSrc, "index.ts"),
      },
    ],
  },
  optimizeDeps: {
    exclude: ["@flanksource/clicky-ui"],
    // Only the lazy Source editor imports these. Discovered on first use, they force a
    // re-optimization whose reload never reaches the page (hmr: false), leaving two React copies.
    include: ["monaco-editor", "@flanksource/clicky-ui > @monaco-editor/react", "@flanksource/clicky-ui > monaco-yaml"],
  },
  test: {
    // The React artifact tests render through @testing-library, and the shared
    // setup stubs window.matchMedia — both need a DOM.
    environment: "jsdom",
    // .facet/ is a gitignored facet build tree whose src/ symlinks back into
    // this app, so vitest would run every plugin test a second time through it.
    exclude: [...configDefaults.exclude, ".facet/**", "src/pages/**"],
    maxWorkers: 2,
    projects: [
      {
        extends: true,
        test: { name: "app", exclude: ["plugins/**"], pool: "vmThreads" },
      },
      {
        // The plugin tests boot a vite dev server; rolldown's native binding
        // rejects RegExps created inside a vmThreads context, so they run in
        // plain threads.
        extends: true,
        test: { name: "plugins", include: ["plugins/**/*.test.ts"], pool: "threads" },
      },
    ],
    setupFiles: ["./src/test/setup.ts"],
    server: {
      deps: {
        // `@tanstack/react-virtual` backs DataTable's row virtualiser. Left
        // external, vitest loads it by node resolution, which in this checkout
        // reaches a sibling repo's store and hands it a second copy of React —
        // "Invalid hook call" on every test that renders a DataTable. Inlined,
        // vite resolves its `react` import and `resolve.dedupe` applies.
        inline: ["@floating-ui/react", "@tanstack/react-virtual"],
      },
    },
  },
  server: {
    proxy: {
      "/oipa-api": {
        target: localEnv.PLAYGROUND_OIPA_URL ?? "http://localhost:8020",
        changeOrigin: true,
        rewrite: (path) => path.slice("/oipa-api".length),
      },
    },
    // The compiled-shell editing server reloads live pages after changes.
    hmr: false,
    // Bind every interface so the playground is reachable from other devices
    // on the LAN; allowedHosts keeps hostname (.local, tunnel) access working,
    // which Vite otherwise rejects with "Blocked request".
    host: true,
    allowedHosts: true,
    port: mode === "playground-prod" ? 5275 : 5274,
    strictPort: true,
    fs: {
      allow: [searchForWorkspaceRoot(root), ...externalRoots, ...vocabularyRoots],
    },
  },
}));
