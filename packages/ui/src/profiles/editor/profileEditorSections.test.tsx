import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { LookupFetcher } from "../../components/json-schema-form-types";
import { configureProfiles } from "../profileApi";
import { ProfileSourceSection } from "./profileEditorSections";
import { testProfileSchema } from "./testSchema";

describe("ProfileSourceSection", () => {
  beforeAll(() => configureProfiles({ schema: testProfileSchema }));

  it("renders provider.connection as a saved connection picker scoped by provider type", async () => {
    const lookupFetcher = vi.fn<LookupFetcher>(async () => [
      { value: "connection://warehouse", label: "warehouse (postgres)" },
    ]);

    render(
      <ProfileSourceSection
        draft={{ profile: "Logs", provider: { type: "sql" } }}
        discovered={[]}
        sampleStale={false}
        lookupFetcher={lookupFetcher}
        onChange={vi.fn()}
        onSample={vi.fn()}
      />,
    );

    const picker = screen.getByRole("combobox", { name: "Connection" });
    fireEvent.focus(picker);

    await waitFor(() =>
      expect(lookupFetcher).toHaveBeenCalledWith({
        descriptor: expect.objectContaining({
          url: "/api/v1/connection",
          filter: "connection",
        }),
        query: "",
        rootValue: {
          connection: "",
          provider: { type: "sql" },
        },
      }),
    );
    expect(
      await screen.findByRole("option", { name: "warehouse (postgres)" }),
    ).toBeInTheDocument();
  });
});
