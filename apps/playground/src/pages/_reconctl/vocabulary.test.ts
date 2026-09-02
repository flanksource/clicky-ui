import { describe, expect, it } from "vitest";

import { SEVERITIES } from "../_recon/severity";
import { GLYPHS, type GlyphToken } from "./icons";
import { toneClasses } from "./tone";
import { ENGINE_TERMS, ENTITY_TERMS, VOCABULARIES, type Term } from "./vocabulary";

/**
 * A build aid for the vocabulary, not a regression gate on the playground.
 *
 * Three things here can silently rot as terms are added, and none of them is
 * visible by reading the file: a glyph quietly doing double duty, a term
 * pointing at a token that no longer exists, and a tone that no longer resolves.
 * Each would render as something plausible rather than as an error.
 */

const ALL_TERMS: Term[] = [
  ...VOCABULARIES.flatMap((vocabulary) => vocabulary.terms),
  ...ENGINE_TERMS,
  ...ENTITY_TERMS,
];

describe("glyph set", () => {
  it("draws a different Phosphor icon for every token", () => {
    const byPhosphorToken = new Map<string, GlyphToken[]>();
    for (const [token, glyph] of Object.entries(GLYPHS)) {
      byPhosphorToken.set(glyph.token, [...(byPhosphorToken.get(glyph.token) ?? []), token as GlyphToken]);
    }
    const shared = [...byPhosphorToken.entries()].filter(([, tokens]) => tokens.length > 1);
    expect(shared).toEqual([]);
  });

  it("resolves every icon to a real Iconify body", () => {
    for (const [token, glyph] of Object.entries(GLYPHS)) {
      expect(glyph.icon, `${token} has no icon body`).toBeDefined();
      expect(typeof glyph.icon.body, `${token} body`).toBe("string");
      expect(glyph.icon.body.length, `${token} body is empty`).toBeGreaterThan(0);
    }
  });
});

describe("vocabularies", () => {
  it.each(VOCABULARIES.map((vocabulary) => [vocabulary.id, vocabulary] as const))(
    "%s uses each glyph at most once",
    (_id, vocabulary) => {
      const glyphs = vocabulary.terms.map((term) => term.glyph);
      expect(new Set(glyphs).size).toBe(glyphs.length);
    },
  );

  it.each(VOCABULARIES.map((vocabulary) => [vocabulary.id, vocabulary] as const))(
    "%s has a unique value per term",
    (_id, vocabulary) => {
      const values = vocabulary.terms.map((term) => term.value);
      expect(new Set(values).size).toBe(values.length);
    },
  );

  it("points every term at a glyph that exists", () => {
    for (const term of ALL_TERMS) {
      expect(GLYPHS[term.glyph], `${term.value} → ${term.glyph}`).toBeDefined();
    }
  });

  it("resolves every term's tone", () => {
    for (const term of ALL_TERMS) {
      expect(() => toneClasses(term.tone), `${term.value} → ${term.tone}`).not.toThrow();
    }
  });

  it("explains every term", () => {
    for (const term of ALL_TERMS) {
      expect(term.meaning.length, `${term.value} has no meaning`).toBeGreaterThan(20);
    }
  });
});

describe("coverage of recon's own vocabularies", () => {
  it("covers every severity the ramp defines", () => {
    const severity = VOCABULARIES.find((vocabulary) => vocabulary.id === "severity");
    expect(severity?.terms.map((term) => term.value)).toEqual([...SEVERITIES]);
  });

  it("covers all six scan phases", () => {
    const phase = VOCABULARIES.find((vocabulary) => vocabulary.id === "phase");
    expect(phase?.terms.map((term) => term.value)).toEqual([
      "idle",
      "queued",
      "running",
      "done",
      "failed",
      "cancelled",
    ]);
  });

  it("covers all ten registered engines, split into the two families", () => {
    expect(ENGINE_TERMS.map((term) => term.value)).toEqual([
      "nuclei",
      "prowler",
      "trivy",
      "inspec",
      "subfinder",
      "dnsx",
      "naabu",
      "httpx",
      "tlsx",
      "katana",
    ]);
    expect(ENGINE_TERMS.filter((term) => term.family === "scan")).toHaveLength(4);
    expect(ENGINE_TERMS.filter((term) => term.family === "discovery")).toHaveLength(6);
  });

  it("covers all eleven registered entities", () => {
    expect(ENTITY_TERMS.map((term) => term.value)).toEqual([
      "target",
      "scan",
      "finding",
      "discover",
      "probe",
      "profile",
      "mute",
      "template",
      "engine",
      "zone",
      "connection",
    ]);
  });

  /**
   * The rule the whole tone layer exists to enforce. Emerald must never land on
   * a value that means "we saw nothing" — recon cannot tell a clean account
   * from an unscanned one, so a green absence reports a control nobody observed.
   */
  it("never paints an absence emerald", () => {
    const healthy = ALL_TERMS.filter((term) => term.tone === "healthy");
    expect(healthy.map((term) => term.value).sort()).toEqual(["done", "present", "up"]);
  });
});
