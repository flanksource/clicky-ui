import { useLayoutEffect } from "react";
import { VocabularyPreview } from "@flanksource/clicky-ui/comments";

export default function VocabularyPage(props: { onReady: () => void }) {
  useLayoutEffect(props.onReady, [props.onReady]);
  return <main>
    <VocabularyPreview id="circle"><div style={{ width: 120, height: 80, background: "red" }}>Circle</div></VocabularyPreview>
    <VocabularyPreview id="square"><div style={{ width: 80, height: 60, background: "blue" }}>Square</div></VocabularyPreview>
  </main>;
}
