import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { NamespacePicker } from "./NamespacePicker";

const loadAll = () => Promise.resolve(["default", "prod"]);

describe("NamespacePicker", () => {
  it("lists the loaded namespaces as options", async () => {
    render(<NamespacePicker value="" onChange={vi.fn()} loadNamespaces={loadAll} />);
    fireEvent.focus(screen.getByRole("combobox"));
    await waitFor(() => expect(screen.getByRole("option", { name: "prod" })).toBeInTheDocument());
    expect(screen.getByRole("option", { name: "default" })).toBeInTheDocument();
  });

  it("emits the chosen namespace", async () => {
    const onChange = vi.fn();
    render(<NamespacePicker value="" onChange={onChange} loadNamespaces={loadAll} />);
    fireEvent.focus(screen.getByRole("combobox"));
    const option = await screen.findByRole("option", { name: "prod" });
    fireEvent.mouseDown(option);
    expect(onChange).toHaveBeenCalledWith("prod");
  });

  it("pins a preselected value absent from the loaded set", async () => {
    render(<NamespacePicker value="ghost" onChange={vi.fn()} loadNamespaces={loadAll} />);
    fireEvent.focus(screen.getByRole("combobox"));
    await waitFor(() => expect(screen.getByRole("option", { name: "ghost" })).toBeInTheDocument());
  });

  it("flags a strict value that matches no loaded namespace", async () => {
    render(<NamespacePicker value="ghost" strict onChange={vi.fn()} loadNamespaces={loadAll} />);
    await waitFor(() => expect(screen.getByRole("combobox")).toHaveAttribute("aria-invalid", "true"));
  });

  it("does not flag a strict value while loading is in flight", () => {
    render(
      <NamespacePicker
        value="ghost"
        strict
        onChange={vi.fn()}
        loadNamespaces={() => new Promise(() => {})}
      />,
    );
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid");
  });

  it("never flags when strict is off", async () => {
    render(<NamespacePicker value="ghost" onChange={vi.fn()} loadNamespaces={loadAll} />);
    await waitFor(() => expect(screen.getByRole("combobox")).toBeInTheDocument());
    expect(screen.getByRole("combobox")).not.toHaveAttribute("aria-invalid");
  });
});
