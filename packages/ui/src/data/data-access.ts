/** How a name is accessed: only read, only written, or both. */
export type DataAccess = "read" | "write" | "readwrite";

/** The access of a name `held` was known for, once `next` is seen too: the same, or both when they differ. */
export function mergeAccess(held: DataAccess | undefined, next: DataAccess): DataAccess {
  if (held === undefined || held === next) return next;
  return "readwrite";
}
