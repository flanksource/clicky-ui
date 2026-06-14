import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SearchInput } from "./SearchInput";

describe("SearchInput", () => {
  it("emits typed input via onChange", () => {
    const onChange = vi.fn();
    render(<SearchInput value="" onChange={onChange} />);
    fireEvent.change(screen.getByRole("searchbox"), { target: { value: "faro" } });
    expect(onChange).toHaveBeenCalledExactlyOnceWith("faro");
  });

  it("renders the keyboard shortcut hint by default", () => {
    render(<SearchInput value="" onChange={() => {}} />);
    expect(screen.getByText("⌘K")).toBeInTheDocument();
  });

  it("hides the shortcut hint when shortcut is null", () => {
    render(<SearchInput value="" onChange={() => {}} shortcut={null} />);
    expect(screen.queryByText("⌘K")).not.toBeInTheDocument();
  });

  it("invokes onShortcut on ⌘K / Ctrl+K", () => {
    const onShortcut = vi.fn();
    render(<SearchInput value="" onChange={() => {}} onShortcut={onShortcut} />);
    fireEvent.keyDown(window, { key: "k", metaKey: true });
    expect(onShortcut).toHaveBeenCalledOnce();
  });
});
