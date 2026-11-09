import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { LookupFetcher } from "../../components/json-schema-form-types";
import { configureProfiles } from "../profileApi";
import { ProfileGeneralSection, ProfileSourceSection } from "./profileEditorSections";
import { testProfileSchema } from "./testSchema";

describe("ProfileGeneralSection", () => {
  it("selects and restores the traces render mode without changing the source", () => {
    const draft = { profile: "Service traces", provider: { type: "opentelemetry" }, render: "traces" };
    const onChange = vi.fn();
    render(<ProfileGeneralSection draft={draft} onChange={onChange} />);
    const mode = screen.getByRole("combobox", { name: "Render mode" });
    expect(mode).toHaveValue("traces");
    fireEvent.change(mode, { target: { value: "logs" } });
    expect(onChange).toHaveBeenLastCalledWith({ ...draft, render: "logs" });
    fireEvent.change(mode, { target: { value: "traces" } });
    expect(onChange).toHaveBeenLastCalledWith(draft);
  });
});

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

  it("renders the inline address beside the connection picker and keeps the other options when either is edited", () => {
    const options = { index: "logs-*", address: "" };
    const draft = { profile: "Logs", provider: { type: "opensearch", options } };
    const onChange = vi.fn();
    render(
      <ProfileSourceSection draft={draft} discovered={[]} sampleStale={false} onChange={onChange} onSample={vi.fn()} />,
    );
    const address = screen.getByRole("textbox", { name: "Address" });
    const sourceCard = screen.getByRole("combobox", { name: "Connection" }).closest("section");
    expect(sourceCard).toContainElement(address);
    expect(screen.getAllByRole("textbox", { name: "Address" })).toHaveLength(1);

    const inlineURL = "https://search.example.test";
    fireEvent.change(address, { target: { value: inlineURL } });
    expect(onChange).toHaveBeenLastCalledWith({ ...draft, provider: { ...draft.provider, options: { ...options, address: inlineURL } } });

    const pattern = "traces-*";
    fireEvent.change(screen.getByRole("textbox", { name: "Index" }), { target: { value: pattern } });
    expect(onChange).toHaveBeenLastCalledWith({ ...draft, provider: { ...draft.provider, options: { ...options, index: pattern } } });
  });
});
