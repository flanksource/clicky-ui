import { act, cleanup, render, renderHook, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { useClickyTableMenu } from "./useClickyTableMenu";

afterEach(cleanup);

describe("useClickyTableMenu", () => {
  it("offers a single Export action and its dialog for a result with a URL", () => {
    const { result } = renderHook(() => useClickyTableMenu({ url: "/api/v1/widgets" }));
    expect(result.current.actions.map((action) => action.id)).toEqual(["export"]);

    render(<>{result.current.dialog}</>);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens the export dialog listing the advertised formats when the action is selected", () => {
    const formats = ["csv", "json"] as const;
    const { result, rerender } = renderHook(() =>
      useClickyTableMenu({ url: "/api/v1/widgets", download: { formats: [...formats] } }),
    );
    act(() => result.current.actions[0]!.onSelect());
    rerender();
    render(<>{result.current.dialog}</>);
    expect(screen.getByRole("dialog")).toBeTruthy();
    for (const format of formats) expect(screen.getByText(format === "csv" ? "CSV" : "JSON")).toBeTruthy();
  });

  it("has nothing to offer without a URL to export from", () => {
    const { result } = renderHook(() => useClickyTableMenu({}));
    expect(result.current.actions).toEqual([]);
    expect(result.current.dialog).toBeNull();
  });
});
