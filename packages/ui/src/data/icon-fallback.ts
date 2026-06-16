import type { ComponentType } from "react";

export type FallbackIconProps = {
  /** Runtime icon name to resolve. */
  name?: string;
  /** Classes applied by Icon. */
  className?: string;
  /** Requested glyph size. */
  size?: string | number;
  /** Accessible label. */
  alt?: string;
};

export type FallbackIconComponent = ComponentType<FallbackIconProps>;

let fallbackIcon: FallbackIconComponent | null = null;

/**
 * Register a secondary glyph provider. Pass the flanksource Icon/ResourceIcon
 * (or any compatible component) to resolve user-supplied runtime names.
 */
export function setFallbackIconProvider(component: FallbackIconComponent | null): void {
  fallbackIcon = component;
}

export function getFallbackIconProvider(): FallbackIconComponent | null {
  return fallbackIcon;
}
