import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useForm } from "./use-form";

type Values = { name: string; email: string };

// validate flags both fields as required so we can assert all-errors-at-once.
const validate = (v: Values) => ({
  name: v.name.trim() === "" ? "Enter a name" : undefined,
  email: v.email.trim() === "" ? "Enter an email" : undefined,
});

describe("useForm", () => {
  it("computes all field errors and isValid from values", () => {
    const { result, rerender } = renderHook((values: Values) => useForm({ values, validate }), {
      initialProps: { name: "", email: "" },
    });
    expect(result.current.errors).toEqual({ name: "Enter a name", email: "Enter an email" });
    expect(result.current.isValid).toBe(false);

    rerender({ name: "Ann", email: "a@b.c" });
    expect(result.current.isValid).toBe(true);
  });

  it("hides a field's error until it is touched", () => {
    const { result } = renderHook(() =>
      useForm({ values: { name: "", email: "" }, validate }),
    );
    expect(result.current.fieldError("name")).toBeUndefined();
    act(() => result.current.markTouched("name"));
    expect(result.current.fieldError("name")).toBe("Enter a name");
    // The untouched field stays hidden.
    expect(result.current.fieldError("email")).toBeUndefined();
  });

  it("submit reveals every error and does not call onSubmit when invalid", () => {
    const onSubmit = vi.fn();
    const { result } = renderHook(() =>
      useForm({ values: { name: "", email: "" }, validate, onSubmit }),
    );
    act(() => result.current.submit());
    expect(result.current.submitted).toBe(true);
    expect(result.current.fieldError("name")).toBe("Enter a name");
    expect(result.current.fieldError("email")).toBe("Enter an email");
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("submit calls onSubmit with the values when valid", () => {
    const onSubmit = vi.fn();
    const values = { name: "Ann", email: "a@b.c" };
    const { result } = renderHook(() => useForm({ values, validate, onSubmit }));
    act(() => result.current.submit());
    expect(onSubmit).toHaveBeenCalledWith(values);
  });

  it("reset clears touched and submitted so errors hide again", () => {
    const { result } = renderHook(() =>
      useForm({ values: { name: "", email: "" }, validate }),
    );
    act(() => result.current.submit());
    expect(result.current.fieldError("name")).toBe("Enter a name");
    act(() => result.current.reset());
    expect(result.current.submitted).toBe(false);
    expect(result.current.fieldError("name")).toBeUndefined();
  });
});
