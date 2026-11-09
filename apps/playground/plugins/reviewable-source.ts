import {
  Node,
  Project,
  SyntaxKind,
  ts,
  type JsxOpeningElement,
  type JsxSelfClosingElement,
  type ObjectLiteralExpression,
} from "ts-morph";

type Opening = JsxOpeningElement | JsxSelfClosingElement;

export type MarkReviewableInput = {
  domId?: string;
  line?: number;
  column?: number;
  reviewId: string;
};

const REVIEW_ID = /^[A-Za-z][A-Za-z0-9:_-]*$/;
const REVIEW_COMPONENTS = new Set(["BestPractice", "ReviewVariant"]);

function assertReviewableTag(opening: Opening): void {
  const tag = opening.getTagNameNode().getText();
  if (/^[A-Z]/.test(tag) && !REVIEW_COMPONENTS.has(tag)) {
    throw new Error(
      `${tag} does not forward data-review-id; select a native element or supported review component`,
    );
  }
}

function sourceFile(source: string) {
  const project = new Project({ useInMemoryFileSystem: true });
  return project.createSourceFile("page.tsx", source);
}

function openingElements(source: ReturnType<typeof sourceFile>): Opening[] {
  return [
    ...source.getDescendantsOfKind(SyntaxKind.JsxOpeningElement),
    ...source.getDescendantsOfKind(SyntaxKind.JsxSelfClosingElement),
  ];
}

function literalAttribute(opening: Opening, name: string): string | undefined {
  const initializer = opening.getAttribute(name);
  if (!initializer || !Node.isJsxAttribute(initializer)) return undefined;
  const value = initializer.getInitializer();
  return value && Node.isStringLiteral(value)
    ? value.getLiteralValue()
    : undefined;
}

function literalRowId(row: ObjectLiteralExpression): string | undefined {
  const id = row.getProperty("id");
  if (!id || !Node.isPropertyAssignment(id)) return undefined;
  const value = id.getInitializer();
  return value && Node.isStringLiteral(value)
    ? value.getLiteralValue()
    : undefined;
}

export function validSource(source: string): string {
  const result = ts.transpileModule(source, {
    fileName: "page.tsx",
    reportDiagnostics: true,
    compilerOptions: { jsx: ts.JsxEmit.ReactJSX },
  });
  const error = result.diagnostics?.find(
    (diagnostic) => diagnostic.category === ts.DiagnosticCategory.Error,
  );
  if (error)
    throw new Error(
      `review source edit produced invalid TSX: ${ts.flattenDiagnosticMessageText(error.messageText, " ")}`,
    );
  return source;
}

