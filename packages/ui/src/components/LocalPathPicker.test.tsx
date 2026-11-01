import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocalPathPicker } from "./LocalPathPicker";

describe("LocalPathPicker", () => {
  it("navigates folders and only selects a file after confirmation", async () => {
    const select = vi.fn();
    const close = vi.fn();
    const load = vi.fn(async (path: string) => ({
      path: path || "/home",
      parent: "/",
      entries:
        path === "/home/data"
          ? [
              {
                name: "example.db",
                path: "/home/data/example.db",
                directory: false,
              },
            ]
          : [{ name: "data", path: "/home/data", directory: true }],
    }));
    render(
      <LocalPathPicker open onClose={close} onSelect={select} load={load} />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "data/" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Directory path" }), {
      target: { value: "/home/data" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    fireEvent.click(await screen.findByRole("button", { name: "example.db" }));
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Filter filenames" }),
      { target: { value: "missing" } },
    );
    expect(screen.queryByRole("button", { name: "example.db" })).toBeNull();
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Filter filenames" }),
      { target: { value: "example" } },
    );
    expect(select).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Select file" }));
    await waitFor(() =>
      expect(select).toHaveBeenCalledWith("/home/data/example.db"),
    );
    expect(close).toHaveBeenCalledOnce();
  });
});
