import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { isAbsolute, join, posix } from "node:path";
import {
  documentPath,
  type DocumentRepository,
  type RepositoryFolder,
} from "../src/documents/types";

export class RepositoryDocuments {
  constructor(readonly directory: string) {}
  all(): DocumentRepository[] {
    const path = join(this.directory, "repositories.json");
    if (!existsSync(path)) return [];
    const data: unknown = JSON.parse(readFileSync(path, "utf8"));
    if (!Array.isArray(data)) throw new Error("Invalid repository catalog");
    const ids = new Set<string>();
    for (const repo of data) {
      if (
        !repo ||
        typeof repo !== "object" ||
        typeof repo.id !== "string" ||
        !/^[\da-f-]{36}$/.test(repo.id) ||
        ids.has(repo.id) ||
        typeof repo.root !== "string" ||
        !isAbsolute(repo.root) ||
        typeof repo.name !== "string" ||
        !Array.isArray(repo.folders)
      )
        throw new Error("Invalid repository catalog entry");
      for (const folder of repo.folders)
        this.validateFolder(folder as RepositoryFolder);
      ids.add(repo.id);
    }
    return data as DocumentRepository[];
  }
  add(input: { root: string; name: string }): DocumentRepository {
    if (!isAbsolute(input.root) || !input.name)
      throw new Error("Repository root and name are required");
    const all = this.all();
    const existing = all.find((repo) => repo.root === input.root);
    if (existing) return existing;
    const repo = {
      ...input,
      id: randomUUID(),
      folders: [{ path: ".", overrides: [] }],
    };
    this.write([...all, repo]);
    return repo;
  }
  folder(id: string, folder: RepositoryFolder): void {
    this.validateFolder(folder);
    const all = this.all();
    const repo = all.find((entry) => entry.id === id);
    if (!repo) throw new Error("Repository not registered");
    repo.folders = [
      ...repo.folders.filter((entry) => entry.path !== folder.path),
      folder,
    ];
    this.write(all);
  }
  document(id: string) {
    const { repositoryId, path } = id.startsWith("folder:")
      ? this.folderPath(id)
      : documentPath(id);
    const repository = this.all().find((entry) => entry.id === repositoryId);
    if (!repository) throw new Error("Repository not registered");
    return {
      repository,
      path,
      absolutePath: posix.join(repository.root, path),
    };
  }
  private folderPath(id: string) {
    const match = /^folder:([\da-f-]{36})\/(.+)$/.exec(id);
    if (!match?.[1] || !match[2] || ["\0", "\r", "\n"].some((character) => match[2]!.includes(character))) throw new Error("Invalid folder identity");
    this.validateFolder({ path: match[2], overrides: [] });
    return { repositoryId: match[1], path: match[2] };
  }
  private validateFolder(folder: RepositoryFolder): void {
    if (
      !folder ||
      typeof folder.path !== "string" ||
      (folder.path !== "." &&
        (folder.path.startsWith("/") ||
          folder.path
            .split("/")
            .some((part) => !part || [".", "..", ".git"].includes(part)))) ||
      folder.path.includes("\\") ||
      !Array.isArray(folder.overrides) ||
      folder.overrides.some(
        (rule) =>
          typeof rule !== "string" ||
          ["\0", "\r", "\n"].some((character) => rule.includes(character)),
      )
    )
      throw new Error("Invalid folder settings");
  }
  private write(all: DocumentRepository[]): void {
    mkdirSync(this.directory, { recursive: true });
    const path = join(this.directory, "repositories.json");
    writeFileSync(`${path}.tmp`, `${JSON.stringify(all, null, 2)}\n`, "utf8");
    renameSync(`${path}.tmp`, path);
  }
}
