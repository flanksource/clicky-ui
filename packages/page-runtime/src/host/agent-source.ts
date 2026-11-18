import { parseEditableSource } from "../markers.ts";

export function isPageSource(source: string): boolean {
  if (/^(?:file|data|blob|javascript):/i.test(source)) return false;
  if (source.includes("#")) {
    try { parseEditableSource(source); } catch { return false; }
  } else if (!/^.+:[1-9]\d*:[1-9]\d*$/.test(source)) return false;
  return !/(?:^|\/)(?:node_modules|npm|link|entry|__runtime)\/|(?:^|\/)packages\/(?:ui|react-grab|facet)\//.test(source);
}

export function validateDocumentSource(url: string): void {
  const parsed = new URL(url);
  if (!["http:", "https:", "file:"].includes(parsed.protocol) || parsed.href !== url || parsed.username || parsed.password) throw new Error("external-document source requires a canonical credential-free HTTP(S) or file document URL");
}
