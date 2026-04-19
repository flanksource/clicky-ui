// 16 Tailwind bg/text pairs chosen for WCAG AA contrast at small avatar sizes.
// Add/remove entries carefully — the index is hash-derived and must stay stable.
export const AVATAR_PALETTE: readonly string[] = [
  "bg-rose-100 text-rose-700",
  "bg-pink-100 text-pink-700",
  "bg-fuchsia-100 text-fuchsia-700",
  "bg-purple-100 text-purple-700",
  "bg-violet-100 text-violet-700",
  "bg-indigo-100 text-indigo-700",
  "bg-blue-100 text-blue-700",
  "bg-sky-100 text-sky-700",
  "bg-cyan-100 text-cyan-700",
  "bg-teal-100 text-teal-700",
  "bg-emerald-100 text-emerald-700",
  "bg-green-100 text-green-700",
  "bg-lime-100 text-lime-800",
  "bg-amber-100 text-amber-800",
  "bg-orange-100 text-orange-700",
  "bg-red-100 text-red-700",
];

// Deterministic 32-bit FNV-1a hash. Same input → same output across sessions.
export function fnv1a32(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export function paletteClass(key: string): string {
  return AVATAR_PALETTE[fnv1a32(key) % AVATAR_PALETTE.length]!;
}
