import type { PageLock } from "@flanksource/page-runtime/schema";
import type { Project } from "../project";
import type { Directory } from "./directory";

export type SourceProvider = {
  directory?: Directory;
  id: string;
  label: string;
  saveLabel: string;
  read(): Promise<Project | null>;
  save(project: Project): Promise<void>;
  saveLocks(locks: Record<string, PageLock>): Promise<void>;
};
