import { cn } from "../lib/utils";
// Type augmentation (no runtime side-effects) — include via tsconfig.
// @see ./iconify-icon.d.ts

export type IconProps = {
  name: string;
  className?: string;
  width?: string | number;
  height?: string | number;
  rotate?: string | number;
  flip?: string;
  inline?: boolean;
  title?: string;
};

export function Icon({ name, className, width, height, rotate, flip, inline, title }: IconProps) {
  return (
    <iconify-icon
      icon={name}
      className={cn("shrink-0", className)}
      width={width}
      height={height}
      rotate={rotate}
      flip={flip}
      inline={inline}
      title={title}
      aria-hidden={title ? undefined : true}
    />
  );
}
