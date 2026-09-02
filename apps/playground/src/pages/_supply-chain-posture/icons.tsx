/**
 * The `sc:` tokens this page draws, resolved to Phosphor glyphs.
 *
 * Imports are offline — `@iconify-icons/ph` at the same 1.2.5 pin the trust repo
 * uses — rather than `<iconify-icon>` name strings fetched from the Iconify CDN.
 * The neighbouring icon catalogue uses runtime strings because cataloguing names
 * *is* its subject; here the names are incidental and a glyph that needs the
 * network to appear is a glyph that can fail to appear.
 *
 * **Regular weight, not thin.** Phosphor's thin cut is drawn at a hairline that
 * survives display at 24px and larger; these glyphs are read at 16px inside a
 * control strip where telling one from its neighbour is the entire job, and at
 * that size the thin cut collapsed into interchangeable grey scratches. Print
 * made it worse, since a hairline is the first thing a printer drops.
 *
 * Category is the trust repo's, copied with the token, because it is what colours
 * the mark. `_supply-chain-threat-icons/catalog.ts` mirrors the same source and
 * `canonical-keys.ts` is the assertion the two agree; this file is a subset of
 * that vocabulary, not a second opinion about it.
 */

import { Icon } from "@iconify/react/offline";
import type { IconifyIcon } from "@iconify/react/offline";
import alarm from "@iconify-icons/ph/alarm";
import arrowsClockwise from "@iconify-icons/ph/arrows-clockwise";
import bug from "@iconify-icons/ph/bug";
import bugBeetle from "@iconify-icons/ph/bug-beetle";
import fileMagnifyingGlass from "@iconify-icons/ph/file-magnifying-glass";
import flask from "@iconify-icons/ph/flask";
import gauge from "@iconify-icons/ph/gauge";
import gearSix from "@iconify-icons/ph/gear-six";
import gitBranch from "@iconify-icons/ph/git-branch";
import gitPullRequest from "@iconify-icons/ph/git-pull-request";
import key from "@iconify-icons/ph/key";
import listChecks from "@iconify-icons/ph/list-checks";
import lockKey from "@iconify-icons/ph/lock-key";
import magnifyingGlass from "@iconify-icons/ph/magnifying-glass";
import packageIcon from "@iconify-icons/ph/package";
import password from "@iconify-icons/ph/password";
import pushPin from "@iconify-icons/ph/push-pin";
import puzzlePiece from "@iconify-icons/ph/puzzle-piece";
import scan from "@iconify-icons/ph/scan";
import sealCheck from "@iconify-icons/ph/seal-check";
import sealQuestion from "@iconify-icons/ph/seal-question";
import shieldCheck from "@iconify-icons/ph/shield-check";
import signature from "@iconify-icons/ph/signature";
import siren from "@iconify-icons/ph/siren";
import stack from "@iconify-icons/ph/stack";
import trendDown from "@iconify-icons/ph/trend-down";
import trendUp from "@iconify-icons/ph/trend-up";
import users from "@iconify-icons/ph/users";
import userFocus from "@iconify-icons/ph/user-focus";
import userGear from "@iconify-icons/ph/user-gear";
import warning from "@iconify-icons/ph/warning";
import warningCircle from "@iconify-icons/ph/warning-circle";
import warningOctagon from "@iconify-icons/ph/warning-octagon";
import wrench from "@iconify-icons/ph/wrench";

import type { ThreatCategory } from "../_supply-chain-threat-icons/catalog";

type ScIcon = {
  /** Phosphor token, for the reference table. */
  token: string;
  glyph: IconifyIcon;
  /** Drives colour — the security property at risk, not decoration. */
  category: ThreatCategory;
};

