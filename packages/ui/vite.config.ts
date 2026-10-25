import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import { configDefaults } from "vitest/config";
import dts from "vite-plugin-dts";
import { gitInfo } from "./scripts/git-info.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));

const build = gitInfo();

const VM_INCOMPATIBLE_TESTS = [
  // Loads the Storybook Vitest config through Vite: rolldown rejects config
  // objects created in another realm.
  "scripts/ci-config.test.ts",
  // Replaces window.location to observe reload(), which jsdom's location
  // forbids inside a VM context.
  "src/hooks/event-hub.test.ts",
  // Heavy renders that run 1.5-2x slower when every file re-evaluates its
  // modules in a fresh VM context, and then miss waitFor's 1s or the 5s test
  // deadline under full-suite load.
  "src/data/ai/runtime-profiles/RuntimeProfilesWorkspace.test.tsx",
  "src/data/ai/SpecRuntimeEditor.test.tsx",
  // Waits for Shiki's async highlighting, which a VM context reloads per file.
  "src/data/SymbolBadge.test.tsx",
];

const entry = {
  index: resolve(__dirname, "src/index.ts"),
  utils: resolve(__dirname, "src/utils.ts"),
  hooks: resolve(__dirname, "src/hooks.ts"),
  jotai: resolve(__dirname, "src/jotai.ts"),
  "mdx-editor": resolve(__dirname, "src/mdx-editor.ts"),
  components: resolve(__dirname, "src/components.ts"),
  data: resolve(__dirname, "src/data.ts"),
  devtools: resolve(__dirname, "src/devtools.ts"),
  comments: resolve(__dirname, "src/comments.ts"),
  icons: resolve(__dirname, "src/icons.ts"),
  clicky: resolve(__dirname, "src/clicky.ts"),
  rpc: resolve(__dirname, "src/rpc.ts"),
  monaco: resolve(__dirname, "src/monaco.ts"),
  "monaco-schema": resolve(__dirname, "src/monaco-schema.ts"),
  expressions: resolve(__dirname, "src/expressions.ts"),
  "expressions/playground": resolve(__dirname, "src/expressions/playground.ts"),
  profiles: resolve(__dirname, "src/profiles.ts"),
  connections: resolve(__dirname, "src/connections.ts"),
  chat: resolve(__dirname, "src/chat.ts"),
  ai: resolve(__dirname, "src/ai.ts"),
  "runtime-profile": resolve(__dirname, "src/runtime-profile.ts"),
  "tailwind-preset": resolve(__dirname, "src/tailwind-preset.ts"),
  styles: resolve(__dirname, "src/styles.ts"),
};

export default defineConfig(({ mode }) => {
  const isCjs = mode === "cjs";
  const isTest = mode === "test";
  const jsExt = isCjs ? "cjs" : "js";

  return {
    resolve: {
      alias: isTest
        ? [
            {
              find: /^monaco-editor$/,
              replacement: "monaco-editor/esm/vs/editor/editor.api",
            },
          ]
        : [],
    },
    define: {
      __CLICKY_COMMIT__: JSON.stringify(build.commit),
      __CLICKY_TAG__: JSON.stringify(build.tag),
      __CLICKY_DATE__: JSON.stringify(build.date),
      __CLICKY_DIRTY__: JSON.stringify(build.dirty),
    },
    plugins: isCjs
      ? []
      : [
          dts({
            tsconfigPath: "./tsconfig.json",
            include: ["src"],
            exclude: [
              "src/**/*.test.ts",
              "src/**/*.test.tsx",
              "src/**/*.stories.tsx",
              "src/test/**",
              "src/test/**/*",
            ],
            aliasesExclude: [/^react(?:\/.*)?$/],
            rollupTypes: false,
            skipDiagnostics: true,
            logDiagnostics: false,
          }),
        ],
    build: {
      sourcemap: true,
      minify: false,
      emptyOutDir: !isCjs,
      lib: {
        entry,
        formats: [isCjs ? "cjs" : "es"],
        fileName: (_format, entryName) => `${entryName}.${jsExt}`,
      },
      rollupOptions: {
        external: (id) => {
          if (id.startsWith(".") || id.startsWith("/")) return false;
          return true;
        },
        output: {
          preserveModules: true,
          preserveModulesRoot: "src",
          entryFileNames: `[name].${jsExt}`,
          chunkFileNames: `chunks/[name]-[hash].${jsExt}`,
          assetFileNames: (asset) => {
            if (asset.names?.some((n) => n.endsWith(".css")))
              return "styles.css";
            return "assets/[name][extname]";
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      css: true,
      // vmThreads runs the suite about 3x faster than forks
      // (fixtures/benchmarks/vitest-pools.md). Files that cannot run inside a
      // VM context stay on forks. `include` is per project: extending
      // concatenates arrays, so a shared one would run every file on both.
      projects: [
        {
          extends: true,
          test: {
            name: "unit",
            pool: "vmThreads",
            include: [
              "src/**/*.test.{ts,tsx}",
              "oxlint-plugins/**/*.test.{ts,tsx}",
              "scripts/**/*.test.ts",
            ],
            exclude: [...configDefaults.exclude, ...VM_INCOMPATIBLE_TESTS],
          },
        },
        {
          extends: true,
          test: {
            name: "forks",
            pool: "forks",
            include: VM_INCOMPATIBLE_TESTS,
          },
        },
      ],
    },
  };
});
