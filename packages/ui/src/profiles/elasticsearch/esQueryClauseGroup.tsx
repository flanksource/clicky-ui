/**
 * A bool or nested group of conditions. A group renders itself for a child that
 * is also a group, so the tree nests to whatever depth the author builds; the
 * compiler places no bound on it either.
 */

import { Combobox } from "../../components/Combobox";
import { IconButton } from "../../components/IconButton";
import { InputField } from "../../components/InputField";
import { Button } from "../../components/button";
import { Select } from "../../components/select";
import { UiAdd, UiTrash } from "../../icons";
import { applyPatch, type Patch } from "../wizard/profileWizardModel";
import {
  emptyCondition,
  emptyGroup,
  normalizeOccur,
  type ConditionPath,
  type EsCondition
} from "./esQueryBuilderModel";
import {
  EsQueryConditionRow,
  type EsQueryContext,
  type EsQueryTreeActions
} from "./esQueryConditionRow";
import {
  fieldFamily,
  type EsFieldMapping
} from "./esQueryOperators";
import { groupOperatorOptions, isGroupOperator } from "./esQueryGroupModel";
import { occurOptions } from "./esQueryOccur";

export function EsQueryClauseGroup({
  condition,
  path,
  context,
  actions,
  root = false
}: {
  condition: EsCondition;
  path: ConditionPath;
  context: EsQueryContext;
  actions: EsQueryTreeActions;
  root?: boolean;
}) {
  const children = condition.conditions ?? [];
  const set = (patch: Patch<EsCondition>) =>
    actions.update(path, (current) => applyPatch(current, patch));
  // A should clause alongside anything else matches one by default. Offering the
  // override only once a should exists keeps it out of the way until it means
  // something.
  const hasShould = children.some(
    (child) => normalizeOccur(child.occur) === "should",
  );

  return (
    <div
      data-es-group={condition.op}
      className="rounded-md border border-dashed border-border px-2 py-2"
    >
      <div className="flex flex-wrap items-center gap-2">
        {root ? (
          <span className="text-xs font-medium text-muted-foreground">Match</span>
        ) : (
          <>
            <span className="w-28 shrink-0">
              <Select
                aria-label="Clause"
                value={normalizeOccur(condition.occur)}
                options={occurOptions(context.vocabulary.occurs)}
                onChange={(event) => set({ occur: event.target.value as never })}
              />
            </span>
            <span className="w-32 shrink-0">
              <Select
                aria-label="Group type"
                value={condition.op}
                options={groupOperatorOptions(context.vocabulary.catalog)}
                onChange={(event) => set({ op: event.target.value })}
              />
            </span>
          </>
        )}
        {condition.op === "nested" ? (
          <Combobox
            ariaLabel="Nested path"
            className="min-w-48 flex-1"
            value={condition.path ?? ""}
            onChange={(next) => set({ path: next })}
            options={nestedPathOptions(context.fields)}
            placeholder="Nested path…"
            allowCustomValue
          />
        ) : null}
        {hasShould ? (
          <InputField
            aria-label="Minimum should match"
            className="w-40"
            placeholder="min should match"
            value={condition.minimumShouldMatch ?? ""}
            onChange={(next) =>
              set({ minimumShouldMatch: next === "" ? undefined : next })
            }
          />
        ) : null}
        <span className="ml-auto flex shrink-0 items-center gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => actions.insert(path, emptyCondition())}
          >
            <UiAdd className="text-xs" /> Condition
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => actions.insert(path, emptyGroup())}
          >
            <UiAdd className="text-xs" /> Group
          </Button>
          {root ? null : (
            <IconButton
              icon={UiTrash}
              label="Remove group"
              onClick={() => actions.remove(path)}
            />
          )}
        </span>
      </div>
      {children.length === 0 ? (
        <p className="mt-2 text-xs text-muted-foreground">
          No conditions — every document matches.
        </p>
      ) : (
        <div className="mt-2 flex flex-col gap-2">
          {children.map((child, index) =>
            isGroupOperator(context.vocabulary.catalog, child.op) ? (
              <EsQueryClauseGroup
                key={index}
                condition={child}
                path={[...path, index]}
                context={context}
                actions={actions}
              />
            ) : (
              <EsQueryConditionRow
                key={index}
                condition={child}
                path={[...path, index]}
                context={context}
                actions={actions}
              />
            ),
          )}
        </div>
      )}
    </div>
  );
}

function nestedPathOptions(fields: EsFieldMapping[]) {
  return fields
    .filter((field) => fieldFamily(field) === "nested")
    .map((field) => ({ value: field.name, label: field.name }));
}
