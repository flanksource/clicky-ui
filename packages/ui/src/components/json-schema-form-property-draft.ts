export function propertyValuesEqual(left: unknown, right: unknown): boolean {
  if (Object.is(left, right)) return true;
  if (Array.isArray(left) || Array.isArray(right)) {
    return (
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      left.every((value, index) => propertyValuesEqual(value, right[index]))
    );
  }
  if (
    left === null ||
    right === null ||
    typeof left !== "object" ||
    typeof right !== "object"
  )
    return false;
  const leftObject = left as Record<string, unknown>;
  const rightObject = right as Record<string, unknown>;
  return (
    Object.keys(leftObject).length === Object.keys(rightObject).length &&
    Object.keys(leftObject).every(
      (key) =>
        Object.prototype.hasOwnProperty.call(rightObject, key) &&
        propertyValuesEqual(leftObject[key], rightObject[key]),
    )
  );
}

export function propertyDraftValue(
  root: Record<string, unknown>,
  path: string,
): unknown {
  return path
    .slice(1)
    .split("/")
    .reduce<unknown>((value, part) => {
      if (value === null || typeof value !== "object") return undefined;
      return (value as Record<string, unknown>)[
        part.replace(/~1/g, "/").replace(/~0/g, "~")
      ];
    }, root);
}

export function updatePropertyDraft({
  root,
  path,
  value,
}: {
  root: Record<string, unknown>;
  path: string;
  value: unknown;
}): Record<string, unknown> {
  const parts = path
    .slice(1)
    .split("/")
    .map((part) => part.replace(/~1/g, "/").replace(/~0/g, "~"));
  function update(node: unknown, depth: number): unknown {
    const key = parts[depth];
    if (key === undefined) return value;
    if (Array.isArray(node))
      return node.map((item, index) =>
        String(index) === key ? update(item, depth + 1) : item,
      );
    if (node != null && typeof node !== "object")
      throw new Error(`Cannot edit property at ${path}: expected an object`);
    const object = node as Record<string, unknown> | undefined;
    return { ...object, [key]: update(object?.[key], depth + 1) };
  }
  return update(root, 0) as Record<string, unknown>;
}
