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
  selectedRowIds: string[];
  selectedRows: ClickyRow[];
  clearSelection: () => void;
  onExecuted: () => void | Promise<void>;
  actionsContainer?: Element | null;
};

export function OperationCatalogActions({
  actions,
  selectionActions,
  filters,
  filterParameterNames,
  selectedRowIds,
  selectedRows,
  clearSelection,
  onExecuted,
  actionsContainer,
  ...actionProps
}: OperationCatalogActionsProps) {
  function getActionLockedValues(
    operation: ResolvedOperation
  ): Record<string, string> {
    const meta = getOperationClickyMeta(operation);
    if (meta == null || !meta.supportsFilterMode) return {};

    const locked: Record<string, string> = {};
    for (const parameter of operation.operation.parameters ?? []) {
      const value = filters[parameter.name];
      if (parameter.in === "query" && value) locked[parameter.name] = value;
    }
    if (meta.idParam) locked[meta.idParam] = "all";
    if (
      (operation.operation.parameters ?? []).some(
        (parameter) => parameter.name === "filter"
      )
    ) {
      locked.filter =
        Object.entries(filters)
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
        actions={selectionActions}
        selection={{ selectedRowIds, selectedRows, clearSelection }}
        getLockedValues={() => ({ filter: "" })}
        getRequestValues={() => ({ args: selectedRowIds })}
        excludedParameterNames={excludedParameterNames}
        onExecuted={onExecuted}
      />
    </>
  );
}
