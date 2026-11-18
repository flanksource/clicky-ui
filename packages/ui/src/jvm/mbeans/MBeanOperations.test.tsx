import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CACHE_MBEAN } from "../fixtures/mbeans";
import { MBeanOperations } from "./MBeanOperations";

describe("MBeanOperations", () => {
  it("lists signatures sorted by name and disables Run when invocation is not allowed", () => {
    render(<MBeanOperations objectName={CACHE_MBEAN.objectName} operations={CACHE_MBEAN.operations} canInvoke={false} onInvoke={vi.fn()} />);
    const runs = screen.getAllByRole("button", { name: /^Run / });
    expect(runs.map((button) => button.getAttribute("aria-label"))).toEqual(["Run clear()", "Run lookup(java.lang.String,boolean)"]);
    expect(runs.every((button) => (button as HTMLButtonElement).disabled)).toBe(true);
  });

  it("invokes with arguments typed by the signature and shows the result", async () => {
    const onInvoke = vi.fn().mockResolvedValue("order 42");
    render(<MBeanOperations objectName={CACHE_MBEAN.objectName} operations={CACHE_MBEAN.operations} canInvoke onInvoke={onInvoke} />);
    fireEvent.click(screen.getByRole("button", { name: "Run lookup(java.lang.String,boolean)" }));
    fireEvent.change(screen.getByRole("textbox", { name: "key" }), { target: { value: "42" } });
    fireEvent.click(screen.getByRole("checkbox", { name: "refresh" }));
    fireEvent.click(screen.getByRole("button", { name: "Invoke" }));
    await waitFor(() => expect(onInvoke).toHaveBeenCalledWith(expect.objectContaining({ name: "lookup" }), ["42", true]));
    expect(await screen.findByRole("region", { name: "Result" })).toHaveTextContent("order 42");
  });

  it("reports which argument failed validation without invoking", async () => {
    const onInvoke = vi.fn();
    const operation = { name: "resize", returnType: "void", signature: [{ name: "capacity", type: "int" }] };
    render(<MBeanOperations objectName={CACHE_MBEAN.objectName} operations={[operation]} canInvoke onInvoke={onInvoke} />);
    fireEvent.click(screen.getByRole("button", { name: "Run resize(int)" }));
    fireEvent.change(screen.getByRole("textbox", { name: "capacity" }), { target: { value: "lots" } });
    fireEvent.click(screen.getByRole("button", { name: "Invoke" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("capacity: Expected a int integer");
    expect(onInvoke).not.toHaveBeenCalled();
  });
});
