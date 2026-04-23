import { fireEvent, render, screen, within } from "@testing-library/react";
import { vi } from "vitest";
import { Clicky, type ClickyDocument } from "./Clicky";
import { clickyFixture } from "./Clicky.fixtures";

describe("Clicky", () => {
  it("renders a JSON string payload", () => {
    render(<Clicky data={JSON.stringify(clickyFixture)} />);

    expect(screen.getByText("Cluster Status")).toBeInTheDocument();
    expect(screen.getByText(/Healthy/)).toBeInTheDocument();
  });

  it("sorts tables and expands row detail", () => {
    render(<Clicky data={clickyFixture} />);

    const latencyHeader = screen.getByRole("button", { name: /latency/i });
    fireEvent.click(latencyHeader);
    fireEvent.click(latencyHeader);

    const rows = screen.getAllByRole("row");
    expect(rows[1]).toHaveTextContent("worker");
    expect(rows[2]).toHaveTextContent("api");

    fireEvent.click(rows[2]);

    expect(screen.getByText("platform")).toBeInTheDocument();
    expect(
      screen.getAllByText(
        (_, element) => element?.textContent?.includes("apiVersion: v1") ?? false,
      )[0],
    ).toBeInTheDocument();
  });

  it("supports auto-filtered clicky tables", () => {
    const clickyDocument: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        autoFilter: true,
        columns: [
          { name: "service", label: "Service", grow: true },
          { name: "status", label: "Status", shrink: true },
        ],
        rows: [
          {
            cells: {
              service: { kind: "text", text: "api", plain: "api" },
              status: { kind: "text", text: "healthy", plain: "healthy" },
            },
            detail: {
              kind: "code",
              language: "yaml",
              source: "kind: Deployment\nmetadata:\n  name: api",
            },
          },
          {
            cells: {
              service: { kind: "text", text: "worker", plain: "worker" },
              status: { kind: "text", text: "degraded", plain: "degraded" },
            },
          },
        ],
      },
    };

    render(<Clicky data={clickyDocument} />);

    fireEvent.click(screen.getByRole("button", { name: /status filter/i }));
    const healthyFilter = document.querySelector('[data-filter-option="healthy"]');
    if (!healthyFilter) {
      throw new Error("Expected healthy filter option");
    }
    fireEvent.click(healthyFilter);

    expect(screen.getByText("api")).toBeInTheDocument();
    expect(screen.queryByText("worker")).not.toBeInTheDocument();

    fireEvent.click(screen.getByText("api"));

    expect(screen.getByText(/kind: Deployment/)).toBeInTheDocument();
  });

  it("exposes Clicky and JSON primary views with overflow formats and JSON-first downloads", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input) => {
        const url = String(input);

        if (url.includes("format=clicky-json")) {
          return new Response(JSON.stringify(clickyFixture), {
            status: 200,
            headers: { "Content-Type": "application/json+clicky" },
          });
        }

        if (url.includes("format=json")) {
          return new Response(
            JSON.stringify({
              service: "api",
              healthy: true,
              replicas: 3,
            }),
            {
              status: 200,
              headers: { "Content-Type": "application/json" },
            },
          );
        }

        if (url.includes("format=markdown")) {
          return new Response("# Report\n\nAll systems nominal.", {
            status: 200,
            headers: { "Content-Type": "text/markdown" },
          });
        }

        return new Response("", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      });
    const submittedActions: string[] = [];
    const submitSpy = vi
      .spyOn(HTMLFormElement.prototype, "submit")
      .mockImplementation(function (this: HTMLFormElement) {
        submittedActions.push(this.action);
      });

    render(<Clicky url="/api/clicky/report" />);

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/clicky/report?format=clicky-json",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: expect.stringContaining("application/json+clicky"),
        }),
      }),
    );
    expect(await screen.findByText("Cluster Status")).toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: /clicky view mode/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "Clicky" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "JSON" })).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: "PDF" })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^download json/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "JSON" }));

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/clicky/report?format=json",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: expect.stringContaining("application/json"),
        }),
      }),
    );
    expect(await screen.findByLabelText("JSON tree")).toBeInTheDocument();
    expect(screen.getByText("service")).toBeInTheDocument();
    expect(screen.getByText("\"api\"")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open additional view menu/i }));
    expect(screen.getByRole("menuitemradio", { name: /pdf/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /html/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /markdown/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /yaml/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /csv/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /pretty/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /excel/i })).toBeInTheDocument();
    expect(screen.getByRole("menuitemradio", { name: /slack/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitemradio", { name: /pdf/i }));

    expect(screen.getByTitle("Clicky PDF preview")).toHaveAttribute(
      "src",
      "/api/clicky/report?format=pdf",
    );
    expect(screen.getByRole("button", { name: /open download menu/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open additional view menu/i }));
    fireEvent.click(screen.getByRole("menuitemradio", { name: /markdown/i }));

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/clicky/report?format=markdown",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: expect.stringContaining("text/markdown"),
        }),
      }),
    );
    expect(await screen.findByLabelText("Clicky text preview")).toHaveTextContent("# Report");

    fireEvent.click(screen.getByRole("button", { name: /^download json/i }));

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submittedActions[0]).toContain("/api/clicky/report?format=json");

    fireEvent.click(screen.getByRole("button", { name: /open download menu/i }));
    expect(screen.getByText("Rendered Clicky JSON with the rich Clicky viewer")).toBeInTheDocument();
    expect(screen.getByText("Portable document for sharing and printing")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: /clicky/i }));

    expect(submitSpy).toHaveBeenCalledTimes(2);
    expect(submittedActions[1]).toContain("/api/clicky/report?format=clicky-json");

    fetchSpy.mockRestore();
    submitSpy.mockRestore();
  });

  it("supports an empty remote view config without rendering the mode switcher", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockImplementation(async (input) => {
        const url = String(input);

        if (url.includes("format=clicky-json")) {
          return new Response(JSON.stringify(clickyFixture), {
            status: 200,
            headers: { "Content-Type": "application/json+clicky" },
          });
        }

        return new Response("", {
          status: 200,
          headers: { "Content-Type": "text/plain" },
        });
      });
    const submittedActions: string[] = [];
    const submitSpy = vi
      .spyOn(HTMLFormElement.prototype, "submit")
      .mockImplementation(function (this: HTMLFormElement) {
        submittedActions.push(this.action);
      });

    render(
      <Clicky
        url="/api/clicky/report"
        data={clickyFixture}
        view={[]}
        download={{ all: true, label: "report" }}
      />,
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/clicky/report?format=clicky-json",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: expect.stringContaining("application/json+clicky"),
        }),
      }),
    );
    expect(await screen.findByText("Cluster Status")).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: /clicky view mode/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /open additional view menu/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download json/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open download menu/i }));
    expect(screen.getByText("Portable document for sharing and printing")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: /pdf/i }));

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submittedActions[0]).toContain("/api/clicky/report?format=pdf");

    fetchSpy.mockRestore();
    submitSpy.mockRestore();
  });

  it("renders tree nodes through the native tree component", () => {
    render(<Clicky data={clickyFixture} />);

    const tree = screen.getByRole("tree");
    expect(tree).toBeInTheDocument();
    expect(
      within(tree).getAllByText((_, element) => element?.textContent === "cluster / prod-eu")[0],
    ).toBeInTheDocument();
    expect(within(tree).getByText("worker")).toBeInTheDocument();
  });

  it("sanitizes html fallback content", () => {
    const malicious: ClickyDocument = {
      version: 1,
      node: {
        kind: "html",
        html: '<span>Hello</span><script>window.__x = true</script><a href="javascript:alert(1)" onclick="alert(2)">bad</a>',
      },
    };

    const { container } = render(<Clicky data={malicious} />);
    expect(container.querySelector("script")).toBeNull();
    expect(container.innerHTML).not.toContain("onclick=");
    expect(container.innerHTML).not.toContain("javascript:");
  });

  it("shows a compact error for invalid JSON", () => {
    render(<Clicky data={"{"} />);

    expect(screen.getByText("Invalid Clicky payload")).toBeInTheDocument();
  });
});
