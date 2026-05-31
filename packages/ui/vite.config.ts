import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

const entry = {
  index: resolve(__dirname, "src/index.ts"),
  utils: resolve(__dirname, "src/utils.ts"),
  hooks: resolve(__dirname, "src/hooks.ts"),
  components: resolve(__dirname, "src/components.ts"),
  data: resolve(__dirname, "src/data.ts"),
  icons: resolve(__dirname, "src/icons.ts"),
  clicky: resolve(__dirname, "src/clicky.ts"),
  rpc: resolve(__dirname, "src/rpc.ts"),
  "tailwind-preset": resolve(__dirname, "src/tailwind-preset.ts"),
  styles: resolve(__dirname, "src/styles.ts"),
};

export default defineConfig(({ mode }) => {
  const isCjs = mode === "cjs";
  const jsExt = isCjs ? "cjs" : "js";

  return {
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
            if (asset.names?.some((n) => n.endsWith(".css"))) return "styles.css";
            return "assets/[name][extname]";
          },
        },
      },
    },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
      css: true,
    },
  };
});
