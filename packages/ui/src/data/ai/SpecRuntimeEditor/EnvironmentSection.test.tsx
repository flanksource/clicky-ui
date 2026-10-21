import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { EnvironmentSection } from "./EnvironmentSection";

describe("EnvironmentSection", () => {
  it.each([
    "op://vault/api/token",
    "helm://api/token",
    "serviceaccount://reader",
  ])(
    "preserves an existing %s reference without catalog loaders",
    (valueFrom) => {
      const onChange = vi.fn();
      render(
        <EnvironmentSection
          value={{ setup: { envVars: [{ name: "API_TOKEN", valueFrom }] } }}
          onChange={onChange}
        />,
      );
      fireEvent.click(screen.getByRole("button", { name: /^API_TOKEN/ }));
      fireEvent.change(screen.getByLabelText("Environment variable name"), {
        target: { value: "OTHER_TOKEN" },
      });
      expect(onChange).toHaveBeenLastCalledWith({
        setup: { envVars: [{ name: "OTHER_TOKEN", valueFrom }] },
      });
    },
  );
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
    expect(screen.getByLabelText("Static value")).toHaveValue("debug");
    expect(
      screen.getByRole("button", { name: "Add environment variable" }),
    ).toBeInTheDocument();
  });

  it("edits secret references with a source, resource and key without a host catalog", () => {
    const onChange = vi.fn();
    render(
      <EnvironmentSection
        value={{
          setup: {
            envVars: [{ name: "API_TOKEN", valueFrom: "secret://api/token" }],
          },
        }}
        onChange={onChange}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /API_TOKEN.*secret/ }));
    expect(
      screen.getByRole("combobox", { name: "Secret value source" }),
    ).toBeInTheDocument();
    const key = screen.getByPlaceholderText("Key…");
    fireEvent.change(key, { target: { value: "password" } });
    fireEvent.keyDown(key, { key: "Enter" });
    expect(onChange).toHaveBeenLastCalledWith({
      setup: {
        envVars: [{ name: "API_TOKEN", valueFrom: "secret://api/password" }],
      },
    });
  });
});
