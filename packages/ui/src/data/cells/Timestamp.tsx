import { cn } from "../../lib/utils";
import { formatTimestamp, parseTimestamp, type TimestampFormat } from "./timestamp-format";

export type TimestampProps = {
  value: unknown;
  format: TimestampFormat;
  showTitleOnHover?: boolean;
  className?: string;
};

export function Timestamp({ value, format, showTitleOnHover = true, className }: TimestampProps) {
  const parsed = parseTimestamp(value);
  if (!parsed) return <span className={cn("text-muted-foreground", className)}>—</span>;

  const display = formatTimestamp(parsed, format);
  const title = showTitleOnHover ? parsed.toISOString() : undefined;

  return (
    <span
      className={cn("tabular-nums whitespace-nowrap text-muted-foreground", className)}
      title={title}
    >
      {display}
    </span>
  );
}
