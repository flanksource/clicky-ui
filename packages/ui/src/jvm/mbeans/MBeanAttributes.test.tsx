import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CACHE_MBEAN, CACHE_VALUES } from "../fixtures/mbeans";
import { mergeMBeanReadings } from "../model/mbean-readings";
import { MBeanAttributes } from "./MBeanAttributes";

const attributes = mergeMBeanReadings(CACHE_MBEAN, CACHE_VALUES);

function renderAttributes(canWrite: boolean, onWrite = vi.fn().mockResolvedValue(undefined)) {
  render(<MBeanAttributes objectName={CACHE_MBEAN.objectName} attributes={attributes} canWrite={canWrite} onWrite={onWrite} />);
  return onWrite;
}

describe("MBeanAttributes", () => {
  it("offers Edit only on writable attributes when writes are allowed", () => {
    renderAttributes(true);
    expect(screen.getAllByRole("button", { name: /^Edit / }).map((button) => button.getAttribute("aria-label"))).toEqual([
      "Edit Enabled",
      "Edit MaxEntries",
      "Edit Password",
      "Edit Settings",
    ]);
  });

  it("hides Edit when writes are not allowed", () => {
    renderAttributes(false);
    expect(screen.queryByRole("button", { name: /^Edit / })).toBeNull();
  });

  it("validates a typed scalar before writing it", async () => {
    const onWrite = renderAttributes(true);
    fireEvent.click(screen.getByRole("button", { name: "Edit MaxEntries" }));
    const input = screen.getByRole("textbox", { name: "MaxEntries value" });
    fireEvent.change(input, { target: { value: "99999999999" } });
    fireEvent.click(screen.getByRole("button", { name: "Write" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Value is outside the int range");
    expect(onWrite).not.toHaveBeenCalled();
    fireEvent.change(input, { target: { value: "6000" } });
    fireEvent.click(screen.getByRole("button", { name: "Write" }));
    await waitFor(() => expect(onWrite).toHaveBeenCalledWith("MaxEntries", "6000"));
    await waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  });

  it("writes composite values as JSON and keeps the dialog open when the write fails", async () => {
    const onWrite = renderAttributes(true, vi.fn().mockRejectedValue(new Error("Attribute is read-only in this state")));
    fireEvent.click(screen.getByRole("button", { name: "Edit Settings" }));
    fireEvent.change(screen.getByRole("textbox", { name: "Settings value" }), { target: { value: '{"ttlSeconds":60}' } });
    fireEvent.click(screen.getByRole("button", { name: "Write" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("Attribute is read-only in this state");
    expect(onWrite).toHaveBeenCalledWith("Settings", { ttlSeconds: 60 });
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });
});
