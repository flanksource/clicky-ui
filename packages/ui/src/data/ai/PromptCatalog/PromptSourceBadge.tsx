import { UiWarningTriangle } from "../../../icons";
import { Badge } from "../../Badge";
import { sourceLabel, sourceTone } from "./prompt-catalog-model";
import type { PromptCatalogSource } from "./types";

export type PromptSourceBadgeProps = {
  source: PromptCatalogSource | "default";
  parseError?: string | undefined;
};

export function PromptSourceBadge({
  source,
  parseError,
}: PromptSourceBadgeProps) {
  if (parseError) {
    return (
      <span title={parseError}>
        <Badge
          variant="soft"
          tone="danger"
          size="xs"
          clickToCopy={false}
          icon={UiWarningTriangle}
        >
          Parse error
        </Badge>
      </span>
    );
  }
  return (
    <Badge
      variant="soft"
      tone={sourceTone(source)}
      size="xs"
      clickToCopy={false}
    >
      {sourceLabel(source)}
    </Badge>
  );
}
