import { documentSourcePath } from "./catalog";

export function pageSourcePath(page: string): string {
  if (page.startsWith("document:")) return documentSourcePath(page);
  return `apps/playground/src/pages/${page}.tsx`;
}
