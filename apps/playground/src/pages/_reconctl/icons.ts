/**
 * The reconctl glyph vocabulary, resolved to Phosphor.
 *
 * Imports are **offline** — `@iconify-icons/ph` at the playground's pinned
 * 1.2.5 — rather than `<iconify-icon>` name strings fetched from the Iconify
 * CDN. A glyph that needs the network to appear is a glyph that can fail to
 * appear, and this set is read inside dense tables where telling one row from
 * its neighbour is the whole job. Same rule the supply-chain set follows.
 *
 * **Regular weight, not thin.** These are read at 16px in a table cell. The
 * thin cut is drawn at a hairline that collapses into interchangeable grey
 * scratches at that size.
 *
 * Product logos are NOT here. AWS, Azure, GCP and Kubernetes marks come from
 * `@flanksource/icons/mi` via `_recon/marks.ts`, which already owns the
 * provider and per-service mapping. This file is UI glyphs only — the split the
 * repo's iconography rule asks for.
 *
 * ## One glyph, one meaning
 *
 * No two entries below draw the same Phosphor icon. Where two vocabularies
 * genuinely share a concept — DNS is DNS whether it is the failure class of a
 * probe or the engine that resolves names — they reference the *same* entry
 * under a `proto:` token rather than each declaring their own. That makes the
 * sharing deliberate and visible in one place instead of an accident that
 * emerges later. `vocabulary.test.ts` asserts both halves: glyphs are unique
 * here, and tokens are unique within each vocabulary.
 */

import type { IconifyIcon } from "@iconify/react/offline";
import activity from "@iconify-icons/ph/activity";
import arrowsLeftRight from "@iconify-icons/ph/arrows-left-right";
import asterisk from "@iconify-icons/ph/asterisk";
import bellSlash from "@iconify-icons/ph/bell-slash";
import binoculars from "@iconify-icons/ph/binoculars";
import broadcast from "@iconify-icons/ph/broadcast";
import browser from "@iconify-icons/ph/browser";
import buildings from "@iconify-icons/ph/buildings";
import bug from "@iconify-icons/ph/bug";
import certificate from "@iconify-icons/ph/certificate";
import checkCircle from "@iconify-icons/ph/check-circle";
import circleDashed from "@iconify-icons/ph/circle-dashed";
import clipboardText from "@iconify-icons/ph/clipboard-text";
import clockCountdown from "@iconify-icons/ph/clock-countdown";
import cloud from "@iconify-icons/ph/cloud";
import cloudCheck from "@iconify-icons/ph/cloud-check";
import compass from "@iconify-icons/ph/compass";
import crosshair from "@iconify-icons/ph/crosshair";
import crosshairSimple from "@iconify-icons/ph/crosshair-simple";
import cube from "@iconify-icons/ph/cube";
import desktopTower from "@iconify-icons/ph/desktop-tower";
import doorOpen from "@iconify-icons/ph/door-open";
import fileCode from "@iconify-icons/ph/file-code";
import flag from "@iconify-icons/ph/flag";
import flask from "@iconify-icons/ph/flask";
import gearSix from "@iconify-icons/ph/gear-six";
import globeHemisphereWest from "@iconify-icons/ph/globe-hemisphere-west";
import hash from "@iconify-icons/ph/hash";
import hourglass from "@iconify-icons/ph/hourglass";
import identificationCard from "@iconify-icons/ph/identification-card";
import info from "@iconify-icons/ph/info";
import key from "@iconify-icons/ph/key";
import lockKey from "@iconify-icons/ph/lock-key";
import mapPin from "@iconify-icons/ph/map-pin";
import packageIcon from "@iconify-icons/ph/package";
import pauseCircle from "@iconify-icons/ph/pause-circle";
import playCircle from "@iconify-icons/ph/play-circle";
import plugs from "@iconify-icons/ph/plugs";
import plugsConnected from "@iconify-icons/ph/plugs-connected";
import power from "@iconify-icons/ph/power";
import prohibit from "@iconify-icons/ph/prohibit";
import question from "@iconify-icons/ph/question";
import scan from "@iconify-icons/ph/scan";
import sealQuestion from "@iconify-icons/ph/seal-question";
import shieldSlash from "@iconify-icons/ph/shield-slash";
import shieldWarning from "@iconify-icons/ph/shield-warning";
import signpost from "@iconify-icons/ph/signpost";
import siren from "@iconify-icons/ph/siren";
import sliders from "@iconify-icons/ph/sliders";
import spiral from "@iconify-icons/ph/spiral";
import timer from "@iconify-icons/ph/timer";
import treeStructure from "@iconify-icons/ph/tree-structure";
import warning from "@iconify-icons/ph/warning";
import warningCircle from "@iconify-icons/ph/warning-circle";
import warningDiamond from "@iconify-icons/ph/warning-diamond";
import warningOctagon from "@iconify-icons/ph/warning-octagon";
import wifiSlash from "@iconify-icons/ph/wifi-slash";
import xCircle from "@iconify-icons/ph/x-circle";