export const SC_ICONS: Record<string, ScIcon> = {
  "sc:artifact": { token: "ph:package", glyph: packageIcon, category: "stage" },
  "sc:build": { token: "ph:gear-six", glyph: gearSix, category: "stage" },
  "sc:compromised-build": { token: "ph:bug-beetle", glyph: bugBeetle, category: "privileged" },
  "sc:critical": { token: "ph:siren", glyph: siren, category: "threat" },
  "sc:dependencies": { token: "ph:puzzle-piece", glyph: puzzlePiece, category: "stage" },
  "sc:dependency-track": { token: "ph:list-checks", glyph: listChecks, category: "slsa" },
  "sc:discovery": { token: "ph:magnifying-glass", glyph: magnifyingGlass, category: "asset" },
  "sc:evidenced": { token: "ph:file-magnifying-glass", glyph: fileMagnifyingGlass, category: "control" },
  "sc:group-identity": { token: "ph:users", glyph: users, category: "identity" },
  "sc:high": { token: "ph:warning-octagon", glyph: warningOctagon, category: "high" },
  "sc:leaked-secret": { token: "ph:password", glyph: password, category: "integrity" },
  "sc:least-privilege": { token: "ph:lock-key", glyph: lockKey, category: "control" },
  "sc:lifecycle": { token: "ph:arrows-clockwise", glyph: arrowsClockwise, category: "asset" },
  "sc:low": { token: "ph:warning-circle", glyph: warningCircle, category: "audit" },
  "sc:medium": { token: "ph:warning", glyph: warning, category: "medium" },
  "sc:overdue-action": { token: "ph:alarm", glyph: alarm, category: "action" },
  "sc:pinning": { token: "ph:push-pin", glyph: pushPin, category: "control" },
  "sc:policy-gate": { token: "ph:shield-check", glyph: shieldCheck, category: "control" },
  "sc:registry": { token: "ph:stack", glyph: stack, category: "stage" },
  "sc:remediation": { token: "ph:wrench", glyph: wrench, category: "action" },
  // The two operating-evidence glyphs below. The trust catalog gives a detection
  // source the same token as the setting it reports on, which is right in a list
  // of controls and wrong in a strip that puts the pair side by side: two
  // identical glyphs in adjacent slots is precisely the confusion the strip has
  // to avoid. These say what the source *found* rather than what is switched on.
  "sc:reported-secret": { token: "ph:key", glyph: key, category: "integrity" },
  "sc:reported-vulnerability": { token: "ph:bug", glyph: bug, category: "control" },
  "sc:risk-score": { token: "ph:gauge", glyph: gauge, category: "risk" },
  "sc:risk-owner": { token: "ph:user-focus", glyph: userFocus, category: "risk" },
  "sc:role": { token: "ph:user-gear", glyph: userGear, category: "identity" },
  // Tests, as distinct from the build that runs them: the catalog files CI-Tests
  // under the generic build glyph, which put a second gear in the strip.
  "sc:tests": { token: "ph:flask", glyph: flask, category: "stage" },
  "sc:signing": { token: "ph:signature", glyph: signature, category: "control" },
  "sc:source": { token: "ph:git-branch", glyph: gitBranch, category: "stage" },
  // Direction of commit activity — context, not a control, so these are drawn in
  // the current text colour rather than a category hue.
  "sc:trend-down": { token: "ph:trend-down", glyph: trendDown, category: "neutral" },
  "sc:trend-up": { token: "ph:trend-up", glyph: trendUp, category: "neutral" },
  "sc:two-person": { token: "ph:git-pull-request", glyph: gitPullRequest, category: "slsa" },
  "sc:unverified": { token: "ph:seal-question", glyph: sealQuestion, category: "neutral" },
  "sc:verified": { token: "ph:seal-check", glyph: sealCheck, category: "stage" },
  "sc:vuln-scan": { token: "ph:scan", glyph: scan, category: "control" },
};

export function scIcon(token: string): ScIcon {
  const icon = SC_ICONS[token];
  if (!icon) {
    throw new Error(
      `${token} has no glyph in _supply-chain-posture/icons.tsx — import it from @iconify-icons/ph and register it`,
    );
  }
  return icon;
}

/**
 * A glyph in `currentColor`, so it takes the hue of the chip it sits in rather
 * than carrying a colour of its own. That is what keeps the marks correct in dark
 * mode without a second palette.
 */
export function ScIcon({ icon, className }: { icon: string; className?: string }) {
  return <Icon aria-hidden="true" className={className} icon={scIcon(icon).glyph} />;
}