export function markReviewableSource(
  source: string,
  input: MarkReviewableInput,
): string {
  if (!REVIEW_ID.test(input.reviewId))
    throw new Error(`invalid review id ${JSON.stringify(input.reviewId)}`);
  const file = sourceFile(source);
  if (
    openingElements(file).some(
      (opening) =>
        literalAttribute(opening, "data-review-id") === input.reviewId,
    )
  ) {
    throw new Error(
      `review id ${JSON.stringify(input.reviewId)} already exists`,
    );
  }

  const openings = openingElements(file);
  const byId = openings.filter(
    (opening) => input.domId && literalAttribute(opening, "id") === input.domId,
  );
  const direct =
    byId.length > 0
      ? byId
      : openings.filter(
          (opening) =>
            input.line !== undefined &&
            opening.getStartLineNumber() === input.line &&
            (input.column === undefined ||
              opening.getStart() - opening.getStartLinePos() + 1 ===
                input.column),
        );
  if (direct.length > 1)
    throw new Error("review target must be unique in page source");
  if (direct.length === 1) {
    const opening = direct[0];
    if (!opening) throw new Error("review target disappeared");
    assertReviewableTag(opening);
    if (opening.getAttribute("data-review-id"))
      throw new Error("element is already reviewable");
    opening.addAttribute({
      name: "data-review-id",
      initializer: `"${input.reviewId}"`,
    });
    return validSource(file.getFullText());
  }

  const rows = file
    .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
    .filter((row) => literalRowId(row) === input.domId);
  if (rows.length !== 1)
    throw new Error(
      "review target was not found as a unique JSX element or literal row",
    );
  const row = rows[0];
  if (!row) throw new Error("review row disappeared");
  const array = row.getParentIfKind(SyntaxKind.ArrayLiteralExpression);
  if (!array)
    throw new Error("review target is not in a literal variants array");
  const declaration = array.getFirstAncestorByKind(
    SyntaxKind.VariableDeclaration,
  );
  if (!declaration)
    throw new Error("review variants array must be a local variable");
  const templates = openingElements(file).flatMap((opening) => {
    const match = /^id=\{([A-Za-z_$][\w$]*)\.id\}$/.exec(
      opening.getAttribute("id")?.getText() ?? "",
    );
    if (!match) return [];
    const callback = opening.getFirstAncestorByKind(SyntaxKind.ArrowFunction);
    const call = callback?.getParentIfKind(SyntaxKind.CallExpression);
    const expression = call?.getExpression();
    if (
      !callback ||
      !call ||
      !expression ||
      !Node.isPropertyAccessExpression(expression) ||
      expression.getName() !== "map" ||
      expression.getExpression().getText() !== declaration.getName() ||
      callback.getParameters()[0]?.getName() !== match[1]
    )
      return [];
    return [{ opening, mapper: match[1] }];
  });
  if (templates.length !== 1)
    throw new Error(
      "mapped review target must have one matching local array template",
    );
  const template = templates[0];
  if (!template) throw new Error("review template disappeared");
  assertReviewableTag(template.opening);
  if (!template.opening.getAttribute("data-review-id")) {
    template.opening.addAttribute({
      name: "data-review-id",
      initializer: `{${template.mapper}.reviewId}`,
    });
  }
  for (const item of array.getElements()) {
    if (!Node.isObjectLiteralExpression(item))
      throw new Error("variants array must contain only literal rows");
    if (item.getProperty("reviewId")) {
      if (item === row) throw new Error("element is already reviewable");
      continue;
    }
    item.addPropertyAssignment({
      name: "reviewId",
      initializer: item === row ? `"${input.reviewId}"` : "undefined",
    });
  }
  return validSource(file.getFullText());
}

export function deleteReviewableSource(
  source: string,
  reviewId: string,
): string {
  const file = sourceFile(source);
  const rowMatches = file
    .getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression)
    .filter((row) => {
      const property = row.getProperty("reviewId");
      return (
        property &&
        Node.isPropertyAssignment(property) &&
        property.getInitializer()?.getText() === `"${reviewId}"`
      );
    });
  const jsxMatches = openingElements(file).filter(
    (opening) => literalAttribute(opening, "data-review-id") === reviewId,
  );
  if (rowMatches.length + jsxMatches.length !== 1)
    throw new Error(
      `review id ${JSON.stringify(reviewId)} was not found uniquely`,
    );
  if (rowMatches.length === 1) {
    const row = rowMatches[0];
    if (!row) throw new Error("review row disappeared");
    const array = row.getParentIfKind(SyntaxKind.ArrayLiteralExpression);
    if (!array) throw new Error("review row is not in a literal array");
    array.removeElement(row);
    return validSource(file.getFullText());
  }
  const opening = jsxMatches[0];
  if (!opening) throw new Error("review JSX node disappeared");
  const element = Node.isJsxSelfClosingElement(opening)
    ? opening
    : opening.getParentIfKindOrThrow(SyntaxKind.JsxElement);
  if (
    !Node.isJsxElement(element.getParent()) &&
    !Node.isJsxFragment(element.getParent())
  ) {
    throw new Error(
      "review JSX node cannot be removed without changing its parent expression",
    );
  }
  const text = file.getFullText();
  return validSource(
    text.slice(0, element.getStart()) + text.slice(element.getEnd()),
  );
}

function reviewClass(value: string, rejected: boolean): string {
  const classes = value.split(/\s+/).filter((name) => name && name !== "rejected");
  if (rejected) classes.push("rejected");
  return classes.join(" ");
}

function classExpression(value: string, rejected: boolean): string {
  const wrapper = /^\["rejected", \((.*)\)\]\.filter\(Boolean\)\.join\(" "\)$/s.exec(value);
  const original = wrapper?.[1] ?? value;
  return rejected ? `["rejected", (${original})].filter(Boolean).join(" ")` : original;
}

