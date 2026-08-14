import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Clicky, type ClickyDocument } from "../Clicky";

const tableDocument: ClickyDocument = {
  version: 1,
  node: {
    kind: "table",
    columns: [
      { name: "code", label: "Code" },
      { name: "name", label: "Name" },
    ],
    rows: [
      {
        cells: {
          code: { kind: "text", text: "200", plain: "200" },
          name: { kind: "text", text: "Sales", plain: "Sales" },
        },
      },
    ],
  },
};

const info = {
  profile: "orders",
  provider: "postgres",
  url: "/api/v1/profile/orders?limit=5",
  mode: "page",
  rows: 1,
  durationMs: 12.4,
  headers: { "X-Total-Count": "137" },
  diagnostics: {
    provider: "postgres",
    request: {
      query: "SELECT * FROM orders WHERE state = $1 LIMIT 5",
      arguments: ["open"],
    },
    response: { returnedRows: 1, durationMs: 11 },
  },
};

function stubRemote() {
  return vi
    .spyOn(globalThis, "fetch")
    .mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      const body = url.includes("__info=true") ? info : tableDocument;
      return new Response(JSON.stringify(body), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    });
}

describe("Debug on a remote Clicky table", () => {
  afterEach(() => vi.restoreAllMocks());

  it("asks the result URL what it ran and shows the answer", async () => {
    const fetchSpy = stubRemote();

    render(
      <Clicky url="/api/v1/profile/orders?limit=5" data={tableDocument} />,
    );
    expect(await screen.findByRole("table")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    const menu = screen.getByRole("menu", { name: /column menu/i });
    fireEvent.click(
      within(menu).getByRole("menuitem", { name: /^debug$/i }),
    );

    // The details come from the same URL the rows came from, marked as a
    // question — every filter and paging parameter carried along.
    expect(
      fetchSpy.mock.calls.some(([input]) =>
        String(input).includes("/api/v1/profile/orders?limit=5&__info=true"),
      ),
    ).toBe(true);

    const dialog = await screen.findByRole("dialog");
    expect(
      await within(dialog).findByLabelText("Provider query"),
    ).toHaveTextContent("SELECT * FROM orders WHERE state = $1 LIMIT 5");
    expect(within(dialog).getByText(/X-Total-Count: 137/)).toBeInTheDocument();
  });

  it("sits beside Export rather than behind a wall of formats", async () => {
    stubRemote();

    render(
      <Clicky
        url="/api/v1/profile/orders?limit=5"
        data={tableDocument}
        download={{ all: true, label: "orders" }}
      />,
    );
    expect(await screen.findByRole("table")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    const menu = screen.getByRole("menu", { name: /column menu/i });
    const actions = within(menu)
      .getAllByRole("menuitem")
      .map((item) => item.textContent ?? "");

    // Three rows, in this order. Ten view formats and five download formats
    // are behind the first two, so Debug is on screen without scrolling.
    expect(actions).toHaveLength(3);
    expect(actions[0]).toMatch(/^View:/);
    expect(actions[1]).toMatch(/^Export/);
    expect(actions[2]).toMatch(/^Debug$/);
  });

  it("names the all-rows export by the total the table was given", async () => {
    stubRemote();

    render(
      <Clicky
        url="/api/v1/profile/orders?limit=5"
        data={tableDocument}
        download={{ all: true, scopes: ["page", "all"] }}
        pagination={{
          page: 0,
          pageSize: 5,
          total: 1372,
          totalRelation: "eq",
          onPageChange: () => {},
        }}
      />,
    );
    expect(await screen.findByRole("table")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /^Export/i }));

    const dialog = await screen.findByRole("dialog");
    // The count is the thing a person needs before starting an export, and the
    // page in front of them never shows it.
    expect(
      within(dialog).getByRole("radio", { name: "All 1,372 rows" }),
    ).toBeInTheDocument();
    expect(
      within(dialog).queryByRole("radio", { name: "All rows" }),
    ).not.toBeInTheDocument();
  });

  it("reports a lower-bound total as a bound rather than a count", async () => {
    stubRemote();

    render(
      <Clicky
        url="/api/v1/profile/orders?limit=5"
        data={tableDocument}
        download={{ all: true, scopes: ["page", "all"] }}
        pagination={{
          page: 0,
          pageSize: 5,
          total: 10000,
          totalRelation: "gte",
          onPageChange: () => {},
        }}
      />,
    );
    expect(await screen.findByRole("table")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /^Export/i }));

    expect(
      within(await screen.findByRole("dialog")).getByRole("radio", {
        name: "All 10,000+ rows",
      }),
    ).toBeInTheDocument();
  });

  it("offers nothing to ask when the payload has no URL behind it", () => {
    render(<Clicky data={tableDocument} />);

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    expect(
      within(screen.getByRole("menu", { name: /column menu/i })).queryByRole(
        "menuitem",
        { name: /^debug$/i },
      ),
    ).not.toBeInTheDocument();
  });
});
