// The icons the call graph uses in place of words. The vocabulary decides which glyph a node gets;
// this file only draws it, picking a glyph's dark drawing in the dark theme.
import { useResolvedTheme } from "../../hooks/use-theme";
import {
  UiArrowRight,
  UiReadAccess,
  UiReadAccessDark,
  UiShowToImplement,
  UiShowToImplementDark,
  UiWriteAccess,
  UiWriteAccessDark,
  type IconComponent,
  type IconProps,
} from "../../icons";
import { requireGlyph, type CallGraphGlyph, type CallGraphVocabulary } from "./call-graph-vocabulary";
import type { CallGraphEdgeType } from "./types";

function Themed({ glyph, ...props }: IconProps & { glyph: Pick<CallGraphGlyph, "icon" | "darkIcon"> }) {
  const Icon = useResolvedTheme() === "dark" && glyph.darkIcon ? glyph.darkIcon : glyph.icon;
  return <Icon {...props} />;
}

export function GlyphIcon({ glyph, ...props }: IconProps & { glyph: CallGraphGlyph }) {
  return <Themed glyph={glyph} {...props} />;
}

export function NodeGlyphIcon({ vocabulary, glyph, ...props }: IconProps & { vocabulary: CallGraphVocabulary; glyph: string }) {
  return <Themed glyph={requireGlyph(vocabulary, glyph)} {...props} />;
}

// Each edge type's icon: a plain call is the arrow the graph draws; dispatch reaches one of several
// targets chosen at run time; a read and a write touch data.
const EDGE_GLYPHS: Record<CallGraphEdgeType, Pick<CallGraphGlyph, "icon" | "darkIcon">> = {
  call: { icon: UiArrowRight },
  dispatch: { icon: UiShowToImplement, darkIcon: UiShowToImplementDark },
  read: { icon: UiReadAccess, darkIcon: UiReadAccessDark },
  write: { icon: UiWriteAccess, darkIcon: UiWriteAccessDark },
};

export function EdgeTypeGlyph({ type, ...props }: IconProps & { type: CallGraphEdgeType }) {
  return <Themed glyph={EDGE_GLYPHS[type]} {...props} />;
}

/** A group box caption: the group icon, then the shortened label, kept inline so the caption still truncates. */
export function GroupCaption({ icon: Icon, caption }: { icon: IconComponent; caption: string }) {
  return (
    <>
      <Icon className="mr-1 inline-block align-[-0.15em]" />
      {caption}
    </>
  );
}
