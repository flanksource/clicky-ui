import { describe, expect, it } from "vitest";
import type { RuntimeProfile } from "../schema.ts";
import { validateProfile } from "./profile.ts";
import { contentSecurityPolicy } from "./router.ts";

const PROFILE: RuntimeProfile = { runtimeDomain: "runtime.example", embedders: ["https://host.example"], packageOrigin: "https://packages.example", registry: "https://registry.example", managed: {}, policy: { dependencies: "strict" }, minReleaseAgeDays: 0, network: { allow: [] }, csp: { add: {} }, links: "deny", sources: ["host"], readinessTimeoutMs: 1000 };
const scriptSrc = (profile: RuntimeProfile) => contentSecurityPolicy(validateProfile(profile), "n").split("; ").find((directive) => directive.startsWith("script-src "));

describe("csp.wasm", () => {
  it.each([
    ["omitted", PROFILE, "script-src 'self' 'nonce-n'"],
    ["false", { ...PROFILE, csp: { add: {}, wasm: false } }, "script-src 'self' 'nonce-n'"],
    ["true", { ...PROFILE, csp: { add: {}, wasm: true } }, "script-src 'self' 'nonce-n' 'wasm-unsafe-eval'"],
  ])("frames allow WebAssembly compilation only when opted in (%s)", (_case, profile, expected) => {
    expect(scriptSrc(profile)).toBe(expected);
  });

  it("rejects a non-boolean opt-in", () => {
    expect(() => validateProfile({ ...PROFILE, csp: { add: {}, wasm: "yes" } })).toThrow("csp.wasm: expected boolean");
  });
});
