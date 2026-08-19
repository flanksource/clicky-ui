import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { InlineError } from "./InlineError";

describe("InlineError", () => {
  it("runs the supplied recovery action from the error card", () => {
    const onClick = vi.fn();
    const { getByRole } = render(
      <InlineError
        title="Could not preview this clone"
        error={new Error("transfer procedures are missing")}
        runNow={{ onClick }}
      />,
    );

    fireEvent.click(getByRole("button", { name: "Run now" }));
    expect(onClick).toHaveBeenCalledOnce();
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
});
