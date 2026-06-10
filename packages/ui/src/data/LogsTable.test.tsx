import { fireEvent, render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import { LogsTable } from "./LogsTable";
import { normalizeLogsTableRows } from "./logs-normalize";

const nestedLine = JSON.stringify({
  "@timestamp": "2026-05-03T10:09:30.288Z",
  "log.level": "INFO",
  message: "Filtering request path: appBanner/bannerInfo",
  "ecs.version": "1.2.0",
  "service.name": "policy-api",
  "event.dataset": "policy-api",
  "process.thread.name": "http-nio-8080-exec-6",
  "log.logger": "com.example.policy.filter.ServiceRequestFilter",
});

const envelopeLine = JSON.stringify({
  pod: "policy-api-644b55c866-mg7tg",
  container: "policy-api",
  line: nestedLine,
  timestamp: "2026-05-03T10:09:30.288130925Z",
  labels: {
    namespace: "claims-demo",
    pod: "policy-api-644b55c866-mg7tg",
  },
});

const otherEnvelopeLine = JSON.stringify({
  pod: "billing-api-7f9c5d4b8-xk2pq",
  container: "billing-api",
  line: JSON.stringify({
    "@timestamp": "2026-05-03T10:10:00.000Z",
    "log.level": "ERROR",
    message: "Processing invoice batch",
    "service.name": "billing-api",
  }),
  timestamp: "2026-05-03T10:10:00.000000000Z",
  labels: {
    namespace: "billing-demo",
    pod: "billing-api-7f9c5d4b8-xk2pq",
  },
});

describe("LogsTable", () => {
  it("normalizes Kubernetes envelope JSON lines with nested ECS JSON", () => {
    const row = normalizeLogsTableRows(envelopeLine)[0]!;

    expect(row).toMatchObject({
      timestamp: "2026-05-03T10:09:30.288130925Z",
      level: "INFO",
      pod: "policy-api-644b55c866-mg7tg",
      logger: "com.example.policy.filter.ServiceRequestFilter",
      thread: "http-nio-8080-exec-6",
      message: "Filtering request path: appBanner/bannerInfo",
    });
    expect(row.tags).toEqual(
      expect.arrayContaining([
        "namespace=claims-demo",
        "container=policy-api",
        "service=policy-api",
      ]),
    );
  });

  it("renders namespace, container, and service as tags instead of default columns", () => {
    render(<LogsTable logs={envelopeLine} />);

    expect(screen.queryByRole("columnheader", { name: /namespace/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /container/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("columnheader", { name: /^service$/i })).not.toBeInTheDocument();
    // LogsTable defaults to compact density, so keyed tags render only the
    // value inline (the key is dropped from the badge but kept in the title
    // attribute and the overflow popover). Assert the tag values are
    // rendered in the same table cell.
    const cell = screen.getByText("claims-demo").closest("td");
    expect(cell).not.toBeNull();
    // "policy-api" appears as both container and service values in the tag list.
    expect(within(cell as HTMLElement).getAllByText("policy-api").length).toBeGreaterThanOrEqual(1);
  });

  it("defaults to compact, system-themed table styling", () => {
    render(<LogsTable logs="plain log line" />);

    const table = screen.getByRole("table");
    // jsdom's matchMedia reports prefers-color-scheme: dark as false, so the
    // resolved system theme is "light" by default in tests.
    expect(table.closest('[data-theme="light"]')).not.toBeNull();
    expect(table.closest('[data-density="compact"]')).not.toBeNull();
  });

  it("forces dark styling when theme='dark' is passed", () => {
    render(<LogsTable logs="plain log line" theme="dark" />);

    expect(screen.getByRole("table").closest('[data-theme="dark"]')).not.toBeNull();
  });

  it("forces light styling when theme='light' is passed", () => {
    render(<LogsTable logs="plain log line" theme="light" />);

    expect(screen.getByRole("table").closest('[data-theme="light"]')).not.toBeNull();
    expect(screen.getByRole("table").closest('[data-theme="dark"]')).toBeNull();
  });

  it("falls back to plain lines and invalid JSON without throwing", () => {
    render(<LogsTable logs={'plain line\n{"not valid"'} />);

    expect(screen.getByText("plain line")).toBeInTheDocument();
    expect(screen.getByText('{"not valid"')).toBeInTheDocument();
  });

  it("shows processed log details as one nested description list when a row is expanded", () => {
    render(<LogsTable logs={envelopeLine} />);

    fireEvent.click(screen.getByText("Filtering request path: appBanner/bannerInfo"));

    expect(screen.queryByText("Line")).not.toBeInTheDocument();
    expect(screen.queryByText("Parsed line")).not.toBeInTheDocument();
    expect(screen.queryByText("Raw record")).not.toBeInTheDocument();
    expect(screen.queryByText("Merged final state")).not.toBeInTheDocument();
    expect(screen.getByRole("term", { name: "Timestamp" })).toBeInTheDocument();
    expect(screen.getByRole("term", { name: "Message" })).toBeInTheDocument();
    expect(screen.getByRole("term", { name: "Tags" })).toBeInTheDocument();
    expect(
      screen.getAllByText("Filtering request path: appBanner/bannerInfo").length,
    ).toBeGreaterThan(1);
    expect(screen.queryByRole("term", { name: "Labels" })).not.toBeInTheDocument();
    expect(screen.queryByRole("term", { name: "Line" })).not.toBeInTheDocument();
    expect(screen.getAllByRole("definition").length).toBeGreaterThan(0);
    // Tags render as a nested key/value Properties list (expanded by default)
    // with per-tag include/exclude/copy actions.
    expect(
      screen.getByRole("button", { name: /include namespace=claims-demo/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /collapse tags/i })).toBeInTheDocument();
  });

  it("expands, collapses, and copies expanded nested object values", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });
    render(<LogsTable logs={envelopeLine} />);

    fireEvent.click(screen.getByText("Filtering request path: appBanner/bannerInfo"));
    fireEvent.click(screen.getByRole("button", { name: /collapse attributes/i }));

    expect(
      screen.getAllByText((_, element) => element?.textContent === "{ 1 properties }").length,
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /expand attributes/i }));
    fireEvent.click(screen.getByRole("button", { name: /copy attributes/i }));

    expect(writeText).toHaveBeenCalledWith(
      JSON.stringify({ "ecs.version": "1.2.0" }, null, 2),
    );
  });

  it("renders tags as nested key/value properties with include/exclude/copy actions", () => {
    render(<LogsTable logs={envelopeLine} />);

    fireEvent.click(screen.getByText("Filtering request path: appBanner/bannerInfo"));

    expect(
      screen.getByRole("button", { name: /include namespace=claims-demo/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /exclude namespace=claims-demo/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy namespace=claims-demo/i })).toBeInTheDocument();
    // Each tag is a key=value row; the key segment is rendered as the label.
    expect(screen.getByText("namespace")).toBeInTheDocument();
  });

  it("filters rows when a tag include action is clicked in the row detail", () => {
    render(<LogsTable logs={[envelopeLine, otherEnvelopeLine]} />);

    expect(screen.getByText("Processing invoice batch")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Filtering request path: appBanner/bannerInfo"));
    fireEvent.click(screen.getByRole("button", { name: /include namespace=claims-demo/i }));

    expect(screen.queryByText("Processing invoice batch")).not.toBeInTheDocument();
    expect(
      screen.getAllByText("Filtering request path: appBanner/bannerInfo").length,
    ).toBeGreaterThan(0);
  });

  it("filters rows when a non-tag multi-select field include action is clicked", () => {
    render(<LogsTable logs={[envelopeLine, otherEnvelopeLine]} />);

    // Two distinct levels (INFO, ERROR) make "level" a tristate multi filter.
    expect(screen.getByText("Processing invoice batch")).toBeInTheDocument();

    fireEvent.click(screen.getByText("Filtering request path: appBanner/bannerInfo"));
    fireEvent.click(screen.getByRole("button", { name: /^include level$/i }));

    // Including INFO hides the ERROR row.
    expect(screen.queryByText("Processing invoice batch")).not.toBeInTheDocument();
    expect(
      screen.getAllByText("Filtering request path: appBanner/bannerInfo").length,
    ).toBeGreaterThan(0);
  });

  it("does not show include/exclude actions for non-multi fields (timestamp)", () => {
    render(<LogsTable logs={[envelopeLine, otherEnvelopeLine]} />);

    fireEvent.click(screen.getByText("Filtering request path: appBanner/bannerInfo"));

    // Timestamp is range-filtered, not a tristate multi filter, so it gets no
    // include/exclude affordance in the detail.
    expect(screen.queryByRole("button", { name: /include timestamp/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /exclude timestamp/i })).not.toBeInTheDocument();
  });

  it("opens logs in a full screen dialog", () => {
    render(<LogsTable logs={envelopeLine} />);

    fireEvent.click(screen.getByRole("button", { name: /open logs full screen/i }));

    const dialog = screen.getByRole("dialog", { name: /logs/i });
    expect(dialog).toHaveClass("h-[95vh]");
    expect(within(dialog).getByRole("table")).toBeInTheDocument();
    expect(within(dialog).queryByRole("button", { name: /open logs full screen/i })).toBeNull();
  });

  it("places the fullscreen button immediately before the column menu trigger", () => {
    render(<LogsTable logs={envelopeLine} />);

    const fullscreen = screen.getByRole("button", { name: /open logs full screen/i });
    const columnMenu = screen.getByRole("button", { name: /open column menu/i });
    // Same parent (filter-bar trailing slot) and the fullscreen button immediately
    // precedes the 3-dot trigger — no absolute overlay.
    expect(fullscreen.parentElement).toBe(columnMenu.parentElement);
    expect(fullscreen.nextElementSibling).toBe(columnMenu);
    expect(fullscreen.className).not.toMatch(/absolute/);
  });

  it("shows theme options in the column menu and switches the wrapper data-theme", () => {
    render(<LogsTable logs={envelopeLine} />);

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));

    const lightItem = screen.getByRole("menuitemradio", { name: /^light$/i });
    fireEvent.click(lightItem);
    expect(screen.getByRole("table").closest('[data-theme="light"]')).not.toBeNull();

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /^dark$/i }));
    expect(screen.getByRole("table").closest('[data-theme="dark"]')).not.toBeNull();
  });

  it("changes density via the column-menu density section", () => {
    render(<LogsTable logs={envelopeLine} />);

    const wrapper = screen.getByRole("table").closest("[data-density]");
    expect(wrapper?.getAttribute("data-density")).toBe("compact");

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /^spacious$/i }));

    expect(screen.getByRole("table").closest("[data-density]")?.getAttribute("data-density")).toBe(
      "spacious",
    );
  });

  it("hides the theme menu section when showThemeControl is false", () => {
    render(<LogsTable logs={envelopeLine} showThemeControl={false} />);

    fireEvent.click(screen.getByRole("button", { name: /open column menu/i }));

    expect(screen.queryByRole("menuitemradio", { name: /^light$/i })).toBeNull();
    expect(screen.queryByRole("menuitemradio", { name: /^dark$/i })).toBeNull();
  });
});
