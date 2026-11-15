import { describe, expect, it } from "vitest";
import { isScalarMBeanType, parseMBeanArgument } from "./mbean-arguments";

describe("parseMBeanArgument", () => {
  it.each([
    ["false", "boolean", false],
    ["true", "java.lang.Boolean", true],
    ["-128", "byte", "-128"],
    ["32767", "short", "32767"],
    ["2147483647", "int", "2147483647"],
    ["9223372036854775807", "long", "9223372036854775807"],
    [" 42 ", "java.lang.Integer", "42"],
    ["1.25e3", "double", "1.25e3"],
    ["", "java.lang.String", ""],
    ["worker's queue", "java.lang.String", "worker's queue"],
    ["x", "char", "x"],
    ["java.lang:type=Memory", "javax.management.ObjectName", "java.lang:type=Memory"],
    ["[1,2]", "[J", "[1,2]"],
  ])("parses %j as %s without losing precision", (raw, type, expected) => {
    expect(parseMBeanArgument(raw, type)).toEqual(expected);
  });

  it.each([
    ["yes", "boolean", "Expected true or false"],
    ["", "int", "Expected a int integer"],
    ["128", "byte", "Value is outside the byte range"],
    ["32768", "short", "Value is outside the short range"],
    ["2147483648", "int", "Value is outside the int range"],
    ["9223372036854775808", "long", "Value is outside the long range"],
    ["1.5", "long", "Expected a long integer"],
    ["NaN", "double", "Expected a finite double"],
    ["Infinity", "float", "Expected a finite float"],
    ["xx", "char", "Expected one character"],
  ])("rejects %j for %s", (raw, type, message) => {
    expect(() => parseMBeanArgument(raw, type)).toThrow(message);
  });
});

describe("isScalarMBeanType", () => {
  it.each([
    ["int", true],
    ["java.lang.Long", true],
    ["java.lang.String", true],
    ["javax.management.ObjectName", true],
    ["boolean", true],
    ["[Ljava.lang.String;", false],
    ["javax.management.openmbean.CompositeData", false],
  ])("%s → %s", (type, expected) => {
    expect(isScalarMBeanType(type)).toBe(expected);
  });
});
