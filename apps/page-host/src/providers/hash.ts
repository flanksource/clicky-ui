import { parseProject, type Project } from "../project";
import type { SourceProvider } from "./types";

export async function encodeHash(project: Project): Promise<string> {
  parseProject(project);
  const bytes = await transform(new TextEncoder().encode(JSON.stringify(project)), new CompressionStream("deflate"));
  return `#page=${btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join("")).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "")}`;
}

export async function decodeHash(hash: string): Promise<Project> {
  const encoded = new URLSearchParams(hash.replace(/^#/, "")).get("page");
  if (!encoded) throw new Error("URL hash requires a page payload");
  const bytes = Uint8Array.from(atob(encoded.replaceAll("-", "+").replaceAll("_", "/")), (char) => char.charCodeAt(0));
  return parseProject(JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(await transform(bytes, new DecompressionStream("deflate")))));
}

async function transform(bytes: Uint8Array<ArrayBuffer>, codec: CompressionStream | DecompressionStream): Promise<Uint8Array<ArrayBuffer>> {
  const stream = new ReadableStream({ start(controller) { controller.enqueue(bytes); controller.close(); } });
  return new Uint8Array(await new Response(stream.pipeThrough(codec)).arrayBuffer());
}

export function hashProvider(): SourceProvider {
  const write = async (project: Project) => history.replaceState(null, "", `${location.pathname}${location.search}${await encodeHash(project)}`);
  return {
    id: "hash", label: "URL hash", saveLabel: "Save to URL",
    read: async () => decodeHash(location.hash),
    save: write,
    saveLocks: async (locks) => write({ ...await decodeHash(location.hash), locks }),
  };
}
