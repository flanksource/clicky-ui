import type { FieldOption, FieldOptionBadge } from "../components/json-schema-form-types";
import { normalizeTone } from "../components/json-schema-form-tone";
import type { OperationLookupNode } from "./types";

type Presentation = Pick<FieldOption, "icon" | "description" | "tone" | "badges" | "group">;

/**
 * The picker presentation a lookup node carries beyond its label: leading icon,
 * description, tone, group and badges. Absent fields stay absent. A tone the
 * form does not know is neutral (it is decoration); a badge without a label
 * cannot be drawn and fails loudly, naming the option.
 */
export function lookupNodePresentation(value: string, node: OperationLookupNode | undefined): Presentation {
  if (!node) return {};
  return {
    ...(node.icon ? { icon: node.icon } : {}),
    ...(node.description ? { description: node.description } : {}),
    ...(node.tone ? { tone: normalizeTone(node.tone) } : {}),
    ...(node.group ? { group: node.group } : {}),
    ...(node.badges && node.badges.length > 0 ? { badges: lookupBadges(value, node.badges) } : {}),
  };
}

function lookupBadges(value: string, badges: NonNullable<OperationLookupNode["badges"]>): FieldOptionBadge[] {
  return badges.map((badge, index) => {
    if (typeof badge.label !== "string" || badge.label === "") {
      throw new Error(`lookup option "${value}" badge ${index} needs a label, got ${JSON.stringify(badge)}`);
    }
    return {
      label: badge.label,
      ...(badge.icon ? { icon: badge.icon } : {}),
      ...(badge.tone ? { tone: normalizeTone(badge.tone) } : {}),
    };
  });
}
