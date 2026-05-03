import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { vi } from "vitest";
import { Clicky, type ClickyDocument } from "./Clicky";
import { clickyFixture } from "./Clicky.fixtures";

// Mock the Shiki wrapper so the dynamic `import("shiki")` never executes
// during unit tests — it pulls in the full grammar/theme bundle and slows
// the suite. Each test that exercises the client-highlight path overrides
// the mock with a per-case implementation via `mocked(...).mockImplementation`.
vi.mock("./code-highlight", () => ({
  highlightCode: vi.fn(async () => null),
}));
import { highlightCode } from "./code-highlight";
const mockHighlightCode = vi.mocked(highlightCode);

function createCommandClient() {
  const executeCommand = vi.fn().mockResolvedValue({
    success: true,
    exit_code: 0,
    stdout: JSON.stringify({
      version: 1,
      node: {
        kind: "text",
        text: "Loaded descendants",
        plain: "Loaded descendants",
      },
    }),
  });

  return {
    getOpenAPISpec: vi.fn().mockResolvedValue({
      openapi: "3.0.3",
      info: {
        title: "Clicky test",
        version: "1.0.0",
      },
      paths: {
        "/api/v1/stacks/{id}/descendants": {
          get: {
            operationId: "stack_get_descendants",
            summary: "List descendants",
            parameters: [
              {
                name: "id",
                in: "path",
                required: true,
                description: "Positional argument from command",
                schema: { type: "string" },
              },
              {
                name: "events",
                in: "query",
                schema: { type: "string" },
              },
            ],
            responses: { "200": {} },
            "x-clicky": {
              command: "stack/get-descendants",
              verb: "action",
              scope: "entity",
            },
          },
        },
      },
    }),
    executeCommand,
    lookupFilters: vi.fn().mockResolvedValue({ filters: {} }),
  };
}