/** A glyph plus the Phosphor token it came from, for the reference table. */
export type Glyph = { token: string; icon: IconifyIcon };

function glyph(token: string, icon: IconifyIcon): Glyph {
  return { token, icon };
}

export const GLYPHS = {
  // Severity — the six levels of `_recon/severity.ts`.
  "sev:critical": glyph("ph:siren", siren),
  "sev:high": glyph("ph:warning-octagon", warningOctagon),
  "sev:medium": glyph("ph:warning", warning),
  "sev:low": glyph("ph:warning-circle", warningCircle),
  "sev:info": glyph("ph:info", info),
  "sev:unknown": glyph("ph:question", question),

  // Scan phase — `Phase` in internal/api/scan.go.
  "phase:idle": glyph("ph:pause-circle", pauseCircle),
  "phase:queued": glyph("ph:hourglass", hourglass),
  "phase:running": glyph("ph:play-circle", playCircle),
  "phase:done": glyph("ph:check-circle", checkCircle),
  "phase:failed": glyph("ph:x-circle", xCircle),
  "phase:cancelled": glyph("ph:prohibit", prohibit),

  // Target kind and class — `TargetKind` / `Class` in internal/api/target.go.
  "kind:host": glyph("ph:desktop-tower", desktopTower),
  "kind:provider-context": glyph("ph:cloud", cloud),
  "class:public": glyph("ph:globe-hemisphere-west", globeHemisphereWest),
  "class:prod": glyph("ph:buildings", buildings),
  "class:non-prod": glyph("ph:flask", flask),
  "class:internal": glyph("ph:lock-key", lockKey),
  "class:unclassified": glyph("ph:circle-dashed", circleDashed),
  "class:deactivated": glyph("ph:power", power),

  // Credential mode — `CredentialMode`.
  "cred:ambient": glyph("ph:cloud-check", cloudCheck),
  "cred:configured": glyph("ph:key", key),

  // Protocol marks, shared on purpose between a probe's failure class and the
  // discovery engine that speaks the same protocol.
  "proto:dns": glyph("ph:signpost", signpost),
  "proto:http": glyph("ph:browser", browser),
  "proto:tls": glyph("ph:certificate", certificate),
  "proto:ports": glyph("ph:door-open", doorOpen),

  // Probe liveness — `Failure` in internal/probe/failure.go, minus the classes
  // that resolve to a protocol mark above.
  "probe:up": glyph("ph:activity", activity),
  "probe:unreachable": glyph("ph:wifi-slash", wifiSlash),
  "probe:timeout": glyph("ph:timer", timer),
  "probe:other": glyph("ph:warning-diamond", warningDiamond),

  // TLS posture — the boolean flags on `TLS`.
  "tls:expired": glyph("ph:clock-countdown", clockCountdown),
  "tls:self-signed": glyph("ph:seal-question", sealQuestion),
  "tls:mismatched": glyph("ph:arrows-left-right", arrowsLeftRight),
  "tls:revoked": glyph("ph:shield-slash", shieldSlash),
  "tls:untrusted": glyph("ph:shield-warning", shieldWarning),
  "tls:wildcard": glyph("ph:asterisk", asterisk),

  // Resources — `ResourceKind` in internal/api/resource.go.
  "res:account": glyph("ph:identification-card", identificationCard),
  "res:cloud-resource": glyph("ph:cube", cube),
  "res:artifact": glyph("ph:package", packageIcon),
  "res:endpoint": glyph("ph:plugs", plugs),

  // Engines — internal/engines/all/all.go. dnsx, httpx and tlsx reference the
  // protocol marks above rather than declaring near-identical glyphs.
  "engine:nuclei": glyph("ph:crosshair-simple", crosshairSimple),
  "engine:prowler": glyph("ph:binoculars", binoculars),
  "engine:trivy": glyph("ph:bug", bug),
  "engine:inspec": glyph("ph:clipboard-text", clipboardText),
  "engine:subfinder": glyph("ph:tree-structure", treeStructure),
  "engine:naabu": glyph("ph:hash", hash),
  "engine:katana": glyph("ph:spiral", spiral),

  // Entities — the eleven registered in internal/entities/entities.go.
  "entity:target": glyph("ph:crosshair", crosshair),
  "entity:scan": glyph("ph:scan", scan),
  "entity:finding": glyph("ph:flag", flag),
  "entity:discover": glyph("ph:compass", compass),
  "entity:probe": glyph("ph:broadcast", broadcast),
  "entity:profile": glyph("ph:sliders", sliders),
  "entity:mute": glyph("ph:bell-slash", bellSlash),
  "entity:template": glyph("ph:file-code", fileCode),
  "entity:engine": glyph("ph:gear-six", gearSix),
  "entity:zone": glyph("ph:map-pin", mapPin),
  "entity:connection": glyph("ph:plugs-connected", plugsConnected),
} as const satisfies Record<string, Glyph>;

export type GlyphToken = keyof typeof GLYPHS;

export function glyphFor(token: GlyphToken): Glyph {
  return GLYPHS[token];
}
