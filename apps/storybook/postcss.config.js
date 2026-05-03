import autoprefixer from "autoprefixer";
import tailwindcss from "tailwindcss";

const tailwind = tailwindcss({ config: "./tailwind.config.ts" });

function shouldSkipTailwind(root) {
  return root.source?.input.file?.endsWith("/packages/ui/dist/styles.css") === true;
}

const tailwindPlugins = tailwind.plugins.map((plugin) => {
  if (typeof plugin !== "function") return plugin;
  const wrapped = async (root, result) => {
    if (shouldSkipTailwind(root)) return;
    return plugin(root, result);
  };
  return wrapped;
});

export default {
  plugins: [
    {
      postcssPlugin: "tailwindcss-skip-clicky-prebuilt",
      plugins: tailwindPlugins,
    },
    autoprefixer(),
  ],
};
