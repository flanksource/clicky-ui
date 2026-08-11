/**
 * A bool or nested group of conditions. A group renders itself for a child that
 * is also a group, so the tree nests to whatever depth the author builds; the
 * compiler places no bound on it either.
 */

import {
  type EsBuilderVocabulary
  } from "./esQueryOperators";

/** Whether an operator holds other conditions rather than matching a value. */
export function isGroupOperator(
  catalog: EsBuilderVocabulary["catalog"],
  op: string,
): boolean {
  return catalog.find((entry) => entry.op === op)?.group === true;
}

/** The group kinds the catalog offers — bool and nested, today. */
export function groupOperatorOptions(catalog: EsBuilderVocabulary["catalog"]) {
  return catalog
    .filter((entry) => entry.group)
    .map((entry) => ({ value: entry.op, label: entry.label }));
}
