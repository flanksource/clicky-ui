import { Badge, type BadgeProps } from "./Badge";
import { cn } from "../lib/utils";

type Tone = NonNullable<BadgeProps["tone"]>;

const METHOD_TONES: Record<string, Tone> = {
  get: "info",
  post: "success",
  put: "warning",
  patch: "warning",
  delete: "danger",
};

export type MethodBadgeProps = {
  method: string;
  className?: string;
};

export function MethodBadge({ method, className }: MethodBadgeProps) {
  const tone = METHOD_TONES[method.toLowerCase()] ?? "neutral";
  return (
    <Badge
      variant="outline"
      tone={tone}
      size="sm"
      className={cn("font-mono uppercase", className)}
    >
      {method.toUpperCase()}
    </Badge>
  );
}
