import { act, fireEvent, render, screen } from "@testing-library/react";
import { Provider, atom, createStore } from "jotai";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  JotaiFilterBar,
  JotaiJsonSchemaForm,
  type JotaiFilterBarFilter,
} from "../jotai";
import type { JsonSchemaObject } from "./json-schema-form-types";

afterEach(() => {
  vi.useRealTimers();
});

describe("JotaiJsonSchemaForm", () => {
  it("binds JsonSchemaForm value and changes to an atom", () => {
    const store = createStore();
    const formAtom = atom<Record<string, unknown>>({ Name: "" });
    const onChange = vi.fn();
    const schema: JsonSchemaObject = {
      type: "object",
      properties: {
        Name: { type: "string" },
      },
    };

    render(
      <Provider store={store}>
        <JotaiJsonSchemaForm
          schema={schema}
          atom={formAtom}
          onChange={onChange}
          showPreferencesMenu={false}
        />
      </Provider>,
    );

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "Ada" } });

    expect(store.get(formAtom)).toEqual({ Name: "Ada" });
    expect(onChange).toHaveBeenCalledWith({ Name: "Ada" });
  });
});

describe("JotaiFilterBar", () => {
  it("binds search and filter values to atoms", () => {
    vi.useFakeTimers();
    const store = createStore();
    const searchAtom = atom("");
    const ownerAtom = atom("");
    const onSearch = vi.fn();
    const onOwner = vi.fn();
    const filters: JotaiFilterBarFilter[] = [
      {
        key: "owner",
        kind: "text",
        label: "Owner",
        atom: ownerAtom,
        onChange: onOwner,
      },
    ];

    render(
      <Provider store={store}>
        <JotaiFilterBar
          search={{ atom: searchAtom, onChange: onSearch, ariaLabel: "Search work" }}
          filters={filters}
        />
      </Provider>,
    );

    fireEvent.change(screen.getByRole("searchbox", { name: "Search work" }), {
      target: { value: "api" },
    });
    expect(store.get(searchAtom)).toBe("");
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(store.get(searchAtom)).toBe("api");
    expect(onSearch).toHaveBeenCalledWith("api");

    fireEvent.change(screen.getByLabelText("Owner"), { target: { value: "platform" } });
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(store.get(ownerAtom)).toBe("platform");
    expect(onOwner).toHaveBeenCalledWith("platform");

    act(() => {
      store.set(ownerAtom, "security");
    });
    expect(screen.getByLabelText("Owner")).toHaveValue("security");
  });

  it("binds range apply values to atoms", () => {
    const store = createStore();
    const rangeAtom = atom({ from: "now-24h", to: "now" });
    const onApply = vi.fn();

    render(
      <Provider store={store}>
        <JotaiFilterBar
          timeRange={{
            atom: rangeAtom,
            onApply,
          }}
        />
      </Provider>,
    );

    fireEvent.click(screen.getByRole("button", { name: /time range filter/i }));
    fireEvent.change(screen.getByLabelText("Time range from"), {
      target: { value: "now-1h" },
    });
    fireEvent.change(screen.getByLabelText("Time range to"), {
      target: { value: "now" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Apply" }));

    expect(store.get(rangeAtom)).toEqual({ from: "now-1h", to: "now" });
    expect(onApply).toHaveBeenCalledWith("now-1h", "now");
  });
});
