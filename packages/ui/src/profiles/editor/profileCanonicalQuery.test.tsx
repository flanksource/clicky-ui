import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { configureProfiles } from "../profileApi";
import { ProfileCanonicalQuery } from "./profileCanonicalQuery";

vi.mock("../elasticsearch/esQueryBuilder", () => ({
  EsQueryBuilder: ({
    vocabulary,
    fields,
  }: {
    vocabulary: unknown;
    fields: { name: string }[];
  }) => (
    <>
      <output data-testid="query-vocabulary">
        {JSON.stringify(vocabulary)}
      </output>
      <output data-testid="canonical-fields">
        {fields.map((field) => field.name).join(",")}
      </output>
    </>
  ),
}));
afterEach(() => vi.unstubAllGlobals());

const search = {
  query: { op: "term" as const, field: "service", value: { param: "service" } },
};
const params = [{ name: "service", default: "checkout" }];
const translation = {
  search,
  native: { query: { term: { "process.serviceName": "checkout" } } },
  layout: { fields: { service: { type: "keyword" } } },
};

it("keeps mapped field choices available while a condition is invalid", async () => {
  configureProfiles({ schema: { type: "object", properties: {} } });
  vi.stubGlobal(
    "fetch",
    vi.fn().mockImplementation((_url: string, init: RequestInit) => {
      const input = JSON.parse(String(init.body));
      return Promise.resolve(
        new Response(
          input.profile.search?.query?.field === ""
            ? "A field is required"
            : JSON.stringify(translation),
          { status: input.profile.search?.query?.field === "" ? 422 : 200 },
        ),
      );
    }),
  );
  const draft = {
    provider: { type: "opensearch", connection: "jaeger" },
    search,
  };
  const { rerender } = render(
    <ProfileCanonicalQuery
      draft={draft}
      onChange={vi.fn()}
      onSample={vi.fn()}
    />,
  );
  await waitFor(() =>
    expect(screen.getByTestId("canonical-fields").textContent).toBe("service"),
  );
  rerender(
    <ProfileCanonicalQuery
      draft={{ ...draft, search: { query: { ...search.query, field: "" } } }}
      onChange={vi.fn()}
      onSample={vi.fn()}
    />,
  );
  await screen.findByRole("alert");
  expect(screen.getByTestId("canonical-fields").textContent).toBe("service");
});

it("reads the canonical operator and sort vocabulary from the profile schema", () => {
  configureProfiles({
    schema: {
      type: "object",
      properties: {
        search: {
          type: "object",
          properties: {
            sort: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  order: { type: "string", enum: ["asc", "desc"] },
                },
              },
            },
          },
        },
      },
    },
  });
  render(
    <ProfileCanonicalQuery
      draft={{ search }}
      onChange={vi.fn()}
      onSample={vi.fn()}
    />,
  );
  expect(
    JSON.parse(screen.getByTestId("query-vocabulary").textContent ?? "{}")
      .sortOrders,
  ).toEqual(["asc", "desc"]);
});

it("imports native conditions into the draft while preserving parameter references", async () => {
  configureProfiles({ schema: { type: "object", properties: {} } });
  const fetcher = vi
    .fn()
    .mockResolvedValue(new Response(JSON.stringify(translation)));
  vi.stubGlobal("fetch", fetcher);
  const onChange = vi.fn();
  render(
    <ProfileCanonicalQuery
      draft={{
        profile: "portable",
        provider: {
          type: "opensearch",
          connection: "jaeger",
          options: {
            index: "spans",
            search: {
              query: {
                op: "term",
                field: "process.serviceName",
                value: { param: "service" },
              },
            },
          },
        },
        params,
      }}
      onChange={onChange}
      onSample={vi.fn()}
    />,
  );
  fireEvent.click(
    screen.getByRole("button", { name: "Use canonical conditions" }),
  );
  await waitFor(() => expect(onChange).toHaveBeenCalledOnce());
  expect(onChange.mock.calls[0][0]).toMatchObject({
    search,
    params,
    query: "",
    provider: { connection: "jaeger", options: { index: "spans" } },
  });
  expect(onChange.mock.calls[0][0].provider.options).not.toHaveProperty(
    "search",
  );
});

it("resolves a changed connection without replacing logical conditions and samples the same search", async () => {
  configureProfiles({ schema: { type: "object", properties: {} } });
  const fetcher = vi
    .fn()
    .mockImplementation((url: string) =>
      Promise.resolve(
        new Response(
          JSON.stringify(
            url.endsWith("/query") ? translation : { rows: [], columns: [] },
          ),
        ),
      ),
    );
  vi.stubGlobal("fetch", fetcher);
  const onChange = vi.fn();
  const onSample = vi.fn();
  const draft = {
    profile: "portable",
    provider: {
      type: "opensearch",
      connection: "jaeger",
      options: { index: "spans" },
    },
    search,
    params,
  };
  const { rerender } = render(
    <ProfileCanonicalQuery
      draft={draft}
      onChange={onChange}
      onSample={onSample}
    />,
  );
  await waitFor(() =>
    expect(
      fetcher.mock.calls.some(
        ([, init]) =>
          JSON.parse(init.body).profile.search?.query?.field === "service",
      ),
    ).toBe(true),
  );
  const next = {
    ...draft,
    provider: { ...draft.provider, connection: "otel" },
  };
  rerender(
    <ProfileCanonicalQuery
      draft={next}
      onChange={onChange}
      onSample={onSample}
    />,
  );
  await waitFor(() =>
    expect(
      fetcher.mock.calls.some(([, init]) => {
        const input = JSON.parse(init.body);
        return (
          input.profile.provider.connection === "otel" &&
          input.profile.search?.query?.field === "service"
        );
      }),
    ).toBe(true),
  );
  const resolved = fetcher.mock.calls
    .map(([, init]) => JSON.parse(init.body))
    .find(
      (input) =>
        input.profile.provider.connection === "otel" &&
        input.profile.search?.query?.field === "service",
    );
  expect(resolved).toMatchObject({
    direction: "source",
    profile: { search, provider: { connection: "otel" } },
  });
  expect(onChange).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Run sample" }));
  await waitFor(() => expect(onSample).toHaveBeenCalledOnce());
  expect(
    JSON.parse(
      fetcher.mock.calls.find(([url]) => !url.endsWith("/query"))?.[1].body,
    ),
  ).toMatchObject({
    profile: { search, provider: { connection: "otel" } },
    params: { service: "checkout" },
    previewProcessors: true,
  });
});