describe("Clicky", () => {
  it("renders a JSON string payload", () => {
    render(<Clicky data={JSON.stringify(clickyFixture)} />);

    expect(screen.getByText("Cluster Status")).toBeInTheDocument();
    expect(screen.getByText(/Healthy/)).toBeInTheDocument();
  });

  it("renders comments with a 50ch and three-line clamp", () => {
    render(
      <Clicky
        data={{
          kind: "comment",
          text: "Approved after validating the deployment notes, linked change request, and release evidence.",
          plain:
            "Approved after validating the deployment notes, linked change request, and release evidence.",
        }}
      />,
    );

    const comment = screen.getByText(/Approved after validating/);
    expect(comment).toHaveStyle({ maxWidth: "50ch" });
    expect(comment.style.WebkitLineClamp).toBe("3");
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

  it("passes raw table rows to the row click handler", () => {
    const onTableRowClick = vi.fn();
    const clickyDocument: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        columns: [{ name: "name", label: "Name" }],
        rows: [
          {
            cells: {
              _id: { kind: "text", text: "widget-1", plain: "widget-1" },
              name: { kind: "text", text: "First widget", plain: "First widget" },
            },
          },
        ],
      },
    };

    render(<Clicky data={clickyDocument} onTableRowClick={onTableRowClick} />);

    fireEvent.click(screen.getByText("First widget"));

    expect(onTableRowClick).toHaveBeenCalledTimes(1);
    expect(onTableRowClick.mock.calls[0][0].cells._id.plain).toBe("widget-1");
  });

  it("supports auto-filtered clicky tables", async () => {
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

    await waitFor(() => expect(screen.queryByText("worker")).not.toBeInTheDocument(), {
      timeout: 1_500,
    });
    expect(screen.getByText("api")).toBeInTheDocument();

    fireEvent.click(screen.getByText("api"));

    expect(screen.getByText(/kind: Deployment/)).toBeInTheDocument();
  });

  it("expands clicky table rows with all fields and inline tag actions", async () => {
    const clickyDocument: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        autoFilter: true,
        columns: [
          { name: "service", label: "Service", grow: true },
          { name: "tags", label: "Tags", grow: true },
        ],
        rows: [
          {
            cells: {
              service: { kind: "text", text: "api", plain: "api" },
              tags: {
                kind: "list",
                items: [
                  { kind: "text", text: "env=prod", plain: "env=prod" },
                  { kind: "text", text: "team=platform", plain: "team=platform" },
                ],
              },
            },
          },
          {
            cells: {
              service: { kind: "text", text: "worker", plain: "worker" },
              tags: {
                kind: "list",
                items: [{ kind: "text", text: "env=staging", plain: "env=staging" }],
              },
            },
          },
        ],
      },
    };

    render(<Clicky data={clickyDocument} />);

    fireEvent.click(screen.getByText("api"));

    expect(screen.getByText("Fields")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Include env=prod$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Exclude env=prod$/ })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^Copy env=prod$/ })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Include env=prod$/ }));

    await waitFor(() => expect(screen.queryByText("worker")).not.toBeInTheDocument(), {
      timeout: 1_500,
    });
    expect(screen.getAllByText("api").length).toBeGreaterThan(0);
  });

  it("renders table rows with struct cells as collapsed sections", () => {
    const clickyDocument: ClickyDocument = {
      version: 1,
      node: {
        kind: "table",
        columns: [
          { name: "agreement", label: "agreement" },
          { name: "company", label: "company" },
          { name: "definition", label: "definition" },
        ],
        rows: [
          {
            cells: {
              agreement: {
                kind: "map",
                fields: [
                  {
                    name: "agreementName",
                    value: {
                      kind: "text",
                      text: "Group Scheme Contract",
                      plain: "Group Scheme Contract",
                    },
                  },
                  {
                    name: "agreementGUID",
                    value: { kind: "text", text: "agreement-1", plain: "agreement-1" },
                  },
                ],
              },
              company: {
                kind: "map",
                fields: [
                  {
                    name: "companyName",
                    value: {
                      kind: "text",
                      text: "Acme Africa Holdings",
                      plain: "Acme Africa Holdings",
                    },
                  },
                ],
              },
              definition: {
                kind: "map",
                fields: [
                  {
                    name: "typeCode",
                    value: { kind: "text", text: "MSTR-INS", plain: "MSTR-INS" },
                  },
                ],
              },
            },
          },
        ],
      },
    };

    render(<Clicky data={clickyDocument} />);

    expect(screen.queryByRole("table")).not.toBeInTheDocument();
    expect(screen.getByText("Agreement 1: Group Scheme Contract")).toBeInTheDocument();
    expect(screen.queryByText("Acme Africa Holdings")).not.toBeVisible();

    fireEvent.click(screen.getByText("Agreement 1: Group Scheme Contract"));

    expect(screen.getByText("Acme Africa Holdings")).toBeVisible();
    expect(screen.getByText("MSTR-INS")).toBeVisible();
  });

  it("exposes Clicky and JSON primary views with overflow formats and JSON-first downloads", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
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
    expect(screen.getByText('"api"')).toBeInTheDocument();

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
    expect(
      screen.getByText("Rendered Clicky JSON with the rich Clicky viewer"),
    ).toBeInTheDocument();
    expect(screen.getByText("Portable document for sharing and printing")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: /clicky/i }));

    expect(submitSpy).toHaveBeenCalledTimes(2);
    expect(submittedActions[1]).toContain("/api/clicky/report?format=clicky-json");

    fetchSpy.mockRestore();
    submitSpy.mockRestore();
  });

  it("supports an empty remote view config without rendering the mode switcher", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockImplementation(async (input) => {
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
    expect(
      screen.queryByRole("button", { name: /open additional view menu/i }),
    ).not.toBeInTheDocument();
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

  it("navigates link-command nodes through the clicky runtime", async () => {
    const client = createCommandClient();
    const onNavigate = vi.fn();

    render(
      <Clicky
        data={{
          version: 1,
          node: {
            kind: "link-command",
            command: "stack/get-descendants",
            target: "_clicky",
            args: ["stack-42"],
            flags: { events: "1" },
            text: "stack-42",
            plain: "stack-42",
          },
        }}
        commandRuntime={{ client, onNavigate }}
      />,
    );

    await waitFor(() => expect(client.getOpenAPISpec).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "stack-42" }));

    await waitFor(() => expect(onNavigate).toHaveBeenCalledTimes(1));
    expect(onNavigate.mock.calls[0][0].request.command).toBe("stack/get-descendants");
    expect(onNavigate.mock.calls[0][0].request.flags).toEqual({ events: "1" });
  });

  it("auto-runs dialog link-command nodes when required params are prefilled", async () => {
    const client = createCommandClient();

    render(
      <Clicky
        data={{
          version: 1,
          node: {
            kind: "link-command",
            command: "stack/get-descendants",
            target: "Dialog",
            autoRun: true,
            args: ["stack-42"],
            flags: { events: "1" },
            text: "stack-42",
            plain: "stack-42",
          },
        }}
        commandRuntime={{ client }}
      />,
    );

    await waitFor(() => expect(client.getOpenAPISpec).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "stack-42" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await waitFor(() =>
      expect(client.executeCommand).toHaveBeenCalledWith(
        "/api/v1/stacks/{id}/descendants",
        "get",
        { id: "stack-42", events: "1" },
        expect.objectContaining({ Accept: "application/json+clicky" }),
      ),
    );
    expect(await screen.findByText("Loaded descendants")).toBeInTheDocument();
  });

  it("opens dialog link-command nodes without auto-running when required params are missing", async () => {
    const client = createCommandClient();

    render(
      <Clicky
        data={{
          version: 1,
          node: {
            kind: "link-command",
            command: "stack/get-descendants",
            target: "Dialog",
            autoRun: true,
            text: "show descendants",
            plain: "show descendants",
          },
        }}
        commandRuntime={{ client }}
      />,
    );

    await waitFor(() => expect(client.getOpenAPISpec).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "show descendants" }));

    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /run command/i })).toBeInTheDocument();
    await waitFor(() => expect(client.executeCommand).not.toHaveBeenCalled());
  });

  it("executes expand link-command nodes asynchronously inline", async () => {
    const client = createCommandClient();

    render(
      <Clicky
        data={{
          version: 1,
          node: {
            kind: "link-command",
            command: "stack/get-descendants",
            target: "Expand",
            args: ["stack-42"],
            text: "expand descendants",
            plain: "expand descendants",
          },
        }}
        commandRuntime={{ client }}
      />,
    );

    await waitFor(() => expect(client.getOpenAPISpec).toHaveBeenCalledTimes(1));

    fireEvent.click(screen.getByRole("button", { name: "expand descendants" }));

    await waitFor(() => expect(client.executeCommand).toHaveBeenCalledTimes(1));
    expect(await screen.findByText("Loaded descendants")).toBeInTheDocument();
  });

  it("renders json code blocks with the interactive JsonView", () => {
    const document: ClickyDocument = {
      version: 1,
      node: {
        kind: "code",
        language: "json",
        source: '{"intakeFileGUID":"2bc39b08","status":"SYSERR"}',
      },
    };

    const { container } = render(<Clicky data={document} />);

    // Header still surfaces the language label so operators can tell at
    // a glance which renderer engaged.
    expect(within(container).getByText("json")).toBeInTheDocument();

    // The JsonView path renders each scalar key as plain text (no
    // surrounding quotes) — the chroma path would emit them inside a
    // <pre class="chroma"> with the value inline-quoted. Looking for the
    // unquoted key is the cleanest behavioural signal since it only
    // appears in the JsonView output.
    expect(within(container).getByText("intakeFileGUID")).toBeInTheDocument();
    expect(within(container).getByText("status")).toBeInTheDocument();
    expect(within(container).getByText('"SYSERR"')).toBeInTheDocument();
  });

  it("falls back to highlighted html when json source is malformed", () => {
    const document: ClickyDocument = {
      version: 1,
      node: {
        kind: "code",
        language: "json",
        source: "{ this is not json }",
        // Pre-rendered chroma html so we can confirm the fallback path
        // engaged without depending on chroma running in the test env.
        highlightedHtml: '<pre class="chroma">malformed-marker</pre>',
      },
    };

    const { container } = render(<Clicky data={document} />);

    expect(within(container).getByText("malformed-marker")).toBeInTheDocument();
  });

  it("preserves chroma html for xml code blocks", () => {
    const document: ClickyDocument = {
      version: 1,
      node: {
        kind: "code",
        language: "xml",
        source: "<Activity><Math/></Activity>",
        highlightedHtml: '<pre class="chroma"><span class="nt">Activity</span> tag</pre>',
      },
    };

    const { container } = render(<Clicky data={document} />);

    // The XML branch preserves chroma classes (we don't strip .nt or
    // similar) so the targeted Tailwind rules can colour them at runtime.
    const chromaPre = container.querySelector("pre.chroma");
    expect(chromaPre).not.toBeNull();
    expect(chromaPre?.querySelector(".nt")).not.toBeNull();
  });

  it("uses Shiki to highlight when only language+source provided", async () => {
    mockHighlightCode.mockResolvedValueOnce(
      '<pre class="shiki"><code><span class="shiki-token">type</span> SourceResolver</code></pre>',
    );

    const document: ClickyDocument = {
      version: 1,
      node: {
        kind: "code",
        language: "go",
        source: "type SourceResolver interface {}",
      },
    };

    const { container } = render(<Clicky data={document} />);

    await waitFor(() => {
      expect(container.querySelector("pre.shiki")).not.toBeNull();
    });
    expect(mockHighlightCode).toHaveBeenCalledWith("type SourceResolver interface {}", {
      lang: "go",
    });
    expect(within(container).getByText("SourceResolver")).toBeInTheDocument();
  });

  it("falls back to plain pre when Shiki returns null", async () => {
    mockHighlightCode.mockResolvedValueOnce(null);

    const source = "fictional unknown-language source";
    const document: ClickyDocument = {
      version: 1,
      node: {
        kind: "code",
        language: "fictional-lang",
        source,
      },
    };

    const { container } = render(<Clicky data={document} />);

    await waitFor(() => expect(mockHighlightCode).toHaveBeenCalled());
    // No shiki wrapper appears, the unhighlighted source is rendered inside
    // a plain <pre> so operators still see something readable.
    expect(container.querySelector("pre.shiki")).toBeNull();
    expect(within(container).getByText(source)).toBeInTheDocument();
  });
});
