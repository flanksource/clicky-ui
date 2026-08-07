import type { ReactNode } from "react";
import type { Placement } from "@floating-ui/react";

/**
 * Public shape of a guided tour. Types only — the runtime lives in tour-model.ts
 * (pure sequencing), tour-geometry.ts (pure spotlight maths), tour-anchor.ts (the
 * only DOM lookups) and Tour.tsx / TourProvider.tsx (rendering and state).
 */

/**
 * Where a tour looks up its anchors. `document` is the application case; a
 * ShadowRoot or a subtree element scopes the tour to an embedded UI — a docs
 * site rendering the same steps over a mock inside a shadow root, where
 * `document.querySelector` finds nothing.
 */
export type TourRoot = Document | ShadowRoot | HTMLElement;

/**
 * A root, or a getter re-invoked while waiting, so a root that mounts late (a
 * shadow root attached in an effect) resolves inside the same timeout budget
 * rather than needing a second mechanism.
 */
export type TourRootSource = TourRoot | (() => TourRoot | null | undefined);

/**
 * How a step names its anchor. A resolver receives the resolved root, so a
 * consumer can match on things `querySelector` cannot express (visible text, a
 * ref it already holds) without the library learning about them.
 */
export type TourTarget = string | HTMLElement | ((root: TourRoot) => HTMLElement | null | undefined);

/** What happens when a step's anchor never appears within its wait budget. */
export type TourMissingAnchor =
  /** Render the card centred with no spotlight. The step still counts. */
  | "center"
  /** Advance past the step as if it were not in the tour. */
  | "skip"
  /** Throw. For stories and tests, where a broken fixture must fail the build. */
  | "fail";

/** Pointer behaviour of the dim layer. */
export type TourInteraction =
  /** Dim swallows clicks; the cutout passes them through to the anchor. Default. */
  | "allow-anchor"
  /** Nothing under the overlay is clickable, including the anchor. */
  | "block-all"
  /** The overlay is purely decorative; the whole page stays live. */
  | "allow-all";

export type TourDirection = "start" | "next" | "back" | "jump";

export type TourStepContext = {
  step: TourStep;
  /** Zero-based index within the running tour. */
  index: number;
  total: number;
  /** Resolved anchor, or `null` for an anchorless step or one degraded to centred. */
  anchor: HTMLElement | null;
  direction: TourDirection;
};

export type TourStep = {
  /** Stable identity: React key, `goTo` target, and the id reported on error. Unique within the tour. */
  id: string;
  /** Element the step points at. Omit for a centred, anchorless step (intro/outro). */
  target?: TourTarget;
  /** Card heading, and the accessible name of the step dialog. */
  title: ReactNode;
  /** Card body. Mutually exclusive with `markdown`. */
  body?: ReactNode;
  /** Markdown body, rendered by the lazily loaded `Markdown`. Mutually exclusive with `body`. */
  markdown?: string;
  /**
   * Route this step lives on. When it differs from the route the tour is already
   * on, `onNavigate` fires before the anchor wait. The tour never waits on a
   * route change — the anchor appearing is the only completion signal, which is
   * what lets the same steps run where there is no router at all.
   */
  route?: string;
  /** Preferred card placement around the anchor; flips and shifts to fit. Defaults to `"bottom"`. */
  placement?: Placement;
  /** Extra px of spotlight around the anchor's border box. Defaults to the tour's `padding`. */
  padding?: number;
  /** Cutout corner radius in px. Defaults to the anchor's own computed radius, grown by the padding. */
  radius?: number;
  /** Per-step override of the tour's `missingAnchor` policy. */
  onMissing?: TourMissingAnchor;
  /** Per-step override of the tour's anchor wait budget, in ms. */
  timeoutMs?: number;
  /**
   * Shown while the anchor has not appeared, for a step that depends on state the
   * tour does not own ("open a plan from the tree to continue"). Its presence
   * also blocks Next, so the operator is never advanced past a stop they have not
   * reached. Unset means the step is expected to resolve on its own.
   */
  hint?: ReactNode;
  /** Let Next through even while `hint` is showing. */
  hintOptional?: boolean;
  /**
   * Extra classes for this step's card, merged after the tour-level `className`.
   * The intended use is widening the card for a step whose body needs the room
   * (e.g. `w-[min(30rem,calc(100vw-2rem))]`) — tailwind-merge resolves the
   * conflict with the default width.
   */
  cardClassName?: string;
  /** Evaluated on entry in both directions; a `false` result skips the step. For role/feature-gated UI. */
  enabled?: () => boolean;
  /** Runs on entry once the anchor resolves — e.g. open a panel the next step needs. */
  onEnter?: (ctx: TourStepContext) => void | Promise<void>;
  /** Runs on exit, in either direction. */
  onExit?: (ctx: TourStepContext) => void;
};

export type TourDefinition = {
  /** Stable identity: the persistence key and the `start(id)` argument. */
  id: string;
  /** Human name, for a "Take a tour" menu. */
  title?: string;
  /** Bump to invalidate prior completions so a reworked tour runs again. Defaults to `1`. */
  version?: number;
  /** Ordered steps. Must be non-empty — an empty tour throws at registration. */
  steps: TourStep[];
  /**
   * Rendered at the foot of every step card. Intended for a link back to the
   * fuller written guide the tour condenses, so the two surfaces point at each
   * other rather than competing.
   */
  footer?: ReactNode;
  /** Run automatically for a user who has neither completed nor dismissed it. */
  autoStart?: boolean;
  /** Route auto-start is allowed on. Defaults to the first step's `route`. */
  autoStartRoute?: string;
};

export type TourStepErrorInfo = {
  tourId: string;
  step: TourStep;
  index: number;
  reason: "anchor-timeout" | "anchor-invalid" | "step-error";
  /** The declared target, stringified for logging. */
  target: string;
  error?: unknown;
};

export type TourLabels = {
  back: string;
  next: string;
  done: string;
  skip: string;
  close: string;
  /** `current` is 1-based. */
  counter: (current: number, total: number) => string;
  /** Announced in the polite live region on every step change. */
  announce: (current: number, total: number, title: string) => string;
};
