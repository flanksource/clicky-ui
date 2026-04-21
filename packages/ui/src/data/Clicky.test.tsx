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

  it("fetches remote clicky data, switches views, and submits downloads", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(clickyFixture), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
    const submittedActions: string[] = [];
    const submitSpy = vi
      .spyOn(HTMLFormElement.prototype, "submit")
      .mockImplementation(function (this: HTMLFormElement) {
        submittedActions.push(this.action);
      });

    render(
      <Clicky
        url="/api/clicky/report"
        view={{ json: true, pdf: true }}
        download={{ all: true }}
      />,
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/clicky/report?format=json",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: expect.stringContaining("application/json"),
        }),
      }),
    );
    expect(await screen.findByText("Cluster Status")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "PDF" }));

    expect(screen.getByTitle("Clicky PDF preview")).toHaveAttribute(
      "src",
      "/api/clicky/report?format=pdf",
    );
    expect(screen.getByRole("button", { name: /open download menu/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^download$/i }));

    expect(submitSpy).toHaveBeenCalledTimes(1);
    expect(submittedActions[0]).toContain("/api/clicky/report?format=pdf");

    fireEvent.click(screen.getByRole("button", { name: /open download menu/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /^json$/i }));

    expect(submitSpy).toHaveBeenCalledTimes(2);
    expect(submittedActions[1]).toContain("/api/clicky/report?format=json");

    fetchSpy.mockRestore();
    submitSpy.mockRestore();
  });

  it("supports an empty remote view config without rendering the mode switcher", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(
        new Response(JSON.stringify(clickyFixture), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }),
      );
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
      "/api/clicky/report?format=json",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: expect.stringContaining("application/json"),
        }),
      }),
    );
    expect(await screen.findByText("Cluster Status")).toBeInTheDocument();
    expect(screen.queryByRole("radiogroup", { name: /clicky view mode/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /download report/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /open download menu/i }));
    fireEvent.click(screen.getByRole("menuitem", { name: /^pdf$/i }));

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
