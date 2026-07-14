import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { format } from "prettier";
import reactDocgen from "react-docgen-typescript";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../../..");
const uiRoot = path.join(repoRoot, "packages/ui");
const srcRoot = path.join(uiRoot, "src");
const outputRoot = path.join(
  repoRoot,
  "apps/docs/src/content/docs/reference/components",
);

const publicEntrypoints = [
  "components.ts",
  "data.ts",
  "comments.ts",
  "clicky.ts",
  "rpc.ts",
  "chat.ts",
  "ai.ts",
  "hooks.ts",
  "jotai.ts",
  "mdx-editor.ts",
];

const componentGroups = [
  { slug: "inputs-layout", label: "Inputs & layout" },
  { slug: "data-display", label: "Data display" },
  { slug: "ai", label: "AI" },
  { slug: "chat", label: "Chat" },
  { slug: "comments", label: "Comments" },
  { slug: "rpc", label: "RPC" },
  { slug: "diagnostics", label: "Diagnostics" },
  { slug: "cache", label: "Cache" },
  { slug: "git", label: "Git" },
  { slug: "test-runner", label: "Test runner" },
  { slug: "other", label: "Other" },
];

function sourcePath(filePath) {
  return path.relative(repoRoot, filePath).split(path.sep).join("/");
}

async function writeIfChanged(filePath, content) {
  let previous = "";
  try {
    previous = await fs.readFile(filePath, "utf8");
  } catch {
    // The first generation creates the page.
  }
  if (previous === content) return false;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
  return true;
}

async function markdownFiles(directory) {
  const files = [];
  let entries = [];
  try {
    entries = await fs.readdir(directory, { withFileTypes: true });
  } catch {
    return files;
  }
  for (const entry of entries) {
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await markdownFiles(filePath)));
    if (entry.isFile() && entry.name.endsWith(".md")) files.push(filePath);
  }
  return files;
}

