import { fireEvent, render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { OperationsApiClientError } from "./apiClient";
import { InlineError } from "./InlineError";

const clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, "clipboard");

describe("InlineError", () => {
  afterEach(() => {
    if (clipboardDescriptor) {
      Object.defineProperty(navigator, "clipboard", clipboardDescriptor);
    } else {
      Reflect.deleteProperty(navigator, "clipboard");
    }
  });

  it("runs the supplied recovery action without toggling the details", () => {
    const onClick = vi.fn();
    const { getByRole, container } = render(
      <InlineError
        title="Could not preview this clone"
        error={new Error("transfer procedures are missing")}
        runNow={{ onClick }}
      />,
    );

    fireEvent.click(getByRole("button", { name: "Run now" }));
    expect(onClick).toHaveBeenCalledOnce();
    expect(container.querySelector("details")).not.toHaveAttribute("open");
  });

  it("disables the recovery action while it is running", () => {
    const { getByRole } = render(
      <InlineError
        title="Could not preview this clone"
        error={new Error("transfer procedures are missing")}
        runNow={{ onClick: () => {}, loading: true }}
      />,
    );

    const button = getByRole("button", { name: "Running…" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
  });

  it("copies a report carrying the page, the failed request and the response body", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
    window.history.pushState({}, "", "/cycle/get/abc?tab=details#dev/");

    const title = "Could not read the notification recordings";
    const serverMessage = "recording r-1 holds v2 records";
    const requestURL = "/api/v1/trace-results/cycle-recordings?cycle=ABC";
    const responseBody = JSON.stringify({ success: false, error: serverMessage, cli: "clicky x" });
    const error = new OperationsApiClientError(`GET ${requestURL} failed with 500`, {
      status: 500,
      method: "GET",
      url: requestURL,
      responseBody,
      responseData: JSON.parse(responseBody),
    });

    const { getByRole } = render(<InlineError title={title} error={error} />);
    fireEvent.click(getByRole("button", { name: "Copy error details" }));

    await waitFor(() => expect(writeText).toHaveBeenCalledOnce());
    const report = writeText.mock.calls[0]![0] as string;
    expect(report.split("\n").slice(0, 2)).toEqual([
      `${title}: ${serverMessage}`,
      `Page: ${window.location.origin}/cycle/get/abc`,
    ]);
    expect(report).toContain("Method: GET");
    expect(report).toContain(`URL: ${requestURL}`);
    expect(report).toContain("Status: 500");
    expect(report).toContain(`Response:\n${responseBody}`);
  });
});
