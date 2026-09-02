/**
 * The cyber-noc candidates for reconctl, as data.
 *
 * One owner for the hexes: `palettes.css` paints them and the picker's readout
 * table reports them, so a candidate cannot look one way and be documented as
 * another. The CSS restates these values by hand — CSS custom properties cannot
 * be authored from a TS object without a runtime style injection, and a build
 * step for five palettes is not worth the indirection — so `palettes.test.ts`
 * is deliberately *not* the guard here; the readout table is. If a hex below
 * disagrees with the rendered swatch beside it, the CSS is what drifted.
 *
 * ## The constraint that produced these five
 *
 * recon has already spent most of the spectrum on meaning. Severity owns red,
 * orange, amber and sky (`_recon/severity.ts`); provider identity owns indigo
 * (AWS), sky (Azure), violet (GCP) and teal (Kubernetes) (`_recon/marks.ts`).
 * **Cyan is the only hue left unclaimed**, which is why three of the five reach
 * for it. The other two exist to prove what the collisions actually cost:
 * `nightwatch` spends blue and `sodium` spends amber, and the picker shows both
 * next to the severity ramp they compete with rather than arguing about it.
 */

export const PALETTE_IDS = ["abyss", "carbon", "nightwatch", "violet-grid", "sodium"] as const;

export type PaletteId = (typeof PALETTE_IDS)[number];

export type PaletteTheme = "dark" | "light";

/**
 * The private primitives a candidate declares. `palettes.css` re-points the
 * whole clicky-ui semantic set at these, so every library component inside the
 * scope re-skins with no props at all.
 */
export type PaletteTokens = {
  bg: string;
  surface: string;
  elevated: string;
  border: string;
  input: string;
  fg: string;
  fgMuted: string;
  fgSubtle: string;
  primary: string;
  primaryFg: string;
  destructive: string;
  /**
   * Structural accent. Equal to `primary` in every candidate but `violet-grid`,
   * which is the whole argument that one is making: chrome and action can be
   * two different hues.
   */
  chrome: string;
  sidebar: string;
  sidebarFg: string;
  sidebarBorder: string;
  sidebarAccent: string;
  sidebarPrimary: string;
};

export type Palette = {
  id: PaletteId;
  label: string;
  /** The class `palettes.css` defines. Written out in full — never composed. */
  className: string;
  character: string;
  rationale: string;
  cost: string;
  /**
   * A candidate included to make a collision visible rather than to be chosen.
   * The picker labels these so they are not mistaken for serious options.
   */
  foil?: true;
  dark: PaletteTokens;
  light: PaletteTokens;
};

