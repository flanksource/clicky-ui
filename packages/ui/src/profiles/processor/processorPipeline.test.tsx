import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { ProcessorPipeline } from "./processorPipeline";
import type { ProcessorPreset } from "./processorConfig";

const PRESETS: Record<string, ProcessorPreset> = {
  "logs.json": {
    type: "logs.parse",
    title: "Parse JSON logs",
    config: { format: "json" },
  },
  "logs.logfmt": {
    type: "logs.parse",
    title: "Parse logfmt logs",
    config: { format: "logfmt" },
  },
  "java.stacktrace": {
    type: "cel.batch",
    title: "Java stack trace merge",
    config: { continuation: "true", set: { message: "dyn(batch)" } },
  },
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("ProcessorPipeline", () => {
  it("ports the ordered rail, helpers, resolved config and paging warning", () => {
    renderPipeline({ steps: [{ use: "java.stacktrace" }] });

    expect(screen.getByText("Java stack trace merge")).toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Library processor" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("combobox", { name: "Processor type" }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText("This profile can no longer be paged"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Resolved" }));
    expect(screen.getAllByText("preset").length).toBeGreaterThan(0);
  });

  it("adds a chosen preset or processor type without creating an empty step", () => {
    const onChange = vi.fn();
    renderPipeline({ steps: [], onChange });

    fireEvent.click(screen.getByRole("button", { name: "Add processor" }));
    expect(screen.getByText("Library presets")).toBeInTheDocument();
    expect(screen.getByText("Processor types")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("menuitem", { name: "Parse JSON logs" }));
    expect(onChange).toHaveBeenLastCalledWith([{ use: "logs.json" }]);

    fireEvent.click(screen.getByRole("button", { name: "Add processor" }));
    fireEvent.click(screen.getByRole("menuitem", { name: "cel.batch" }));
    expect(onChange).toHaveBeenLastCalledWith([{ type: "cel.batch" }]);
    expect(onChange).not.toHaveBeenCalledWith([{}]);
  });

  it("switches the selected processor preview between output, raw and split views", async () => {
    const previewer = vi.fn().mockResolvedValue({
      rows: [{ message: "deduplicated", count: 2 }],
      processorPreview: {
        input: [
          { message: '{"level":"info","msg":"started"}' },
          { message: "plain" },
          { message: "duplicate" },
        ],
        stages: [
          {
            index: 0,
            label: "logs.json",
            type: "logs.parse",
            rowsIn: 3,
            rowsOut: 2,
            rows: [
              { message: "parsed", severity: "info" },
              { message: "parsed", severity: "info" },
            ],
          },
          {
            index: 1,
            label: "cel.dedupe",
            type: "cel.dedupe",
            rowsIn: 2,
            rowsOut: 1,
            rows: [{ message: "deduplicated", count: 2 }],
          },
        ],
      },
    });
    renderPipeline({
      steps: [{ use: "logs.json" }, { type: "cel.dedupe" }],
      previewer,
    });

    fireEvent.click(screen.getByRole("button", { name: "Edit cel.dedupe" }));
    fireEvent.click(screen.getByRole("button", { name: "Preview processors" }));

    await waitFor(() => expect(previewer).toHaveBeenCalledOnce());
    expect(screen.getByText("2 input rows → 1 output row")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Output" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Raw" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("deduplicated")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("radio", { name: "Raw" }));
    expect(screen.getByRole("heading", { name: "Raw" })).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Output" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("severity")).toBeInTheDocument();
    expect(screen.getAllByText("parsed")).toHaveLength(2);

    fireEvent.click(screen.getByRole("radio", { name: "Split" }));
    expect(screen.getByRole("heading", { name: "Raw" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Output" })).toBeInTheDocument();
  });

  it("collects required parameters for the preview without changing the profile", async () => {
    const previewer = vi.fn().mockResolvedValue({
      rows: [],
      processorPreview: { input: [], stages: [] },
    });
    renderPipeline({
      steps: [{ use: "logs.json" }],
      previewer,
      profile: {
        profile: "logs",
        provider: { type: "loki" },
        params: [{ name: "namespace", label: "Namespace", required: true }],
      },
    });

    const preview = screen.getByRole("button", { name: "Preview processors" });
    expect(preview).toBeDisabled();
    fireEvent.change(
      screen.getByRole("textbox", { name: "Namespace preview parameter" }),
      {
        target: { value: "payments" },
      },
    );
    expect(preview).toBeEnabled();
    fireEvent.click(preview);

    await waitFor(() =>
      expect(previewer).toHaveBeenCalledWith(
        expect.objectContaining({
          profile: "logs",
          processors: [{ use: "logs.json" }],
        }),
        { namespace: "payments" },
      ),
    );
  });
});

function renderPipeline({
  steps,
  previewer,
  profile,
  onChange = vi.fn(),
}: {
  steps: Array<{
    use?: string;
    type?: string;
    config?: Record<string, unknown>;
  }>;
  previewer?: Parameters<typeof ProcessorPipeline>[0]["previewer"];
  profile?: Record<string, unknown>;
  onChange?: Parameters<typeof ProcessorPipeline>[0]["onChange"];
}) {
  return render(
    <QueryClientProvider client={new QueryClient()}>
      <ProcessorPipeline
        steps={steps}
        presets={PRESETS}
        profile={
          profile ?? {
            profile: "logs",
            provider: { type: "loki" },
            processors: steps,
          }
        }
        onChange={onChange}
        {...(previewer ? { previewer } : {})}
      />
    </QueryClientProvider>,
  );
}
