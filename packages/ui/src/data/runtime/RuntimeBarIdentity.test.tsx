import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { RuntimeBar } from "./RuntimeBar";

const MODEL_ID = "catalog-model-id";

describe("RuntimeBar model labels", () => {
  it.each([
    { label: "Readable model", expected: "Readable model" },
    { label: "", expected: MODEL_ID },
    { label: " ", expected: MODEL_ID },
  ])(
    "shows only $expected and keeps ID search and selection",
    ({ label, expected }) => {
      const onChange = vi.fn();
      render(
        <RuntimeBar
          value={{ mode: "api" }}
          onChange={onChange}
          models={[{ id: MODEL_ID, provider: "openai", label }]}
        />,
      );
      fireEvent.click(screen.getByTitle("Model — unspecified"));
      const menu = within(screen.getByRole("listbox", { name: "Model" }));
      fireEvent.change(screen.getByLabelText("Search Model"), {
        target: { value: MODEL_ID },
      });
      const choice = menu.getByRole("option", { name: expected });
      expect(choice.textContent).toBe(expected);
      fireEvent.mouseDown(choice);
      expect(onChange).toHaveBeenCalledWith({ mode: "api", model: MODEL_ID });
    },
  );
});

describe("RuntimeBar custom models", () => {
  it("offers custom only when no model matches and commits it explicitly", () => {
    const onChange = vi.fn();
    render(
      <RuntimeBar
        value={{ mode: "api" }}
        onChange={onChange}
        models={[{ id: MODEL_ID, provider: "openai", label: "Readable model" }]}
      />,
    );
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
    fireEvent.click(screen.getByTitle("Model — unspecified"));
    const filter = screen.getByLabelText("Search Model");
    fireEvent.change(filter, { target: { value: "Readable" } });
    expect(
      screen.queryByRole("option", { name: /Use custom/ }),
    ).not.toBeInTheDocument();
    fireEvent.change(filter, { target: { value: "configuration" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(
      screen.queryByRole("option", { name: /Use custom/ }),
    ).not.toBeInTheDocument();
    fireEvent.change(filter, { target: { value: "custom-model" } });
    expect(screen.getAllByRole("option")).toHaveLength(1);
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.click(
      screen.getByRole("option", { name: "Use custom: custom-model" }),
    );
    expect(onChange).toHaveBeenCalledWith({
      mode: "api",
      model: "custom-model",
    });
    expect(screen.queryByRole("listbox")).not.toBeInTheDocument();
  });
});
