import { beforeAll, describe, expect, it } from "vitest";
import { configureProfiles, type ProfileSchema } from "../profileApi";
import {
  connectionTypeFromLabel,
  providerTypesForConnectionType,
} from "./profileWizardModel";

// The shape the generated profile schema carries: the connection field's lookup
// scope maps each query provider to the connection types it can read. Only the
// entries the resolver is exercised against are reproduced here.
const schema = {
  type: "object",
  properties: {
    provider: {
      type: "object",
      properties: {
        connection: {
          type: "string",
          "x-clicky-lookup": {
            scope: {
              from: "provider.type",
              map: {
                cloudwatch: ["aws"],
                azureloganalytics: ["azure"],
                k8s: ["kubernetes"],
                gcpcloudlogging: ["google_cloud"],
                bigquery: ["google_cloud"],
                opensearch: ["opensearch", "elasticsearch"],
                loki: ["loki"],
                sql: ["postgres", "mysql", "sql_server", "clickhouse"],
                postgres: ["postgres"],
                sqlserver: ["sql_server"],
                http: ["http"],
                postgrest: ["http"],
              },
            },
          },
        },
      },
    },
  },
} as unknown as ProfileSchema;

beforeAll(() => configureProfiles({ schema }));

describe("reading a connection type off a lookup label", () => {
  it("takes the parenthesised suffix the server appends", () => {
    expect(connectionTypeFromLabel("prod-logs (aws)")).toBe("aws");
  });

  it("reports nothing for a label carrying no type", () => {
    expect(connectionTypeFromLabel("prod-logs")).toBeNull();
  });
});

describe("resolving which provider reads a connection", () => {
  // The whole point of the resolver: for these four the connection type is not
  // a provider key at all, and using it as one produced a draft the schema
  // rejects.
  it.each([
    ["aws", "cloudwatch"],
    ["azure", "azureloganalytics"],
    ["kubernetes", "k8s"],
    ["elasticsearch", "opensearch"],
  ])("reads a %s connection with %s", (connectionType, provider) => {
    expect(providerTypesForConnectionType(connectionType)).toEqual([provider]);
  });

  it("prefers the provider named exactly for the connection type", () => {
    // `postgres` is read by both the generic `sql` provider and `postgres`.
    expect(providerTypesForConnectionType("postgres")).toEqual(["postgres"]);
    expect(providerTypesForConnectionType("http")).toEqual(["http"]);
  });

  it("prefers the dialect over the generic sql umbrella", () => {
    // No provider is keyed `sql_server`, so the exact match cannot settle it.
    expect(providerTypesForConnectionType("sql_server")).toEqual(["sqlserver"]);
  });

  it("keeps a genuine tie for the reader to settle", () => {
    expect(providerTypesForConnectionType("google_cloud")).toEqual([
      "bigquery",
      "gcpcloudlogging",
    ]);
  });

  it("reports no provider for a connection type nothing queries", () => {
    expect(providerTypesForConnectionType("slack")).toEqual([]);
  });
});
