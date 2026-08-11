/**
 * A stand-in profile schema for tests.
 *
 * The real document is generated from commons-db's Go types and injected by the
 * host, so it is not available here — and asserting its contents from this
 * package would test commons-db's generator, not this code. What these tests
 * own is the mechanics on top of a schema: which properties a projection picks,
 * which of them stay required, and what a provider's options resolve to. This
 * fixture is deliberately small enough to read, and its expected projections are
 * obvious by inspection rather than copied from the code under test.
 */

import type { ProfileSchema } from "./profileApi";

export const testProfileSchema: ProfileSchema = {
  type: "object",
  required: ["profile", "provider"],
  properties: {
    profile: { type: "string" },
    namespace: { type: "string" },
    query: { type: "string" },
    params: { type: "array", items: { type: "object" } },
    processors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          use: { type: "string", enum: ["example.processor"] },
        },
      },
    },
    provider: {
      type: "object",
      properties: { type: { type: "string", enum: ["opensearch", "sql"] } },
    },
  },
  $defs: {
    opensearch: {
      type: "object",
      properties: {
        options: {
          type: "object",
          properties: { index: { type: "string" } },
        },
      },
    },
    // A provider whose options are not an object at all, so the resolver's
    // fallback has something real to resolve against.
    sql: { type: "object", properties: { options: { type: "string" } } },
  },
};
