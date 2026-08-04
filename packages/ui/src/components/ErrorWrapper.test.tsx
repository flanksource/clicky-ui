import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ErrorWrapper } from "./ErrorWrapper";

function BrokenPage(): never {
  throw new Error("Unable to load the account dashboard", {
    cause: "upstream request returned HTTP 502",
  });
}

describe("ErrorWrapper", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders a full-page diagnostic fallback and copies a support-ready report", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText },
      configurable: true,
    });

    render(
      <ErrorWrapper>
        <BrokenPage />
      </ErrorWrapper>,
    );

    const fallback = screen.getByRole("alert");
    expect(fallback).toHaveClass("min-h-dvh");
    expect(
      screen.getByRole("heading", { name: "Something went wrong" }),
    ).toBeInTheDocument();
    expect(fallback).toHaveTextContent("Unable to load the account dashboard");

    fireEvent.click(screen.getByRole("button", { name: "Copy error details" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    const report = writeText.mock.calls[0]?.[0];
    expect(report).toEqual(
      expect.stringContaining("Error: Unable to load the account dashboard"),
    );
    expect(report).toEqual(
      expect.stringContaining("Cause: upstream request returned HTTP 502"),
    );
    expect(report).toEqual(expect.stringContaining("Page: http://localhost"));
    expect(report).toEqual(expect.stringContaining("React component stack:"));
    expect(
      screen.getByRole("button", { name: "Copy error details" }),
    ).toHaveTextContent("Copied");
  });
});
