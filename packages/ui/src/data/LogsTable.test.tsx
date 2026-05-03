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
    expect(screen.getByText("namespace")).toBeInTheDocument();
    expect(screen.getByText("container")).toBeInTheDocument();
    expect(screen.getByText("service")).toBeInTheDocument();
  });

  it("defaults to compact dark table styling", () => {
    render(<LogsTable logs="plain log line" />);

    const table = screen.getByRole("table");
    expect(table.closest('[data-theme="dark"]')).not.toBeNull();
    expect(table.closest('[data-density="compact"]')).not.toBeNull();
  });

  it("can disable the dark wrapper", () => {
    render(<LogsTable logs="plain log line" dark={false} />);

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
});
