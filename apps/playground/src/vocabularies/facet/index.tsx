import type { VocabularyDeclaration } from "@flanksource/clicky-ui/comments";
import { VocabularyPage } from "../_VocabularyPage";
import { FACET_VOCABULARY } from "./_items";
import Specimen from "./_specimen";

export const vocabulary = {
  alias: "facet",
  instructions: "This vocabulary describes Facet diagram elements, layouts, styling and density choices. Read `facet:type/key` as a reference to the declared type and variant, not a new component name. Open the item's source references in `src/vocabularies/facet/specimens` and the matching Facet implementation before editing a diagram. When a comment asks to use or change to a reference, apply that variant according to its description; when it identifies an existing element, read it as the current presentation rather than an instruction to change it.",
  items: FACET_VOCABULARY,
} satisfies VocabularyDeclaration;

export const meta = { title: "Facet vocabulary", description: "Diagram elements, layouts, styling and density specimens." };

export default function FacetVocabulary() {
  return <VocabularyPage {...meta} items={vocabulary.items} specimen={item => <Specimen item={item} />} />;
}
