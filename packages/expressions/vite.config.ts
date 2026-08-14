import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Two entries: the language support alone, and the playground UI over it. A
// host that only wants highlighting in its own editor should not pull React,
// clicky-ui and the Monaco editor in with it.
const entry = {
  index: resolve(__dirname, "src/index.ts"),
  playground: resolve(__dirname, "src/playground.ts"),
};

export default defineConfig(({ mode }) => {
  const isCjs = mode === "cjs";
  const jsExt = isCjs ? "cjs" : "js";

  return {
    plugins: isCjs
      ? []
      : [
          react(),
          dts({ tsconfigPath: "./tsconfig.json", include: ["src"], rollupTypes: false }),
        ],
    build: {
      emptyOutDir: !isCjs,
      lib: {
        entry,
        formats: [isCjs ? "cjs" : "es"],
        fileName: (_format, name) => `${name}.${jsExt}`,
      },
      rollupOptions: {
        external: [
          "react",
          "react-dom",
          "react/jsx-runtime",
          "monaco-editor",
          /^monaco-editor\//,
          /^@flanksource\/clicky-ui/,
          "yaml",
        ],
        output: { preserveModules: false },
      },
    },
  };
});
