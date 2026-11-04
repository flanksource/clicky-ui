import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { ProfileMappingPreview } from "./profileMappingPreview";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("previews mapped columns and opens canonical trace details without rerunning the source", async () => {
  const canonical = {
    traceId: "trace",
    spanId: "root",
    startedAt: "2026-11-02T10:00:00Z",
    durationMs: 0.25,
    service: "checkout",
    operation: "GET /orders",
    status: "unset",
  };
  const rows = [{ _trace: canonical, title: "Mapped root" }];
  const fetcher = vi
    .fn()
    .mockImplementation(
      async () =>
        new Response(
          JSON.stringify({
            rows,
            document: {
              node: {
                kind: "table",
                columns: [{ name: "title", label: "Request" }],
                rows: [
                  {
                    cells: {
                      title: {
                        kind: "text",
                        text: "Mapped root",
                        plain: "Mapped root",
                      },
                    },
                  },
                ],
              },
            },
          }),
          { status: 200 },
        ),
    );
  vi.stubGlobal("fetch", fetcher);
  const profile = {
    _id: "editor-only",
    profile: "Draft",
    render: "traces",
    columns: [{ name: "title", label: "Request" }],
  };
  const view = render(<ProfileMappingPreview profile={profile} rows={rows} />);
  expect(await screen.findByText("Mapped root")).toBeInTheDocument();
  expect(screen.getByText("Request")).toBeInTheDocument();
  expect(screen.queryByRole("link")).not.toBeInTheDocument();
  fireEvent.click(screen.getByText("Mapped root"));
  expect(
    screen.getByRole("button", { name: "Back to traces" }),
  ).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Back to traces" }));
  expect(screen.getByText("Mapped root")).toBeInTheDocument();
  view.rerender(
    <ProfileMappingPreview
      profile={{
        ...profile,
        columns: [{ name: "title", label: "Edited request" }],
      }}
      rows={rows}
    />,
  );
  await waitFor(() => expect(fetcher).toHaveBeenCalledTimes(2));
  expect(
    fetcher.mock.calls.every((call) =>
      String(call[0]).endsWith("/profile/sample/mapping"),
    ),
  ).toBe(true);
  expect(JSON.parse(fetcher.mock.calls[0]![1].body).profile).not.toHaveProperty(
    "_id",
  );
});
