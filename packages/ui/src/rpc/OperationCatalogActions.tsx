import { createPortal } from "react-dom";
import type { ClickyRow } from "../data/Clicky";
import { getOperationClickyMeta } from "./clickyMetadata";
import {
  OperationActionBar,
  type OperationActionBarProps,
} from "./OperationActionBar";
import type { ResolvedOperation } from "./types";

type OperationCatalogActionsProps = Pick<
  OperationActionBarProps,
  | "client"
  | "commandRuntime"
  | "formPre"
  | "formPost"
  | "formActions"
  | "actionLabels"
  | "initialValuesByAction"
> & {
  actions: ResolvedOperation[];
  selectionActions: ResolvedOperation[];
  filters: Record<string, string>;
  filterParameterNames: string[];
  membershipFilterParameterNames: string[];
  selectedRowIds: string[];
  selectedRows: ClickyRow[];
  selectedScope?: { id: string; total: number };
  clearSelection: () => void;
  onExecuted: () => void | Promise<void>;
  actionsContainer?: Element | null;
};

export function OperationCatalogActions({
  actions,
  selectionActions,
  filters,
  filterParameterNames,
  membershipFilterParameterNames,
  selectedRowIds,
  selectedRows,
  selectedScope,
  clearSelection,
  onExecuted,
  actionsContainer,
  ...actionProps
}: OperationCatalogActionsProps) {
  function getActionLockedValues(
    operation: ResolvedOperation
  ): Record<string, string> {
    const meta = getOperationClickyMeta(operation);
    if (meta == null || !meta.supportsFilterMode || !selectedScope) return {};

    const locked: Record<string, string> = {};
    for (const parameter of operation.operation.parameters ?? []) {
      const value = filters[parameter.name];
      if (parameter.in === "query" && value) locked[parameter.name] = value;
    }
    if (
      (operation.operation.parameters ?? []).some(
        (parameter) => parameter.name === "limit"
      )
    ) {
      locked.limit = String(selectedScope.total);
    }
    if (
      (operation.operation.parameters ?? []).some(
        (parameter) => parameter.name === "offset"
      )
    ) {
      locked.offset = "0";
    }
    if (
      (operation.operation.parameters ?? []).some(
        (parameter) => parameter.name === "filter"
      )
    ) {
      locked.filter =
        membershipFilterParameterNames
          .map((name) => [name, filters[name]] as const)
          .filter(([, value]) => value)
          .map(([key, value]) => `${key}=${value}`)
          .join(", ") || "current list filters";
    }
    return locked;
  }

  const excludedParameterNames = [
    ...filterParameterNames,
    "args",
    "id",
    "filter",
  ];
  const selectionInitialValues = Object.fromEntries(
    selectionActions.map((action) => {
      const meta = getOperationClickyMeta(action);
      const key = meta?.actionName || meta?.verb || "";
      return [
        key,
        {
          ...actionProps.initialValuesByAction?.[key],
          ...(selectedScope ? { count: String(selectedScope.total) } : {}),
        },
      ];
    })
  );
  const actionBar = (
    <OperationActionBar
      {...actionProps}
      actions={actions}
      getLockedValues={getActionLockedValues}
      onExecuted={onExecuted}
      hideLockedInForm
      excludedParameterNames={excludedParameterNames}
    />
  );

  return (
    <>
      {actionsContainer ? createPortal(actionBar, actionsContainer) : actionBar}
      <OperationActionBar
        {...actionProps}
        initialValuesByAction={selectionInitialValues}
        actions={selectionActions}
        selection={{
          selectedRowIds,
          selectedRows,
          ...(selectedScope ? { selectedScope } : {}),
          clearSelection,
        }}
        getLockedValues={
          selectedScope ? getActionLockedValues : () => ({ filter: "" })
        }
        getRequestValues={() => (selectedScope ? {} : { args: selectedRowIds })}
        excludedParameterNames={
          selectedScope
            ? excludedParameterNames
            : [...excludedParameterNames, "count"]
        }
        onExecuted={onExecuted}
      />
    </>
  );
}
