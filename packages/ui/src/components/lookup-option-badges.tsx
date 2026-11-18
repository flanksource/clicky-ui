import { cn } from "../lib/utils";
import { Badge } from "../data/Badge";
import { LabelIcon } from "../data/Icon";
import type { FieldOptionBadge } from "./json-schema-form-types";
import { TONE_GLYPH_CLASS } from "./json-schema-form-tone";

// OptionBadges renders an option's marks as a right-aligned run of small soft
// badges. A string icon is a runtime icon name; a node icon renders as-is.
export function OptionBadges({ badges }: { badges: FieldOptionBadge[] }) {
  return (
    <span className="flex shrink-0 items-center gap-1">
      {badges.map((badge) => {
        const toneClass = badge.tone ? TONE_GLYPH_CLASS[badge.tone] : "";
        const named = typeof badge.icon === "string" && badge.icon !== "";
        return (
          <Badge
            key={badge.label}
            size="xxs"
            variant="soft"
            clickToCopy={false}
            {...(named ? { icon: badge.icon as string } : {})}
            className={cn("border-transparent", toneClass)}
          >
            {!named && badge.icon ? <LabelIcon icon={badge.icon} className="mr-0.5" /> : null}
            {badge.label}
          </Badge>
        );
      })}
    </span>
  );
}
