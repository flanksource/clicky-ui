import type { ReactNode } from "react";
import { VOCABULARY_CATALOG } from "./catalog";
import { BoxStyles, BoxColors, BoxDensities, BoxTagVariants, CanvasBackgrounds, CanvasFrames, ContainerStyles, ContainerColors, ContainerDensities, ActorStyles, ActorColors, ActorDensities, RailTypes, RailColors, RailStyles, CalloutStyles } from "./elements";
import { LineStyles, LineColors, LineDensities } from "./lines";
import { ArchitectureElements, ProtocolFlows, ProtocolInterfaces } from "./protocols-and-elements";
import { AuthorizationModels } from "./authorization";
import { ProductStyles } from "./products";
import { HeadingStyles } from "./headings";
import { LayoutPlacements, LayoutSchemes, LayoutThemes, NodeShowcase } from "./layouts";
export * from "./elements";
export * from "./lines";

const EXAMPLES = {
  "node-showcase": NodeShowcase,
  "layout-placement": LayoutPlacements,
  "layout-schemes": LayoutSchemes,
  "layout-themes": LayoutThemes,
  "heading-styles": HeadingStyles,
  "box-styles": BoxStyles,
  "box-colors": BoxColors,
  "box-density": BoxDensities,
  "box-tags": BoxTagVariants,
  "line-styles": LineStyles,
  "line-colors": LineColors,
  "line-density": LineDensities,
  "protocol-interfaces": ProtocolInterfaces,
  "protocol-flows": ProtocolFlows,
  "architecture-elements": ArchitectureElements,
  "authorization-models": AuthorizationModels,
  "canvas-backgrounds": CanvasBackgrounds,
  "canvas-frames": CanvasFrames,
  "container-styles": ContainerStyles,
  "container-colors": ContainerColors,
  "container-density": ContainerDensities,
  "actor-styles": ActorStyles,
  "actor-colors": ActorColors,
  "actor-density": ActorDensities,
  "product-styles": ProductStyles,
  "rail-styles": RailStyles,
  "callout-styles": CalloutStyles,
  "rail-types": RailTypes,
  "rail-colors": RailColors,
} satisfies Record<(typeof VOCABULARY_CATALOG)[number]["key"], () => ReactNode>;

export const VOCABULARY = VOCABULARY_CATALOG.map(example => ({ ...example, component: EXAMPLES[example.key] }));

export function vocabularyExample(key: string) {
  const example = VOCABULARY.find((candidate) => candidate.key === key);
  if (!example) throw new Error(`Unknown diagram vocabulary: ${key}`);
  return example.component;
}