export const PALETTES: readonly Palette[] = [
  {
    id: "abyss",
    label: "Abyss",
    className: "rc-abyss",
    character: "Blue-black, deepest canvas of the five",
    rationale:
      "Cyan on near-black is the NOC wall reading. The deepest canvas gives the severity ramp the most room to glow, and cyan is the one hue recon has not already spent on severity or provider identity.",
    cost: "The blue cast sits close to severity-low sky, so a low finding has slightly less separation from the canvas than it does on a neutral ground.",
    dark: {
      bg: "#06090F",
      surface: "#0C1320",
      elevated: "#131C2E",
      border: "#1B2740",
      input: "#2A3A55",
      fg: "#DCE8F7",
      fgMuted: "#7C8CA6",
      fgSubtle: "#4E5C74",
      primary: "#22D3EE",
      primaryFg: "#04141A",
      destructive: "#F87171",
      chrome: "#22D3EE",
      sidebar: "#050810",
      sidebarFg: "#A9BCD4",
      sidebarBorder: "#14203A",
      sidebarAccent: "#0F1B33",
      sidebarPrimary: "#22D3EE",
    },
    light: {
      bg: "#F7FAFC",
      surface: "#FFFFFF",
      elevated: "#EEF3F9",
      border: "#DDE5EE",
      input: "#C6D2E0",
      fg: "#0B1421",
      fgMuted: "#5A6B82",
      fgSubtle: "#93A2B5",
      primary: "#0E7490",
      primaryFg: "#FFFFFF",
      destructive: "#DC2626",
      chrome: "#0E7490",
      sidebar: "#0B1220",
      sidebarFg: "#C2CFE0",
      sidebarBorder: "#1D2A42",
      sidebarAccent: "#16223A",
      sidebarPrimary: "#22D3EE",
    },
  },
  {
    id: "carbon",
    label: "Carbon",
    className: "rc-carbon",
    character: "Neutral graphite, no colour cast at all",
    rationale:
      "A grey canvas is the only one that does not tint the severity ramp. Critical red, high orange and low sky all read at their own hue, and cyan is the single chromatic note in the chrome — so anything coloured on the page means something.",
    cost: "The least distinctive chrome of the five. Read next to any other dark tool, it is the one that looks like a default.",
    dark: {
      bg: "#0B0B0D",
      surface: "#131316",
      elevated: "#1B1B1F",
      border: "#26262B",
      input: "#3A3A42",
      fg: "#E6E6EA",
      fgMuted: "#8B8B95",
      fgSubtle: "#5C5C66",
      primary: "#22D3EE",
      primaryFg: "#04141A",
      destructive: "#F87171",
      chrome: "#22D3EE",
      sidebar: "#08080A",
      sidebarFg: "#B4B4BE",
      sidebarBorder: "#1E1E23",
      sidebarAccent: "#17171C",
      sidebarPrimary: "#22D3EE",
    },
    light: {
      bg: "#FAFAFA",
      surface: "#FFFFFF",
      elevated: "#F4F4F5",
      border: "#E4E4E7",
      input: "#D4D4D8",
      fg: "#18181B",
      fgMuted: "#71717A",
      fgSubtle: "#A1A1AA",
      primary: "#0E7490",
      primaryFg: "#FFFFFF",
      destructive: "#DC2626",
      chrome: "#0E7490",
      sidebar: "#18181B",
      sidebarFg: "#D4D4D8",
      sidebarBorder: "#2A2A30",
      sidebarAccent: "#232329",
      sidebarPrimary: "#22D3EE",
    },
  },
  {
    id: "nightwatch",
    label: "Nightwatch",
    className: "rc-nightwatch",
    character: "Flanksource navy lineage",
    rationale:
      "Built from tokens the product family already owns: the surface is --fs-dark-navy and the accent is the ice blue already sitting in --sidebar-primary. Nothing new is introduced, so reconctl reads as a member of the suite rather than a separate application.",
    cost: "The accent is blue and severity-low is sky. Two blues on one row is exactly the ambiguity the other candidates spend cyan to avoid.",
    dark: {
      bg: "#0B1220",
      surface: "#131F3B",
      elevated: "#1B2942",
      border: "#24334F",
      input: "#33425F",
      fg: "#E2E9F5",
      fgMuted: "#8494B0",
      fgSubtle: "#56657F",
      primary: "#7CB0FF",
      primaryFg: "#0B1220",
      destructive: "#F87171",
      chrome: "#7CB0FF",
      sidebar: "#1E2B48",
      sidebarFg: "#C2CCE0",
      sidebarBorder: "#33425F",
      sidebarAccent: "#2C3C5E",
      sidebarPrimary: "#7CB0FF",
    },
    light: {
      bg: "#F5F8FD",
      surface: "#FFFFFF",
      elevated: "#EAF0FA",
      border: "#D9E2F0",
      input: "#C2D0E6",
      fg: "#131F3B",
      fgMuted: "#5C6B87",
      fgSubtle: "#94A3BC",
      primary: "#3578E5",
      primaryFg: "#FFFFFF",
      destructive: "#DC2626",
      chrome: "#3578E5",
      sidebar: "#1E2B48",
      sidebarFg: "#C2CCE0",
      sidebarBorder: "#33425F",
      sidebarAccent: "#2C3C5E",
      sidebarPrimary: "#7CB0FF",
    },
  },
  {
    id: "violet-grid",
    label: "Violet grid",
    className: "rc-violet-grid",
    character: "Violet-black chrome; cyan strictly reserved for interaction",
    rationale:
      "The only candidate that separates chrome from action. Violet carries every structural accent — rules, rail highlights, section marks — and cyan is spent on nothing but things you can click. On a dense triage screen that turns 'is this a control?' into a colour question rather than a shape question.",
    cost: "Violet is GCP's provider hue, so the chrome tint and a GCP resource row share a family. Two hues also means two chances to be wrong.",
    dark: {
      bg: "#0A0812",
      surface: "#14111F",
      elevated: "#1D1930",
      border: "#2A2440",
      input: "#3B3358",
      fg: "#E4DFF5",
      fgMuted: "#8F86AB",
      fgSubtle: "#5F5880",
      primary: "#22D3EE",
      primaryFg: "#04141A",
      destructive: "#F87171",
      chrome: "#A78BFA",
      sidebar: "#07050D",
      sidebarFg: "#B7AED0",
      sidebarBorder: "#211B36",
      sidebarAccent: "#1A1430",
      sidebarPrimary: "#A78BFA",
    },
    light: {
      bg: "#FAF8FF",
      surface: "#FFFFFF",
      elevated: "#F3EFFC",
      border: "#E5E0F2",
      input: "#D3CBE8",
      fg: "#14111F",
      fgMuted: "#665E80",
      fgSubtle: "#9C93B8",
      primary: "#0E7490",
      primaryFg: "#FFFFFF",
      destructive: "#DC2626",
      chrome: "#7C3AED",
      sidebar: "#14111F",
      sidebarFg: "#CFC7E4",
      sidebarBorder: "#2A2440",
      sidebarAccent: "#211B36",
      sidebarPrimary: "#A78BFA",
    },
  },
  {
    id: "sodium",
    label: "Sodium",
    className: "rc-sodium",
    character: "Warm charcoal under sodium-vapour light",
    rationale:
      "The warmest ops-room reading of the five, and the one that best matches what people picture when they say 'NOC'. Included so that picture gets tested rather than assumed.",
    cost: "Amber is the medium-severity hue. Every primary button competes with every medium finding, and on the findings band below the two are genuinely hard to separate. This is a foil, not a recommendation.",
    foil: true,
    dark: {
      bg: "#12100C",
      surface: "#1B1813",
      elevated: "#241F18",
      border: "#332C22",
      input: "#463C2E",
      fg: "#F0E7D8",
      fgMuted: "#A2947C",
      fgSubtle: "#6E6353",
      primary: "#F59E0B",
      primaryFg: "#1A1204",
      destructive: "#F87171",
      chrome: "#F59E0B",
      sidebar: "#0E0C09",
      sidebarFg: "#CBBDA3",
      sidebarBorder: "#2A241C",
      sidebarAccent: "#221D16",
      sidebarPrimary: "#F59E0B",
    },
    light: {
      bg: "#FBF8F2",
      surface: "#FFFFFF",
      elevated: "#F4EFE4",
      border: "#E7DFCF",
      input: "#D8CCB5",
      fg: "#1F1A12",
      fgMuted: "#7A6B52",
      fgSubtle: "#A89877",
      primary: "#B45309",
      primaryFg: "#FFFFFF",
      destructive: "#DC2626",
      chrome: "#B45309",
      sidebar: "#1F1A12",
      sidebarFg: "#DCCFB6",
      sidebarBorder: "#332C1F",
      sidebarAccent: "#2A241A",
      sidebarPrimary: "#F59E0B",
    },
  },
];

