import { UiStack } from "../icons";

type DaemonSetIconProps = {
  className?: string;
  title?: string;
  "aria-label"?: string;
};

export function DaemonSetIcon({
  className,
  title,
  "aria-label": ariaLabel,
}: DaemonSetIconProps) {
  return (
    <UiStack
      {...(className !== undefined ? { className } : {})}
      {...(title !== undefined ? { title } : {})}
      {...(ariaLabel !== undefined ? { "aria-label": ariaLabel } : {})}
    />
  );
}
