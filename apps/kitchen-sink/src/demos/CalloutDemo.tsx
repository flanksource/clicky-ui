import { Callout, CALLOUT_TONES, Markdown } from "@flanksource/clicky-ui";
import { MdxEditorField } from "@flanksource/clicky-ui/mdx-editor";
import { useState } from "react";
import { DemoSection } from "./Section";

const AUTHORED = [
  "Callouts are authored inline in the markdown:",
  "",
  '<CalloutBox variant="caution" badge="BCR-08" label="Gap" source="Policy Owner">',
  "",
  "Recovery time objectives are stated but not yet evidenced by a test.",
  "",
  "</CalloutBox>",
  "",
  '<CalloutBox variant="warning" label="TODO" icon="important" emphasis="true">',
  "",
  "Run the first tabletop exercise and retain the record.",
  "",
  "</CalloutBox>",
].join("\n");

export function CalloutDemo() {
  const [markdown, setMarkdown] = useState(AUTHORED);

  return (
    <DemoSection
      id="callout"
      title="Callout"
      description="An emphasised aside whose five tones mirror GitHub's alert types. Markdown renders authored <CalloutBox> tags through it when `callouts` is set, and MdxEditorField edits them in place — tone, label, badge and attribution as controls rather than raw attributes."
    >
      <div>
        {CALLOUT_TONES.map((tone) => (
          <Callout key={tone} variant={tone}>
            {`A ${tone} callout, labelled with its own tone name.`}
          </Callout>
        ))}
        <Callout>An untinted default callout draws no header row at all.</Callout>
      </div>

      <h3 className="text-sm font-semibold">Edited</h3>
      <MdxEditorField
        aria-label="Callout markdown"
        callouts
        headings
        lists
        links
        toolbar
        value={markdown}
        onChange={setMarkdown}
      />

      <h3 className="text-sm font-semibold">Rendered</h3>
      <Markdown callouts text={markdown} />
    </DemoSection>
  );
}
