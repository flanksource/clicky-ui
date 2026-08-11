
export function resolveProfileUpdatePath(path: string, id: string): string {
  return path.replace("{id}", encodeURIComponent(id)).replace(":id", encodeURIComponent(id));
}
