import { randomUUID } from "node:crypto";
import {
  existsSync,
  mkdirSync,
  readFileSync,
  renameSync,
  writeFileSync,
} from "node:fs";
import { join } from "node:path";
import { externalUrl, type ExternalPage } from "../src/bookmarklet/model";

export function readExternalPages(dir: string): ExternalPage[] {
  const path = join(dir, "external-pages.json");
  if (!existsSync(path)) return [];
  const data: unknown = JSON.parse(readFileSync(path, "utf8"));
  if (!Array.isArray(data)) throw new Error(`${path}: expected an array`);
  const ids = new Set<string>();
  const urls = new Set<string>();
  for (const value of data) {
    if (
      !value ||
      typeof value !== "object" ||
      typeof value.id !== "string" ||
      !/^external:[\da-f-]{36}$/.test(value.id) ||
      typeof value.title !== "string" ||
      typeof value.base !== "string" ||
      !Array.isArray(value.urls) ||
      !value.urls.length ||
      ids.has(value.id)
    ) {
      throw new Error(`${path}: invalid external page record`);
    }
    ids.add(value.id);
    for (const url of value.urls) {
      if (
        typeof url !== "string" ||
        externalUrl(url).url !== url ||
        externalUrl(url).base !== value.base ||
        urls.has(url)
      ) {
        throw new Error(`${path}: invalid or duplicate URL association`);
      }
      urls.add(url);
    }
  }
  return data as ExternalPage[];
}

export function associateExternalPage(
  dir: string,
  input: Record<string, unknown>,
): ExternalPage {
  if (
    Object.keys(input).some(
      (key) => !["url", "title", "mergeInto"].includes(key),
    )
  ) {
    throw new Error("Unexpected external-page field");
  }
  if (
    typeof input["url"] !== "string" ||
    typeof input["title"] !== "string" ||
    !input["title"].trim()
  ) {
    throw new Error("External page url and title are required");
  }
  const target = externalUrl(input["url"]);
  const pages = readExternalPages(dir);
  const existing = pages.find((page) => page.urls.includes(target.url));
  if (existing) {
    if (
      input["mergeInto"] !== undefined &&
      input["mergeInto"] !== existing.id
    ) {
      throw new Error("This URL already belongs to another comment set");
    }
    return existing;
  }
  let page: ExternalPage;
  if (input["mergeInto"] !== undefined) {
    const found = pages.find((entry) => entry.id === input["mergeInto"]);
    if (!found || found.base !== target.base)
      throw new Error(
        "Merge requires an existing set for the same origin, path and fragment",
      );
    page = found;
    page.urls.push(target.url);
  } else {
    page = {
      id: `external:${randomUUID()}`,
      title: input["title"].trim(),
      base: target.base,
      urls: [target.url],
    };
    pages.push(page);
  }
  mkdirSync(dir, { recursive: true });
  const path = join(dir, "external-pages.json");
  writeFileSync(`${path}.tmp`, `${JSON.stringify(pages, null, 2)}\n`, "utf8");
  renameSync(`${path}.tmp`, path);
  return page;
}
