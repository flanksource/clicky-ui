import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: "./tsconfig.json",
      include: ["src"],
      exclude: ["src/**/*.test.ts", "src/**/*.test.tsx", "src/**/*.stories.tsx", "src/test/**"],
      rollupTypes: false,
    }),
  ],
  build: {
    sourcemap: true,
    minify: false,
    emptyOutDir: true,
    lib: {
      entry: {
        index: resolve(__dirname, "src/index.ts"),
        "api-explorer": resolve(__dirname, "src/api-explorer.ts"),
        "tailwind-preset": resolve(__dirname, "src/tailwind-preset.ts"),
        styles: resolve(__dirname, "src/styles.ts"),
      },
      formats: ["es"],
      fileName: (_format, entryName) => `${entryName}.js`,
    },
    rollupOptions: {
      external: (id) => {
        if (id.startsWith(".") || id.startsWith("/")) return false;
        return true;
      },
      output: {
        preserveModules: true,
        preserveModulesRoot: "src",
        entryFileNames: "[name].js",
        chunkFileNames: "chunks/[name]-[hash].js",
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
});
