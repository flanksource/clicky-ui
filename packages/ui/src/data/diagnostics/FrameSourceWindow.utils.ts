export interface FrameSource {
  /** Source lines around the focal line. */
  sourceLines?: string[];
  /** Absolute line number for each entry in sourceLines (preferred gutter). */
  sourceLineNumbers?: number[];
  /** Line number of sourceLines[0] when sourceLineNumbers is absent. */
  sourceStartLine?: number;
  /** The frame's focal line, highlighted when it falls inside the window. */
  line?: number;
}

export function frameHasSource(frame: FrameSource): boolean {
  return !!frame.sourceLines && frame.sourceLines.length > 0;
}
