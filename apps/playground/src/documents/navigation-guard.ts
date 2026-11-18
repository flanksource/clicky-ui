const drafts = new Set<string>();
export function setDocumentDirty(id: string, dirty: boolean) {
  if (dirty) drafts.add(id);
  else drafts.delete(id);
}
export function allowDocumentNavigation(page: string) {
  return (
    [...drafts].every((id) => id === page) ||
    window.confirm("Discard unsaved document changes?")
  );
}
