import type { editor, IDisposable } from "monaco-editor";
export type SourceCommentRange = {
  id: string;
  startLine: number;
  endLine: number;
};
export type SourceComments = {
  ranges: SourceCommentRange[];
  onSelect: (id: string) => void;
  /** Starts a thread on a line range; without it threads can be opened but not started. */
  onCreate?: ((range: { startLine: number; endLine: number }) => void) | undefined;
  /** Whether a gutter click on a line with no thread starts one; defaults to every line. */
  canCreateOnLine?: (line: number) => boolean;
};
export function sourceCommentActions(
  instance: editor.IStandaloneCodeEditor,
  current: () => SourceComments | undefined,
): IDisposable {
  const action = current()?.onCreate
    ? instance.addAction({
        id: "comment-selection",
        label: "Comment on selection",
        contextMenuGroupId: "navigation",
        contextMenuOrder: 2,
        run: () => {
          const selection = instance.getSelection();
          if (selection)
            current()?.onCreate?.({
              startLine: selection.startLineNumber,
              endLine:
                selection.endColumn === 1 &&
                selection.endLineNumber > selection.startLineNumber
                  ? selection.endLineNumber - 1
                  : selection.endLineNumber,
            });
        },
      })
    : undefined;
  instance.updateOptions({ glyphMargin: true });
  const mouse = instance.onMouseDown((event) => {
    if (event.target.type !== 2 || !event.target.position) return;
    const line = event.target.position.lineNumber;
    const match = current()?.ranges.find(
      (range) => range.startLine <= line && range.endLine >= line,
    );
    if (match) current()?.onSelect(match.id);
    else if (current()?.canCreateOnLine?.(line) !== false)
      current()?.onCreate?.({ startLine: line, endLine: line });
  });
  return {
    dispose() {
      action?.dispose();
      mouse.dispose();
    },
  };
}
