import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MarkdownEditor } from "./MarkdownEditor";
import {
  buildMarkdownPreviewUrl,
  clickyFormatForMarkdownPreview,
} from "./MarkdownEditor.model";

describe("MarkdownEditor", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("renders markdown source and local markdown preview", () => {
    render(
      <MarkdownEditor
        defaultValue="# Local note"
        previewFormats={["react", "markdown"]}
      />,
    );

    expect(screen.getByRole("textbox", { name: "Markdown" })).toHaveValue(
      "# Local note",
    );

    fireEvent.click(screen.getByRole("radio", { name: /markdown/i }));

    expect(screen.getByLabelText("Markdown source")).toHaveTextContent(
      "# Local note",
    );
  });

  it("maps React preview to clicky-json and preserves relative endpoint URLs", () => {
    expect(clickyFormatForMarkdownPreview("react")).toBe("clicky-json");
    expect(clickyFormatForMarkdownPreview("html")).toBe("html");
    expect(buildMarkdownPreviewUrl("/api/preview?tenant=acme", "react")).toBe(
      "/api/preview?tenant=acme&format=clicky-json",
    );
  });

  it("posts markdown to a Clicky preview endpoint for JSON output", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ title: "Report", ok: true }), {
        headers: { "Content-Type": "application/json" },
      }),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MarkdownEditor
        defaultValue="# Report"
        defaultPreviewFormat="json"
        previewEndpoint="/api/markdown/preview"
        previewDebounceMs={0}
      />,
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const [url, init] = fetchMock.mock.calls[0]!;
    const request = init as RequestInit;
    const headers = request.headers as Headers;
    expect(String(url)).toBe("/api/markdown/preview?format=json");
    expect(request.method).toBe("POST");
    expect(request.body).toBe("# Report");
    expect(headers.get("Accept")).toContain("application/json");
    expect(headers.get("Content-Type")).toBe(
      "text/markdown; charset=utf-8",
    );
    expect(await screen.findByText("title")).toBeInTheDocument();
    expect(screen.getByText('"Report"')).toBeInTheDocument();
  });

  it("loads React preview as Clicky JSON", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          version: 1,
          node: {
            kind: "text",
            text: "Rendered by Clicky",
            plain: "Rendered by Clicky",
          },
        }),
        {
          headers: { "Content-Type": "application/json+clicky" },
        },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    render(
      <MarkdownEditor
        defaultValue="# Report"
        defaultPreviewFormat="react"
        previewEndpoint="/api/markdown/preview"
        previewDebounceMs={0}
      />,
    );

    await screen.findByText("Rendered by Clicky");
    expect(String(fetchMock.mock.calls[0]?.[0])).toBe(
      "/api/markdown/preview?format=clicky-json",
    );
  });
});
