const INTEGER_BOUNDS: Record<string, [bigint, bigint]> = {
  byte: [-128n, 127n],
  short: [-32768n, 32767n],
  int: [-2147483648n, 2147483647n],
  integer: [-2147483648n, 2147483647n],
  long: [-9223372036854775808n, 9223372036854775807n],
};

function primitiveName(type: string): string {
  return type.replace(/^java\.lang\./, "").toLowerCase();
}

/** Java types an operator can enter as plain text: primitives, their boxes, String and ObjectName. */
export function isScalarMBeanType(type: string): boolean {
  const primitive = primitiveName(type);
  return (
    type === "javax.management.ObjectName" ||
    primitive in INTEGER_BOUNDS ||
    ["string", "boolean", "char", "character", "float", "double"].includes(primitive)
  );
}

export function isBooleanMBeanType(type: string): boolean {
  return primitiveName(type) === "boolean";
}

/**
 * Validates operator input against a JMX parameter or attribute type and
 * returns the value to send. Integers and decimals stay strings so `long`
 * precision survives JSON; the agent converts them to the declared type.
 * Non-scalar types pass through unchanged.
 */
export function parseMBeanArgument(raw: string, type: string): unknown {
  const primitive = primitiveName(type);
  if (primitive === "string" || type === "javax.management.ObjectName") return raw;
  const trimmed = raw.trim();
  if (primitive === "boolean") {
    if (trimmed === "true") return true;
    if (trimmed === "false") return false;
    throw new Error("Expected true or false");
  }
  if (primitive === "char" || primitive === "character") {
    if (raw.length !== 1) throw new Error("Expected one character");
    return raw;
  }
  const bounds = INTEGER_BOUNDS[primitive];
  if (bounds) {
    if (!/^-?\d+$/.test(trimmed)) throw new Error(`Expected a ${type} integer`);
    const value = BigInt(trimmed);
    if (value < bounds[0] || value > bounds[1]) throw new Error(`Value is outside the ${type} range`);
    return trimmed;
  }
  if (primitive === "float" || primitive === "double") {
    if (!trimmed || !Number.isFinite(Number(trimmed))) throw new Error(`Expected a finite ${type}`);
    return trimmed;
  }
  return raw;
}
