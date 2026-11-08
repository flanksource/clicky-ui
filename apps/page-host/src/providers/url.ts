import { parseProject, type Project } from "../project";
import { browserProject } from "./browser-store";
import type { SourceProvider } from "./types";

export function urlProvider(options: { url: string; manifest: string; fetch?: typeof fetch }): SourceProvider {
  const url = new URL(options.url);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) throw new Error("Source URL must be HTTP(S) without credentials");
  const key = `url:${url.href}`;
  let remote: Project | null = null;
  return {
    id: key, label: url.href, saveLabel: "Save browser copy",
    async read() {
      const response = await (options.fetch ?? fetch)(url.href, { mode: "cors", credentials: "omit" });
      if (!response.ok) throw new Error(`${url.href}: HTTP ${response.status}`);
      const text = await response.text();
      const name = decodeURIComponent(url.pathname.split("/").at(-1) ?? "");
      remote = /\.(tsx|jsx|mdx)$/.test(name)
        ? parseProject({ format: 1, name, entry: name, files: { [name]: text, "package.json": options.manifest }, locks: {} })
        : parseProject(JSON.parse(text));
      const saved = await browserProject({ key });
      return saved ?? remote;
    },
    async save(project) { await browserProject({ key, project }); },
    async saveLocks(locks) {
      const saved = await browserProject({ key });
      if (!saved && !remote) throw new Error("read URL project before saving its lock");
      await browserProject({ key, project: { ...(saved ?? remote!), locks } });
    },
  };
}
