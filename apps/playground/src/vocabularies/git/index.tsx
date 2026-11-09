import type { VocabularyDeclaration } from "@flanksource/clicky-ui/comments";
import { VocabularyPage } from "../_VocabularyPage";
import { GIT_VOCABULARY } from "./_items";
import Specimen from "./_specimen";

export const vocabulary = {
  alias: "git",
  instructions: "This vocabulary describes Git objects and their GitHub and Azure DevOps presentations. Read `git:type/key` as an object kind and provider variant: `git-object` is generic, `github-object` and `ado-object` link to their native host. Open the item's references, including `src/vocabularies/git/index.tsx`, the Git glossary and `packages/ui/src/data/git/git-links.ts` for provider routing. An explicit request to change to a reference selects that glyph and value presentation; a reference identifying an existing object describes its current presentation. Keep lifecycle colour separate from object identity, as the item descriptions specify.",
  items: GIT_VOCABULARY,
} satisfies VocabularyDeclaration;

export const meta = { title: "Git vocabulary", description: "Git objects and provider-specific icon and value specimens." };

export default function GitVocabulary() {
  return <VocabularyPage {...meta} items={vocabulary.items} specimen={item => <Specimen item={item} />} />;
}
