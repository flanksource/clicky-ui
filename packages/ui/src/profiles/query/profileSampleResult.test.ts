import { describe, expect, it } from "vitest";
import {
  profileSampleFilterColumns,
  profileSampleQueryResult,
  type ProfileSampleResponse,
} from "./profileSampleResult";

describe("profile sample result transport", () => {
  it("keeps authoring columns out of the QueryBrowser filter contract", () => {
    const response: ProfileSampleResponse = {
      rows: [{ message: "started" }],
      columns: [
        { name: "message", type: "string", filter: { kind: "text" } },
      ],
      resultColumns: [
        {
          name: "message",
          filterKey: "filter.message",
          filter: { kind: "text" },
        },
      ],
      renderedQuery: "SELECT message FROM logs",
    };

    expect(profileSampleQueryResult(response)).toEqual({
      rows: [{ message: "started" }],
      columns: [
        {
          name: "message",
          filterKey: "filter.message",
          filter: { kind: "text" },
        },
      ],
    });
    expect(response.columns).toEqual([
      { name: "message", type: "string", filter: { kind: "text" } },
    ]);
  });

  it("fails when the backend omits the resolved result-column contract", () => {
    expect(() =>
      profileSampleQueryResult({
        rows: [],
        columns: [],
        renderedQuery: "SELECT 1",
      }),
    ).toThrow("Profile sample response is missing resultColumns");
  });

  it("limits lookup metadata to columns projected by the sampled query", () => {
    const response: ProfileSampleResponse = {
      rows: [{ message: "started" }],
      columns: [
        { name: "message", type: "string", filter: { kind: "text" } },
        { name: "container", type: "string", filter: { kind: "terms" } },
      ],
      resultColumns: [
        {
          name: "message",
          filterKey: "filter.message",
          filter: { kind: "text" },
        },
      ],
      renderedQuery: "SELECT message FROM logs",
    };

    expect(profileSampleFilterColumns(response)).toEqual([
      { name: "message", type: "string", filter: { kind: "text" } },
    ]);
  });
});
