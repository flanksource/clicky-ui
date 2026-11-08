import type { LibraryStyles } from "./recipe.ts";
import { TAILWIND_ROUTE } from "../../storage/db.ts";

/** Page-independent: the runtime version and each library's name, version and recipe-module integrity, in the order given. */
export function libraryKey(options: { libraries: LibraryStyles[]; runtimeVersion: string }): string {
  return JSON.stringify([options.runtimeVersion, ...options.libraries.map(({ name, version, integrity }) => {
    if (!integrity) throw new Error(`${name}: recipe module has no lock integrity, so its Tailwind output cannot be cached`);
    return [name, version, integrity];
  })]);
}

export async function cssCacheKey(options: { libraryKey: string; candidates: Iterable<string> }): Promise<string> {
  const bytes = new TextEncoder().encode(JSON.stringify([options.libraryKey, [...new Set(options.candidates)].sort()]));
  const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
  return Array.from(digest, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function tailwindCssUrl(options: { key: string; origin: string }): string {
  return new URL(`${TAILWIND_ROUTE}${options.key}.css`, options.origin).href;
}