/**
 * The chosen palette.
 *
 * `violet-grid` won on the split it is the only candidate to make: violet
 * carries structural identity and cyan is spent on nothing but interaction, so
 * "is this a control?" becomes a colour question on a dense triage screen. The
 * picker page keeps the four runners-up so the choice stays checkable rather
 * than becoming folklore.
 */
export const CHOSEN: PaletteId = "violet-grid";

export function palette(id: PaletteId): Palette {
  const found = PALETTES.find((candidate) => candidate.id === id);
  if (!found) {
    // Fail loudly rather than falling back to the first candidate: a silent
    // fallback would render the wrong palette under the right label, which is
    // the one failure this page cannot survive.
    throw new Error(`Unknown reconctl palette "${id}"`);
  }
  return found;
}

/** The readout table's rows, in the order a palette is actually read. */
export const TOKEN_ROWS: readonly { key: keyof PaletteTokens; label: string; role: string }[] = [
  { key: "bg", label: "background", role: "Page canvas" },
  { key: "surface", label: "card / popover", role: "Raised surface" },
  { key: "elevated", label: "muted / secondary", role: "Control tracks, nested panels" },
  { key: "border", label: "border", role: "Hairlines and dividers" },
  { key: "input", label: "input", role: "Field outlines" },
  { key: "fg", label: "foreground", role: "Primary content" },
  { key: "fgMuted", label: "muted-foreground", role: "Secondary content" },
  { key: "fgSubtle", label: "placeholder", role: "Absence, never content" },
  { key: "primary", label: "primary / ring", role: "Action and focus" },
  { key: "primaryFg", label: "primary-foreground", role: "Label on the accent" },
  { key: "chrome", label: "chrome accent", role: "Structural marks" },
  { key: "destructive", label: "destructive", role: "Failure and delete" },
  { key: "sidebar", label: "sidebar", role: "Nav rail ground" },
  { key: "sidebarFg", label: "sidebar-foreground", role: "Nav rail content" },
  { key: "sidebarAccent", label: "sidebar-accent", role: "Nav rail active row" },
  { key: "sidebarPrimary", label: "sidebar-primary", role: "Nav rail accent" },
];

/**
 * The pairs that decide whether a candidate is usable at all.
 *
 * `min` is the WCAG bar for that pair's role, not one global number: body text
 * and a muted caption are normal-weight text at 4.5, while an accent used as a
 * focus ring or a button fill is a UI component at 3.
 */
export const CONTRAST_PAIRS: readonly {
  label: string;
  fg: keyof PaletteTokens;
  bg: keyof PaletteTokens;
  min: number;
  note: string;
}[] = [
  { label: "foreground on canvas", fg: "fg", bg: "bg", min: 4.5, note: "Body text" },
  { label: "muted on canvas", fg: "fgMuted", bg: "bg", min: 4.5, note: "Secondary text — the row that usually fails" },
  { label: "primary on canvas", fg: "primary", bg: "bg", min: 3, note: "Accent as a focus ring / graphical element" },
  { label: "primary label", fg: "primaryFg", bg: "primary", min: 4.5, note: "Button text on its own fill" },
  { label: "foreground on card", fg: "fg", bg: "surface", min: 4.5, note: "Body text on a raised surface" },
  { label: "sidebar fg on rail", fg: "sidebarFg", bg: "sidebar", min: 4.5, note: "Nav labels" },
];
