import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EnvironmentSection } from "./EnvironmentSection";

describe("EnvironmentSection", () => {
  it("edits environment variables through collapsed accordion rows", () => {
    const onChange = vi.fn();
    render(
      <EnvironmentSection
        value={{
          setup: {
            envVars: [{ name: "LOG_LEVEL", value: "debug" }],
          },
        }}
        onChange={onChange}
      />,
    );

    const row = screen.getByRole("button", { name: /LOG_LEVEL.*debug/ });
    expect(row).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByLabelText("Environment variable name")).toBeNull();

    fireEvent.click(row);
    expect(screen.getByLabelText("Environment variable name")).toHaveValue(
      "LOG_LEVEL",
    );
    expect(screen.getByLabelText("Environment variable value")).toHaveValue(
      "debug",
    );
    expect(
      screen.getByRole("button", { name: "Add environment variable" }),
    ).toBeInTheDocument();
  });
});
