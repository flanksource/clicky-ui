import { useState } from "react";
import { Button } from "../../components/button";
import { Badge } from "../../data/Badge";
import type { MBeanOperation } from "../protocol/types";
import { MBeanInvokeDialog } from "./MBeanInvokeDialog";

const IMPACT_LABEL: Record<number, string> = { 0: "info", 1: "action", 2: "action/info" };

export type MBeanOperationsProps = {
  objectName: string;
  operations: MBeanOperation[];
  /** Enable Run; when false the operations are listed read-only. */
  canInvoke: boolean;
  onInvoke: (operation: MBeanOperation, args: unknown[]) => Promise<unknown>;
};

function operationKey(operation: MBeanOperation): string {
  return `${operation.name}(${operation.signature.map((parameter) => parameter.type).join(",")})`;
}

/** An MBean's operations as signatures, each opening an invoke dialog. */
export function MBeanOperations({ objectName, operations, canInvoke, onInvoke }: MBeanOperationsProps) {
  const [selected, setSelected] = useState<MBeanOperation | null>(null);
  if (operations.length === 0) return <p className="text-sm text-muted-foreground">No operations.</p>;
  const sorted = [...operations].sort(
    (left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }) || operationKey(left).localeCompare(operationKey(right)),
  );
  return (
    <div className="space-y-2">
      {sorted.map((operation) => {
        const impact = operation.impact === undefined ? undefined : IMPACT_LABEL[operation.impact];
        return (
          <div key={operationKey(operation)} className="flex items-start justify-between gap-2 rounded border border-border p-2 text-xs">
            <div className="min-w-0">
              <div className="break-all font-mono">
                <span className="text-muted-foreground">{operation.returnType} </span>
                <strong>{operation.name}</strong>({operation.signature.map((parameter) => `${parameter.type} ${parameter.name}`).join(", ")})
                {impact ? <Badge className="ml-2" size="xs" variant="outline">{impact}</Badge> : null}
              </div>
              {operation.description && operation.description !== operation.name ? (
                <p className="mt-1 text-muted-foreground">{operation.description}</p>
              ) : null}
            </div>
            <Button size="sm" variant="outline" disabled={!canInvoke} aria-label={`Run ${operationKey(operation)}`} onClick={() => setSelected(operation)}>
              Run
            </Button>
          </div>
        );
      })}
      {selected ? (
        <MBeanInvokeDialog
          key={`${objectName}:${operationKey(selected)}`}
          objectName={objectName}
          operation={selected}
          onInvoke={(args) => onInvoke(selected, args)}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </div>
  );
}
