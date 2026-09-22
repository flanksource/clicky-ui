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

import { playgroundComments } from "./plugins/comments-server";
import { playgroundMarkdown } from "./plugins/markdown-vite-plugin";
import { playgroundSources } from "./plugins/sources-server";
import { playgroundRuntimeProfiles } from "./plugins/runtime-profiles-server";

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

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    playgroundMarkdown({ sourceRoot: resolve(root, "src") }),
    playgroundComments({ dir: playgroundDataDir }),
    playgroundRuntimeProfiles({
      permissionsURL:
        "http://localhost:9020/api/captain/ai/permissions/catalog",
      runtimesURL: "http://localhost:9020/api/chat/runtimes",
      resolveURL: "http://localhost:9020/api/chat/runtime-profiles/resolve",
    }),
    playgroundSources({
      pagesDir: resolve(root, "src/pages"),
      commentsDir: playgroundDataDir,
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
        find: /^@flanksource\/clicky-ui\/rpc$/,
        replacement: resolve(uiSrc, "rpc.ts"),
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
  },
  test: {
    // The React artifact tests render through @testing-library, and the shared
    // setup stubs window.matchMedia — both need a DOM.
    environment: "jsdom",
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
    // Watch source changes without updating the open browser page.
    hmr: false,
    // Bind every interface so the playground is reachable from other devices
    // on the LAN; allowedHosts keeps hostname (.local, tunnel) access working,
    // which Vite otherwise rejects with "Blocked request".
    host: true,
    allowedHosts: true,
    port: 5274,
    strictPort: true,
    fs: {
      allow: [searchForWorkspaceRoot(root), ...externalRoots],
    },
  },
});