function slugify(value) {
  return value
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function groupFor(filePath) {
  const source = sourcePath(filePath);
  if (source.includes("/data/ai/")) return "ai";
  if (source.includes("/data/chat/")) return "chat";
  if (source.includes("/comments/")) return "comments";
  if (source.includes("/rpc/")) return "rpc";
  if (source.includes("/data/diagnostics/")) return "diagnostics";
  if (source.includes("/data/cache-browser/")) return "cache";
  if (source.includes("/data/git/")) return "git";
  if (source.includes("/data/test-runner/")) return "test-runner";
  if (
    source.includes("/components/") ||
    source.includes("/layout/") ||
    source.includes("/overlay/")
  ) {
    return "inputs-layout";
  }
  if (source.includes("/data/")) return "data-display";
  return "other";
}

function importPathFor(filePath) {
  const source = sourcePath(filePath);
  if (source.includes("/data/ai/")) return "ai";
  if (source.includes("/data/chat/")) return "chat";
  if (source.includes("/comments/")) return "comments";
  if (source.includes("/rpc/")) return "rpc";
  if (source.includes("/hooks/")) return "hooks";
  if (
    source.includes("/components/") ||
    source.includes("/layout/") ||
    source.includes("/overlay/")
  ) {
    return "components";
  }
  return "data";
}

async function resolveModule(fromFile, specifier) {
  if (!specifier.startsWith(".")) return undefined;
  const base = path.resolve(path.dirname(fromFile), specifier);
  const candidates = [
    `${base}.tsx`,
    `${base}.ts`,
    path.join(base, "index.tsx"),
    path.join(base, "index.ts"),
  ];
  for (const candidate of candidates) {
    try {
      const stat = await fs.stat(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      // Try the next TypeScript module shape.
    }
  }
  return undefined;
}

async function publicSourceFiles() {
  const files = new Set();
  const visited = new Set();

  async function visit(file) {
    if (visited.has(file)) return;
    visited.add(file);
    if (file.startsWith(`${path.join(srcRoot, "icons")}${path.sep}`)) return;
    if (file.endsWith(".tsx")) files.add(file);

    const source = await fs.readFile(file, "utf8");
    const exports = source.matchAll(
      /export\s+(?:\*|\{[^}]*\})\s+from\s+["']([^"']+)["']/g,
    );
    for (const match of exports) {
      const resolved = await resolveModule(file, match[1]);
      if (resolved) await visit(resolved);
    }
  }

  for (const entrypoint of publicEntrypoints) {
    await visit(path.join(srcRoot, entrypoint));
  }
  return [...files].sort();
}

function plainText(value) {
  return String(value ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

function html(value) {
  return plainText(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function displayType(typeName) {
  const full = plainText(typeName) || "unknown";
  let parentheses = 0;
  let brackets = 0;
  let braces = 0;
  let arrowIndex = -1;

  for (let index = 0; index < full.length - 1; index += 1) {
    const character = full[index];
    if (character === "(") parentheses += 1;
    if (character === ")") parentheses = Math.max(0, parentheses - 1);
    if (character === "[") brackets += 1;
    if (character === "]") brackets = Math.max(0, brackets - 1);
    if (character === "{") braces += 1;
    if (character === "}") braces = Math.max(0, braces - 1);
    if (
      character === "=" &&
      full[index + 1] === ">" &&
      parentheses === 0 &&
      brackets === 0 &&
      braces === 0
    ) {
      arrowIndex = index;
      break;
    }
  }

  if (arrowIndex < 0 && !full.includes("=>")) {
    return { display: full, full, isFunction: false };
  }

  const returnType =
    arrowIndex < 0 ? "…" : full.slice(arrowIndex + 2).trim() || "…";
  return {
    display: `(…) => ${returnType.length > 32 ? "…" : returnType}`,
    full,
    isFunction: true,
  };
}

function storyLabel(exportName) {
  return exportName.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replaceAll("_", " ");
}

async function storiesFor(filePath) {
  const storyFile = filePath.replace(/\.tsx$/, ".stories.tsx");
  let source;
  try {
    source = await fs.readFile(storyFile, "utf8");
  } catch {
    return [];
  }

  const title = source.match(
    /const\s+meta[^=]*=\s*\{[\s\S]*?\btitle:\s*["']([^"']+)["']/,
  )?.[1];
  if (!title) return [];
  const exports = [
    ...source.matchAll(/export\s+const\s+([A-Za-z0-9_]+)\s*:/g),
  ].map((match) => match[1]);
  const ordered = [
    ...exports.filter((name) => name === "Default"),
    ...exports.filter((name) => name !== "Default"),
  ];
  const titleSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return ordered.slice(0, 3).map((exportName) => ({
    id: `${titleSlug}--${slugify(exportName)}`,
    label: storyLabel(exportName),
  }));
}

function demoMarkup(stories) {
  if (stories.length === 0) {
    return [
      "## Demos",
      "",
      "No dedicated Storybook demo is available for this component yet.",
      "",
    ];
  }
  const lines = ["## Demos", "", '<div class="component-demo-grid">', ""];
  for (const story of stories) {
    lines.push(
      '<figure class="component-demo">',
      `  <iframe src="/storybook/iframe.html?id=${story.id}&amp;viewMode=story" title="${story.label} demo" loading="lazy"></iframe>`,
      `  <figcaption><strong>${story.label}</strong> · <a href="/storybook/?path=/story/${story.id}">Open in Storybook</a></figcaption>`,
      "</figure>",
      "",
    );
  }
  lines.push("</div>", "");
  return lines;
}

function propsTable(component) {
  const props = Object.entries(component.props ?? {}).sort(([a], [b]) =>
    a.localeCompare(b),
  );
  if (props.length === 0) {
    return ["## Props", "", "This component has no documented props.", ""];
  }

  const lines = [
    "## Props",
    "",
    '<div class="api-props-table-wrap">',
    '<table class="api-props-table">',
    "<thead>",
    "<tr>",
    '<th scope="col" class="api-prop-name">Prop</th>',
    '<th scope="col">Type</th>',
    '<th scope="col">Default</th>',
    '<th scope="col">Description</th>',
    "</tr>",
    "</thead>",
    "<tbody>",
  ];
  for (const [name, prop] of props) {
    const type = displayType(prop.type?.name);
    const typeAttributes = type.isFunction
      ? ` title="${html(type.full)}" aria-label="${html(type.full)}"`
      : "";
    const typeClass = type.isFunction ? " api-type-function" : "";
    const requiredMarker = prop.required
      ? '<span class="api-required-marker" title="Required" aria-label="Required">*</span>'
      : "";
    const defaultValue = prop.defaultValue?.value
      ? `<code>${html(prop.defaultValue.value)}</code>`
      : "—";
    lines.push(
      "<tr>",
      `<th scope="row" class="api-prop-name"><code>${html(name)}</code>${requiredMarker}</th>`,
      `<td class="api-prop-type"><code class="api-type${typeClass}"${typeAttributes}>${html(type.display)}</code></td>`,
      `<td>${defaultValue}</td>`,
      `<td>${html(prop.description) || "—"}</td>`,
      "</tr>",
    );
  }
  lines.push("</tbody>", "</table>", "</div>", "");
  return lines;
}

async function componentDocument(component) {
  const description =
    component.description?.replace(/\s+/g, " ").trim() ||
    `API reference and demos for ${component.displayName}.`;
  const stories = await storiesFor(component.filePath);
  const importPath = importPathFor(component.filePath);
  return format(
    [
      "---",
      `title: ${JSON.stringify(component.displayName)}`,
      `description: ${JSON.stringify(description)}`,
      "editUrl: false",
      "---",
      "",
      "<!-- Generated by apps/docs/scripts/generate-component-api.mjs. Do not edit by hand. -->",
      "",
      description,
      "",
      `[Source](https://github.com/flanksource/clicky-ui/blob/main/${sourcePath(component.filePath)})`,
      "",
      "## Import",
      "",
      "```tsx",
      `import { ${component.displayName} } from \"@flanksource/clicky-ui/${importPath}\";`,
      "```",
      "",
      ...demoMarkup(stories),
      "The props table documents the component-specific surface. Standard DOM attributes inherited from React, such as `className`, event handlers, and accessibility attributes, may also be accepted when the component's prop type extends a native element.",
      "",
      ...propsTable(component),
    ].join("\n"),
    { parser: "markdown" },
  );
}

function overviewDocument(grouped) {
  const lines = [
    "---",
    "title: Component reference",
    "description: Generated API pages and live Storybook demos for Clicky UI components.",
    "editUrl: false",
    "---",
    "",
    "Each public React component has its own generated page containing live Storybook demos and a `react-docgen-typescript` props table.",
    "",
  ];
  for (const group of componentGroups) {
    const items = grouped.get(group.slug) ?? [];
    if (items.length === 0) continue;
    lines.push(`## ${group.label}`, "");
    for (const component of items) {
      lines.push(
        `- [${component.displayName}](./${group.slug}/${slugify(component.displayName)}/)`,
      );
    }
    lines.push("");
  }
  return format(lines.join("\n"), { parser: "markdown" });
}

const files = await publicSourceFiles();
const parser = reactDocgen.withCustomConfig(
  path.join(uiRoot, "tsconfig.json"),
  {
    propFilter: (prop) => !prop.parent?.fileName.includes("node_modules"),
    savePropValueAsString: true,
    shouldExtractLiteralValuesFromEnum: true,
    shouldRemoveUndefinedFromOptional: true,
  },
);
const seenComponents = new Set();
const components = parser
  .parse(files)
  .filter((component) => {
    if (!component.displayName || !component.filePath) return false;
    if (!/^[A-Z]/.test(component.displayName)) return false;
    if (seenComponents.has(component.displayName)) return false;
    seenComponents.add(component.displayName);
    return true;
  })
  .sort((a, b) => a.displayName.localeCompare(b.displayName));

if (components.length === 0) {
  throw new Error("react-docgen-typescript did not find any public components");
}

const grouped = new Map();
for (const component of components) {
  const group = groupFor(component.filePath);
  const items = grouped.get(group) ?? [];
  items.push(component);
  grouped.set(group, items);
}

await fs.mkdir(outputRoot, { recursive: true });
const expectedFiles = new Set();
let changed = 0;
const overviewFile = path.join(outputRoot, "index.md");
expectedFiles.add(overviewFile);
if (await writeIfChanged(overviewFile, await overviewDocument(grouped))) {
  changed += 1;
}

await Promise.all(
  components.map(async (component) => {
    const group = groupFor(component.filePath);
    const outputFile = path.join(
      outputRoot,
      group,
      `${slugify(component.displayName)}.md`,
    );
    expectedFiles.add(outputFile);
    if (await writeIfChanged(outputFile, await componentDocument(component))) {
      changed += 1;
    }
  }),
);

let removed = 0;
for (const existingFile of await markdownFiles(outputRoot)) {
  if (expectedFiles.has(existingFile)) continue;
  await fs.unlink(existingFile);
  removed += 1;
}

console.log(
  `Component API: ${components.length} pages, ${changed} updated, ${removed} removed`,
);
