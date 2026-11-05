import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { statSync } from "node:fs";
import { pagePath } from "./pages-store";
import { RepositoryDocuments } from "./repository-documents";

export function sessionScopeDirectory({ page, dir, cwd }: { page: string; dir: string; cwd: string }): string {
  if (page.startsWith("document:") || page.startsWith("folder:")) {
    const target = new RepositoryDocuments(dir).document(page);
    return page.startsWith("folder:") ? target.absolutePath : dirname(target.absolutePath);
  }
  const file = pagePath(join(cwd, "apps/playground/src/pages"), page);
  if (!statSync(file).isFile()) throw new Error(`Page ${page} is not a file`);
  return dirname(file);
}

export function cwdInSessionScope(cwd: string, directory: string): boolean {
  const path = relative(resolve(directory), resolve(cwd));
  return path === "" || (path !== ".." && !path.startsWith("../") && !isAbsolute(path));
}
