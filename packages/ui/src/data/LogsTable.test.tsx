import { fireEvent, render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import { LogsTable, normalizeLogsTableRows } from "./LogsTable";

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
    expect(screen.getByRole("button", { name: /expand tags/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /collapse tags/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /copy tags/i })).toBeInTheDocument();
  });

  it("expands, collapses, and copies expanded nested values", () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: {
        writeText,
      },
    });
    render(<LogsTable logs={envelopeLine} />);

    fireEvent.click(screen.getByText("Filtering request path: appBanner/bannerInfo"));
    fireEvent.click(screen.getByRole("button", { name: /collapse tags/i }));

    expect(
      screen.getAllByText((_, element) => element?.textContent === "[6 items]").length,
    ).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole("button", { name: /expand tags/i }));
    fireEvent.click(screen.getByRole("button", { name: /copy tags/i }));

    expect(screen.getAllByText("namespace=claims-demo").length).toBeGreaterThanOrEqual(1);
    expect(writeText).toHaveBeenCalledWith(
      JSON.stringify(
        [
          "namespace=claims-demo",
          "container=policy-api",
          "service=policy-api",
          "dataset=policy-api",
          "ecs.version=1.2.0",
          "pod=policy-api-644b55c866-mg7tg",
        ],
        null,
        2,
      ),
    );
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
