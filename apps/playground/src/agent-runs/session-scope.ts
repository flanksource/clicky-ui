export function pageInSessionScope(candidate: string, page: string): boolean {
  if (candidate === page) return true;
  if (!page.startsWith("folder:")) return false;
  const prefix = page.slice("folder:".length);
  const slash = prefix.indexOf("/");
  const repository = prefix.slice(0, slash);
  const folder = prefix.slice(slash + 1);
  return ["document:", "folder:"].some(kind => {
    if (!candidate.startsWith(`${kind}${repository}/`)) return false;
    const path = candidate.slice(kind.length + repository.length + 1);
    return folder === "." || path === folder || path.startsWith(`${folder}/`);
  });
}
