import type { SourceProvider } from "../schema.ts";
import { validateSourcePath } from "../host/validation.ts";

export function validateSourceProvider(provider: SourceProvider): void {
  const url = new URL(provider.url);
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) throw new Error("source provider requires an HTTP origin and path");
  if (!Array.isArray(provider.paths)) throw new Error("source provider requires a path index");
  for (const path of provider.paths) validateSourcePath(path);
}

export async function fetchSource(options: { provider: SourceProvider; path: string; fetch: typeof fetch }): Promise<Response> {
  validateSourceProvider(options.provider);
  validateSourcePath(options.path);
  if (!options.provider.paths.includes(options.path)) throw new Error(`source ${options.path} is outside the approved path index`);
  const url = `${options.provider.url.replace(/\/$/, "")}/${options.path.split("/").map(encodeURIComponent).join("/")}`;
  const fetcher = options.fetch;
  const response = await fetcher(url, { credentials: "omit", redirect: "error" });
  if (!response.ok) throw new Error(`source ${options.path}: HTTP ${response.status}`);
  return response;
}
