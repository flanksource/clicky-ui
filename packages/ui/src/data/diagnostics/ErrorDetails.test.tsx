import { fireEvent, getDefaultNormalizer, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorDetails } from "./ErrorDetails";
import type { ErrorDiagnostics } from "./error-diagnostics";

const diagnostics: ErrorDiagnostics = {
  message: 'invalid profile sample request: json: unknown field "_id"',
  trace: "trace-42",
  time: "2026-08-11T09:30:00Z",
  context: [
    ["Query", "SELECT * FROM telemetry.logs"],
    ["Language", "sql"],
  ],
  stacktrace: "sample request failed\n  at profileQuery.ts:42:7",
};

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");

describe("ErrorDetails", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    if (clipboardDescriptor) {
      Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("copies the complete diagnostic report without expanding the details", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    render(<ErrorDetails diagnostics={diagnostics} />);

    const details = screen.getByText(diagnostics.message).closest("details");
    if (!details) throw new Error("ErrorDetails did not render a details element");
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByText("More details")).toBeVisible();

    fireEvent.click(screen.getByRole("button", { name: "Copy error details" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    expect(writeText).toHaveBeenCalledWith(
      [
        `Error: ${diagnostics.message}`,
        `Trace: ${diagnostics.trace}`,
        `Time: ${diagnostics.time}`,
        "",
        "Context:",
        "Query: SELECT * FROM telemetry.logs",
        "Language: sql",
        "",
        "Stack trace:",
        diagnostics.stacktrace,
      ].join("\n"),
    );
    expect(details).not.toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
  });

  it("renders long detail values as preformatted blocks and copies them with the report", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });
    const sql = "SELECT scheme, premum\nFROM policies\nWHERE start >= $1";
    render(
      <ErrorDetails
        title="Failed to load /api/v1/profile/profile-om-malawi-scheme"
        diagnostics={{ ...diagnostics, details: [{ label: "Query", value: sql }] }}
      />,
    );

    expect(
      screen.getByText("Failed to load /api/v1/profile/profile-om-malawi-scheme"),
    ).toBeInTheDocument();
    const block = screen.getByText(sql, {
      normalizer: getDefaultNormalizer({ collapseWhitespace: false }),
    });
    expect(block.tagName).toBe("PRE");

    fireEvent.click(screen.getByRole("button", { name: "Copy error details" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    const report = writeText.mock.calls[0]?.[0] as string;
    expect(report).toContain(sql);
    expect(report.startsWith("Failed to load /api/v1/profile/profile-om-malawi-scheme: ")).toBe(
      true,
    );
  });

  it("surfaces clipboard failures without expanding the details", async () => {
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockRejectedValue(new Error("denied")) },
      configurable: true,
    });
    render(<ErrorDetails diagnostics={diagnostics} />);

    fireEvent.click(screen.getByRole("button", { name: "Copy error details" }));

    expect(await screen.findByRole("button", { name: "Copy failed" })).toBeInTheDocument();
    expect(screen.getByText(diagnostics.message).closest("details")).not.toHaveAttribute("open");
  });
});
