import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { LocalPathPicker } from "./LocalPathPicker";

const entry = (name: string, directory = false) => ({
  name,
  path: `/home/${name}`,
  directory,
});
const listing = {
  path: "/home",
  parent: "/",
  entries: [
    entry("data", true),
    entry("notes.txt"),
    entry("catalog.SQLITE"),
    entry(".hidden.db"),
  ],
};

describe("generic local file tree", () => {
  it("shows arbitrary files by default and commits only after confirmation", async () => {
    const select = vi.fn();
    render(
      <LocalPathPicker
        open
        load={async () => listing}
        onSelect={select}
        onClose={vi.fn()}
      />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "notes.txt" }));
    expect(select).not.toHaveBeenCalled();
    expect(screen.queryByRole("checkbox", { name: "All files" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Select file" }));
    expect(select).toHaveBeenCalledWith("/home/notes.txt");
  });
  it("matches extensions case-insensitively and offers hidden and all files", async () => {
    render(
      <LocalPathPicker
        open
        accept={[".sqlite"]}
        load={async () => listing}
        onSelect={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    await screen.findByRole("button", { name: "catalog.SQLITE" });
    expect(screen.queryByRole("button", { name: "notes.txt" })).toBeNull();
    expect(screen.getByRole("button", { name: "data/" })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("checkbox", { name: "All files" }));
    await screen.findByRole("button", { name: "notes.txt" });
    expect(screen.queryByRole("button", { name: ".hidden.db" })).toBeNull();
    fireEvent.click(screen.getByRole("checkbox", { name: "Show hidden" }));
    await screen.findByRole("button", { name: ".hidden.db" });
  });
  it("loads folders lazily and searches loaded children without selecting folders", async () => {
    const load = vi.fn(async (path: string) =>
      path === "/home/data"
        ? {
            path,
            parent: "/home",
            entries: [
              {
                name: "nested.txt",
                path: `${path}/nested.txt`,
                directory: false,
              },
            ],
          }
        : listing,
    );
    render(
      <LocalPathPicker open load={load} onSelect={vi.fn()} onClose={vi.fn()} />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "data/" }));
    await screen.findByRole("button", { name: "nested.txt" });
    expect(screen.getByRole("button", { name: "Select file" })).toBeDisabled();
    expect(screen.getByRole("textbox", { name: "Directory path" })).toHaveValue(
      "/home",
    );
    const search = screen.getByRole("searchbox", { name: "Filter filenames" });
    search.focus();
    fireEvent.change(search, { target: { value: "nested" } });
    expect(
      screen.getByRole("button", { name: "nested.txt" }),
    ).toBeInTheDocument();
    expect(load).toHaveBeenCalledTimes(2);
    expect(search).toHaveFocus();
  });
  it("retries directory failures", async () => {
    const load = vi
      .fn()
      .mockRejectedValueOnce(new Error("Permission denied"))
      .mockResolvedValue(listing);
    render(
      <LocalPathPicker open load={load} onSelect={vi.fn()} onClose={vi.fn()} />,
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Permission denied",
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry" }));
    await screen.findByRole("button", { name: "notes.txt" });
  });
  it("shows a failed lazy folder with a retry action", async () => {
    let attempts = 0;
    const load = vi.fn(async (path: string) => {
      if (path === "/home/data" && attempts++ === 0)
        throw new Error("Folder unreadable");
      return listing;
    });
    render(
      <LocalPathPicker open load={load} onSelect={vi.fn()} onClose={vi.fn()} />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "data/" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Folder unreadable",
    );
    fireEvent.click(screen.getByRole("button", { name: "Retry folder" }));
    await screen.findByRole("button", { name: "data/" });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(attempts).toBe(2);
  });
  it("aborts lazy loads when dismissed", async () => {
    let pending: AbortSignal | undefined;
    const load = vi.fn(async (path: string, signal: AbortSignal) => {
      if (path === "/home/data") {
        pending = signal;
        return new Promise<typeof listing>(() => {});
      }
      return listing;
    });
    const { unmount } = render(
      <LocalPathPicker open load={load} onSelect={vi.fn()} onClose={vi.fn()} />,
    );
    fireEvent.click(await screen.findByRole("button", { name: "data/" }));
    await waitFor(() => expect(pending).toBeDefined());
    unmount();
    expect(pending?.aborted).toBe(true);
  });
  it("discards stale results after manual navigation and cancels pending requests", async () => {
    let resolveOld!: (value: typeof listing) => void;
    const load = vi.fn((path: string) =>
      path === "/old"
        ? new Promise<typeof listing>((resolve) => {
            resolveOld = resolve;
          })
        : Promise.resolve(listing),
    );
    const close = vi.fn();
    const { rerender } = render(
      <LocalPathPicker
        open
        initialPath="/old"
        load={load}
        onSelect={vi.fn()}
        onClose={close}
      />,
    );
    fireEvent.change(screen.getByRole("textbox", { name: "Directory path" }), {
      target: { value: "/home" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Go" }));
    await screen.findByRole("button", { name: "notes.txt" });
    await act(async () =>
      resolveOld({ ...listing, path: "/old", entries: [entry("stale.txt")] }),
    );
    expect(screen.queryByRole("button", { name: "stale.txt" })).toBeNull();
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(close).toHaveBeenCalledOnce();
    rerender(
      <LocalPathPicker
        open={false}
        load={load}
        onSelect={vi.fn()}
        onClose={close}
      />,
    );
  });
});
