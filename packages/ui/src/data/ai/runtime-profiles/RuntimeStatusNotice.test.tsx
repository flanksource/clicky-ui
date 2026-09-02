import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RuntimeStatusNotice } from "./RuntimeStatusNotice";

describe("RuntimeStatusNotice", () => {
  it("renders a fallback when an error has no message", () => {
    render(
      <RuntimeStatusNotice
        status="error"
        loadingText="Loading"
        onRetry={vi.fn()}
      />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Unable to load runtime data.",
    );
  });
});
