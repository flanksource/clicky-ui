import { describe, expect, it } from "vitest";
import { profileSamplePayload } from "./profileSamplePayload";
import type { ProfileWizardDraft } from "../wizard/profileWizardModel";

const connectionID = "source-stub";
const query = "SELECT message FROM logs";
const options = { database: "observability" };
const params = [{ name: "limit", type: "number" as const, default: 25 }];

describe("profileSamplePayload", () => {
  it("keeps UI-only profile state out of the strict sample request", () => {
    const draft: ProfileWizardDraft = {
      _id: "profile-record-1",
      profile: "events",
      provider: {
        type: "sql",
        connection: `connection://${connectionID}`,
        options,
      },
      query,
      params,
      columns: [{ name: "message", type: "string" }],
      render: "logs",
    };

    expect(
      profileSamplePayload(draft, {
        query,
        options,
        pagination: { limit: 25 },
        debug: true,
      }),
    ).toEqual({
      profile: {
        profile: "events",
        provider: {
          type: "sql",
          connection: `connection://${connectionID}`,
          options,
        },
        query,
        params,
      },
      params: {},
      pagination: { limit: 25 },
      debug: true,
    });
  });

  it("rejects a draft without a provider", () => {
    expect(() =>
      profileSamplePayload(
        { profile: "events", query },
        { query, options: {} },
      ),
    ).toThrow("Cannot sample a profile without a provider");
  });
});
