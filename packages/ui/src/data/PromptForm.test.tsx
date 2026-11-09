import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { PromptForm } from "./PromptForm";
import type { PromptSnapshot } from "../hooks/use-prompts";

const BASE = "/api";
const REVIEWED = 4;

// A pre-seeded answer so Submit posts a deterministic value without driving the widget in jsdom.
const prompt: PromptSnapshot = {
  id: "p7",
  title: "Purge staged activities?",
  description: "Review the staged GUIDs first.",
  state: "pending",
  value: { expectedActivities: REVIEWED },
  schema: {
    type: "object",
    properties: { expectedActivities: { type: "integer", title: "Reviewed staged count" } },
    required: ["expectedActivities"],
  } as PromptSnapshot["schema"],
};

function stubFetch(response: { ok: boolean; text: () => Promise<string> }) {
  const fetchMock = vi.fn().mockResolvedValue(response);
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("PromptForm", () => {
  it("renders the prompt's title, description and schema fields inline, outside any dialog", () => {
    render(<PromptForm prompt={prompt} basePath={BASE} />);
    expect(screen.getByText(prompt.title)).toBeInTheDocument();
    expect(screen.getByText(prompt.description!)).toBeInTheDocument();
    expect(screen.getByText("Reviewed staged count")).toBeInTheDocument();
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("posts the form's values on Submit and reports the prompt resolved", async () => {
    const fetchMock = stubFetch({ ok: true, text: async () => "" });
    const onResolved = vi.fn();
    render(<PromptForm prompt={prompt} basePath={BASE} onResolved={onResolved} />);

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => expect(onResolved).toHaveBeenCalledTimes(1));
    const [url, init] = fetchMock.mock.calls[0]!;
    expect(url).toBe(`${BASE}/prompts/${prompt.id}/answer`);
    expect(JSON.parse(init.body)).toEqual({ values: { expectedActivities: REVIEWED } });
  });

  it("answers {cancelled: true} on Cancel", async () => {
    const fetchMock = stubFetch({ ok: true, text: async () => "" });
    const onResolved = vi.fn();
    render(<PromptForm prompt={prompt} basePath={BASE} onResolved={onResolved} />);

    fireEvent.click(screen.getByText("Cancel"));

    await waitFor(() => expect(onResolved).toHaveBeenCalledTimes(1));
    expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({ cancelled: true });
  });

  it("shows the server's refusal, keeps the prompt unresolved and re-enables the buttons", async () => {
    const refusal = "prompt p7 is already answered";
    stubFetch({ ok: false, text: async () => refusal });
    const onResolved = vi.fn();
    render(<PromptForm prompt={prompt} basePath={BASE} onResolved={onResolved} />);

    fireEvent.click(screen.getByText("Submit"));

    expect(await screen.findByText(refusal)).toBeInTheDocument();
    expect(onResolved).not.toHaveBeenCalled();
    expect(screen.getByText("Submit").closest("button")).not.toBeDisabled();
  });

  it("disables Submit and Cancel while the answer is in flight", async () => {
    let finish: (value: { ok: boolean; text: () => Promise<string> }) => void = () => {};
    vi.stubGlobal("fetch", vi.fn(() => new Promise((resolve) => { finish = resolve; })));
    render(<PromptForm prompt={prompt} basePath={BASE} />);

    fireEvent.click(screen.getByText("Submit"));

    await waitFor(() => expect(screen.getByText("Submit").closest("button")).toBeDisabled());
    expect(screen.getByText("Cancel").closest("button")).toBeDisabled();
    finish({ ok: true, text: async () => "" });
    await waitFor(() => expect(screen.getByText("Submit").closest("button")).not.toBeDisabled());
  });

  it("resolves the schema's x-clicky-lookup fields through the supplied fetcher", async () => {
    const lookupFetcher = vi.fn().mockResolvedValue([{ value: "lab", label: "lab (sql_server)" }]);
    const lookupUrl = "/api/v1/connection?types=sql_server";
    const connectionPrompt: PromptSnapshot = {
      ...prompt,
      value: {},
      schema: {
        type: "object",
        properties: { db: { type: "string", title: "Connection", "x-clicky-lookup": { url: lookupUrl, filter: "connection" } } },
      } as PromptSnapshot["schema"],
    };
    render(<PromptForm prompt={connectionPrompt} basePath={BASE} lookupFetcher={lookupFetcher} />);
    await waitFor(() => expect(lookupFetcher).toHaveBeenCalled());
    expect(lookupFetcher.mock.calls[0]![0].descriptor.url).toBe(lookupUrl);
  });

  it("hands the form and its actions to a frame that lays them out", () => {
    render(
      <PromptForm
        prompt={prompt}
        basePath={BASE}
        frame={({ form, actions }) => (
          <>
            <section data-testid="frame-body">{form}</section>
            <footer data-testid="frame-footer">{actions}</footer>
          </>
        )}
      />,
    );
    expect(screen.getByTestId("frame-body")).toHaveTextContent("Reviewed staged count");
    expect(screen.getByTestId("frame-footer")).toHaveTextContent("Submit");
    // The frame owns the heading: the inline title is not rendered.
    expect(screen.queryByText(prompt.title)).toBeNull();
  });
});
