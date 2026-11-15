import { describe, expect, it } from "vitest";
import type { JvmMethodRange } from "../protocol/types";
import { bareMethodName, classFocus, methodKey, methodSignature, selectMethod } from "./class-fold";

const CLASS = "com.example.orders.OrderService";
const CHECKOUT: JvmMethodRange = { name: "checkout", descriptor: "(Ljava/lang/String;)D", line: 14, endLine: 19 };
const CANCEL: JvmMethodRange = { name: "cancel", descriptor: "(Ljava/lang/String;)V", line: 21, endLine: 23 };
const INIT: JvmMethodRange = { name: "<init>", descriptor: "(Lcom/example/orders/Inventory;[ILjava/util/Map$Entry;)V", line: 9, endLine: 12 };
const PRICE_ONE: JvmMethodRange = { name: "price", descriptor: "(Ljava/lang/String;)D", line: 25, endLine: 27 };
const PRICE_TWO: JvmMethodRange = { name: "price", descriptor: "(Ljava/lang/String;I)D", line: 29, endLine: 31 };
const METHODS = [INIT, CHECKOUT, CANCEL, PRICE_ONE, PRICE_TWO];

describe("bareMethodName", () => {
  it.each([
    ["checkout", "checkout"],
    ["checkout(Ljava/lang/String;)D", "checkout"],
    ["  cancel (Ljava/lang/String;)V", "cancel"],
    ["<init>(I)V", "<init>"],
    ["<clinit>", "<clinit>"],
    ["", ""],
  ])("%j -> %j", (selector, expected) => {
    expect(bareMethodName(selector)).toBe(expected);
  });
});

describe("methodKey", () => {
  it("joins the name and the JVM descriptor, which tells overloads apart", () => {
    expect(methodKey(PRICE_TWO)).toBe("price(Ljava/lang/String;I)D");
  });
});

describe("selectMethod", () => {
  it.each([
    ["an exact name and descriptor", "checkout(Ljava/lang/String;)D", CHECKOUT],
    ["an exact overload among several", "price(Ljava/lang/String;I)D", PRICE_TWO],
    ["a bare name with a single method", "cancel", CANCEL],
    ["a constructor by its JVM name", "<init>", INIT],
    ["nothing for a bare name shared by overloads", "price", null],
    ["nothing for an unknown method", "refund", null],
    ["nothing for an empty selector", "  ", null],
  ])("resolves %s", (_name, selector, expected) => {
    expect(selectMethod(METHODS, selector)).toEqual(expected);
  });
});

describe("methodSignature", () => {
  it.each([
    ["reads parameter types as simple names", CHECKOUT, "checkout(String)"],
    ["renders primitives, arrays and nested classes", INIT, "OrderService(Inventory, int[], Map.Entry)"],
    ["renders no parameters", { name: "toString", descriptor: "()Ljava/lang/String;", line: 1, endLine: 1 }, "toString()"],
    ["renders a static initialiser as a static block", { name: "<clinit>", descriptor: "()V", line: 1, endLine: 1 }, "static {}"],
    ["renders every primitive", { name: "mix", descriptor: "(ZBCSIJFD)V", line: 1, endLine: 1 }, "mix(boolean, byte, char, short, int, long, float, double)"],
    ["renders multi-dimensional arrays", { name: "grid", descriptor: "([[J[Ljava/lang/String;)V", line: 1, endLine: 1 }, "grid(long[][], String[])"],
  ])("%s", (_name, method, expected) => {
    expect(methodSignature(method, CLASS)).toBe(expected);
  });

  it("names a constructor after its inner class", () => {
    expect(methodSignature({ name: "<init>", descriptor: "()V", line: 1, endLine: 1 }, "com.example.payments.PaymentClient$Retry")).toBe("Retry()");
  });

  it("rejects a malformed descriptor instead of guessing a signature", () => {
    expect(() => methodSignature({ name: "bad", descriptor: "(Lcom/example/Unterminated)V", line: 1, endLine: 1 }, CLASS)).toThrow(
      'Invalid JVM method descriptor "(Lcom/example/Unterminated)V"',
    );
    expect(() => methodSignature({ name: "bad", descriptor: "no-parens", line: 1, endLine: 1 }, CLASS)).toThrow("Invalid JVM method descriptor");
  });
});

describe("classFocus", () => {
  const sourceLineCount = 32;
  const sourceLineNumbers = Array.from({ length: sourceLineCount }, (_, row) => (row >= 14 && row <= 18 ? row + 3 : 0));
  const base = { className: CLASS, methods: METHODS, sourceLineCount, sourceLineNumbers };

  it("folds to the selected method's range with nothing highlighted", () => {
    expect(classFocus({ ...base, method: "checkout(Ljava/lang/String;)D", line: 0 })).toEqual({
      highlightRow: -1,
      range: { startLine: 14, endLine: 19 },
    });
  });

  it("lets the method win when a link carries both a method and a line", () => {
    expect(classFocus({ ...base, method: "cancel", line: 17 })).toEqual({ highlightRow: -1, range: { startLine: 21, endLine: 23 } });
  });

  it("highlights the row a bytecode line landed on when no method is named", () => {
    expect(classFocus({ ...base, method: "", line: 19 })).toEqual({ highlightRow: 16, range: null });
  });

  it("shows the whole class when neither a method nor a line is named", () => {
    expect(classFocus({ ...base, method: "", line: 0 })).toEqual({ highlightRow: -1, range: null });
  });

  it("explains a line the mapping has no row for instead of ignoring it", () => {
    const focus = classFocus({ ...base, method: "", line: 2 });
    expect(focus.highlightRow).toBe(-1);
    expect(focus.range).toBeNull();
    expect(focus.note).toBe("Line 2 is not in the decompiled source of com.example.orders.OrderService.");
  });

  it("does not fold to either overload of an ambiguous bare name, and points at the first", () => {
    expect(classFocus({ ...base, method: "price", line: 0 })).toEqual({
      highlightRow: 24,
      range: null,
      note: "price has 2 overloads, so none is folded open; the first is highlighted. Pick one from the method list.",
    });
  });

  it("names a method the decompiler could not place", () => {
    expect(classFocus({ ...base, method: "refund", line: 0 })).toEqual({
      highlightRow: -1,
      range: null,
      note: "com.example.orders.OrderService has no method refund that the decompiler could place.",
    });
  });

  it("refuses a range that lies outside the decompiled source", () => {
    const focus = classFocus({ ...base, sourceLineCount: 10, method: "cancel", line: 0 });
    expect(focus.range).toBeNull();
    expect(focus.note).toBe("cancel is placed at lines 21-23, outside the 10 decompiled lines.");
  });
});