export function setReviewRejectedSource(source: string, reviewId: string, rejected: boolean): string {
  if (!REVIEW_ID.test(reviewId)) throw new Error("invalid review id");
  const file = sourceFile(source);
  const openings = openingElements(file);
  const direct = openings.filter((opening) => literalAttribute(opening, "data-review-id") === reviewId);
  const rows = file.getDescendantsOfKind(SyntaxKind.ObjectLiteralExpression).filter((row) => {
    const property = row.getProperty("reviewId");
    if (!property || !Node.isPropertyAssignment(property)) return false;
    const value = property.getInitializer();
    return value && Node.isStringLiteral(value) && value.getLiteralValue() === reviewId;
  });
  if (direct.length + rows.length !== 1) throw new Error(`review id ${JSON.stringify(reviewId)} was not found uniquely`);
  const opening = direct[0];
  if (opening) {
    const attribute = opening.getAttribute("className");
    if (!attribute) {
      if (rejected) opening.addAttribute({ name: "className", initializer: '"rejected"' });
    } else {
      if (!Node.isJsxAttribute(attribute)) throw new Error("className must be an explicit attribute");
      const initializer = attribute.getInitializer();
      if (initializer && Node.isStringLiteral(initializer)) {
        attribute.setInitializer(JSON.stringify(reviewClass(initializer.getLiteralValue(), rejected)));
      } else if (initializer && Node.isJsxExpression(initializer) && initializer.getExpression()) {
        attribute.setInitializer(`{${classExpression(initializer.getExpressionOrThrow().getText(), rejected)}}`);
      } else throw new Error("review className must have a value");
    }
    return validSource(file.getFullText());
  }
  const row = rows[0];
  if (!row) throw new Error("review row disappeared");
  const array = row.getParentIfKind(SyntaxKind.ArrayLiteralExpression);
  const declaration = array?.getFirstAncestorByKind(SyntaxKind.VariableDeclaration);
  if (!array || !declaration) throw new Error("review row must belong to a local literal array");
  const templates = openings.filter((item) => {
    const expression = item.getAttribute("data-review-id")?.getText();
    const mapper = /^data-review-id=\{([A-Za-z_$][\w$]*)\.reviewId\}$/.exec(expression ?? "")?.[1];
    if (!mapper) return false;
    const callback = item.getFirstAncestorByKind(SyntaxKind.ArrowFunction);
    const call = callback?.getParentIfKind(SyntaxKind.CallExpression);
    const text = call?.getExpression().getText() ?? "";
    return callback?.getParameters()[0]?.getName() === mapper && (text === `${declaration.getName()}.map` || text.startsWith(`${declaration.getName()}.filter(`) && text.endsWith(".map"));
  });
  if (templates.length !== 1) throw new Error("review row needs one matching local map template");
  const template = templates[0];
  if (!template) throw new Error("review template disappeared");
  const mapper = /^data-review-id=\{([A-Za-z_$][\w$]*)\.reviewId\}$/.exec(template.getAttribute("data-review-id")?.getText() ?? "")?.[1];
  if (!mapper) throw new Error("review template has no mapper");
  const attribute = template.getAttribute("className");
  if (!attribute) template.addAttribute({name:"className",initializer:`{${mapper}.className}`});
  else if (Node.isJsxAttribute(attribute) && attribute.getText() !== `className={${mapper}.className}` && !attribute.getText().includes(`${mapper}.className`)) {
    const initial = attribute.getInitializer();
    const expression = initial && Node.isStringLiteral(initial) ? JSON.stringify(initial.getLiteralValue()) : initial && Node.isJsxExpression(initial) ? initial.getExpressionOrThrow().getText() : undefined;
    if (!expression) throw new Error("mapped className must have a value");
    attribute.setInitializer(`{[(${expression}), ${mapper}.className].filter(Boolean).join(" ")}`);
  }
  for (const item of array.getElements()) {
    if (Node.isSpreadElement(item)) continue;
    if (!Node.isObjectLiteralExpression(item)) throw new Error("review variants must be literal rows");
    const property = item.getProperty("className");
    if (!property) item.addPropertyAssignment({name:"className",initializer:JSON.stringify(item === row && rejected ? "rejected" : "")});
    else if (item === row) {
      if (!Node.isPropertyAssignment(property)) throw new Error("row className must be explicit");
      const value = property.getInitializer();
      if (!value || !Node.isStringLiteral(value)) throw new Error("row className must be a string literal");
      property.setInitializer(JSON.stringify(reviewClass(value.getLiteralValue(), rejected)));
    }
  }
  return validSource(file.getFullText());
}
