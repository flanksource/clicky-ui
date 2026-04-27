import type { CSSProperties, ReactNode } from "react";
import { Avatar, type AvatarKind, type AvatarVariant } from "./Avatar";
import { Icon, type IconTone } from "./Icon";
import { cn } from "../lib/utils";
import { resolveSize, type SizeToken } from "../lib/size";
import { useDensityValue } from "../hooks/use-density";

export type AvatarBadgeProps = {
  alt: string;
  label?: ReactNode;
  initials?: string;
  avatarKind?: AvatarKind;
  avatarVariant?: AvatarVariant;
  size?: SizeToken;
  title?: string;
  statusIcon?: string;
  statusTone?: IconTone;
  statusTitle?: string;
  comment?: ReactNode;
  borderColor?: string;
  className?: string;
  badgeClassName?: string;
  labelClassName?: string;
  commentClassName?: string;
  style?: CSSProperties;
  badgeStyle?: CSSProperties;
};

export function AvatarBadge({
  alt,
  label = alt,
  initials,
  avatarKind = "user",
  avatarVariant = "duotone",
  size = "lg",
  title,
  statusIcon,
  statusTone = "neutral",
  statusTitle,
  comment,
  borderColor,
  className,
  badgeClassName,
  labelClassName,
  commentClassName,
  style,
  badgeStyle,
}: AvatarBadgeProps) {
  const density = useDensityValue();
  const px = resolveSize(size, density);

  return (
    <span
      className={cn("inline-flex max-w-[50ch] min-w-0 flex-col items-start", className)}
      style={style}
    >
      <span
        className={cn(
          "inline-flex max-w-[40ch] min-w-0 items-center gap-2 overflow-visible rounded-full border bg-background shadow-sm",
          badgeClassName,
        )}
        style={{
          height: px,
          borderColor,
          ...badgeStyle,
        }}
      >
        <Avatar
          alt={alt}
          kind={avatarKind}
          size={size}
          title={title ?? alt}
          variant={avatarVariant}
          className="relative z-10 -ml-px shrink-0"
          {...(initials !== undefined ? { initials } : {})}
        />
        <span
          className={cn(
            "min-w-0 flex-1 truncate font-medium leading-none text-foreground",
            labelClassName,
          )}
          style={{ fontSize: Math.max(11, Math.round(px * 0.32)) }}
          title={typeof label === "string" ? label : (title ?? alt)}
        >
          {label}
        </span>
        {statusIcon && (
          <Icon
            name={statusIcon}
            style="badge"
            size={size}
            tone={statusTone}
            className="relative z-10 -mr-px shrink-0"
            {...(statusTitle !== undefined ? { title: statusTitle } : {})}
          />
        )}
      </span>
      {comment && (
        <span
          className={cn(
            "mt-1 max-w-[50ch] overflow-hidden text-xs leading-snug text-muted-foreground [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]",
            commentClassName,
          )}
          title={typeof comment === "string" ? comment : undefined}
        >
          {comment}
        </span>
      )}
    </span>
  );
}
