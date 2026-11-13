import type { Plugin } from "rolldown";

export function reactExternals(): Plugin {
  const prefix = "\0page-runtime-react:";
  return {
    name: "page-runtime-react-externals",
    resolveId(source, importer, { kind }) {
      if (source.startsWith(prefix)) return source;
      if (!/^react(?:-dom)?(?:\/|$)/.test(source)) return null;
      if (kind === "require-call" && !importer?.startsWith(prefix)) return prefix + source;
      return { id: source, external: true };
    },
    load(id) {
      if (!id.startsWith(prefix)) return null;
      return `import value from ${JSON.stringify(id.slice(prefix.length))}; module.exports = value;`;
    },
  };
}
