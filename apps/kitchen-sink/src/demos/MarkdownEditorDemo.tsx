import {
  MARKDOWN_SYNTAX_DOCUMENT,
  MarkdownEditor,
  mockMarkdownPreview,
} from "@flanksource/clicky-ui";
import { DemoSection } from "./Section";

export function MarkdownEditorDemo() {
  return (
    <DemoSection
      id="markdown-editor"
      title="MarkdownEditor"
      description="Split-pane markdown editing seeded with the full syntax reference. The React pane renders it locally; the other formats come from a mock Clicky backend standing in for a `format=` endpoint, deriving stats from the live buffer."
    >
      <MarkdownEditor
        defaultValue={MARKDOWN_SYNTAX_DOCUMENT}
        defaultPreviewFormat="react"
        previewDebounceMs={0}
        minHeight={640}
        loadPreview={mockMarkdownPreview}
      />
    </DemoSection>
  );
}
