import type { DetailedHTMLProps, HTMLAttributes } from "react";

type IconifyIconProps = DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement> & {
  icon?: string;
  class?: string;
  width?: string | number;
  height?: string | number;
  inline?: boolean;
};

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "iconify-icon": IconifyIconProps;
    }
  }
}

export {};
