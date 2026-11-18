import { useState } from "react";
import { Button } from "../../components/button";
import { Checkbox } from "../../components/Checkbox";
import { InputField } from "../../components/InputField";
import { JsonView } from "../../data/JsonView";
import { Modal } from "../../overlay/Modal";
import { isBooleanMBeanType, parseMBeanArgument } from "../model/mbean-arguments";
import type { MBeanOperation } from "../protocol/types";

export type MBeanInvokeDialogProps = {
  objectName: string;
  operation: MBeanOperation;
  /** Invokes with arguments validated against the signature; resolves to the return value. */
  onInvoke: (args: unknown[]) => Promise<unknown>;
  onClose: () => void;
};

function parseArguments(operation: MBeanOperation, raw: string[]): unknown[] {
  return operation.signature.map((parameter, index) => {
    try {
      return parseMBeanArgument(raw[index] ?? "", parameter.type);
    } catch (cause) {
      throw new Error(`${parameter.name}: ${cause instanceof Error ? cause.message : String(cause)}`);
    }
  });
}

/** One input per parameter, then the invocation's return value. Stays open to invoke again. */
export function MBeanInvokeDialog({ objectName, operation, onInvoke, onClose }: MBeanInvokeDialogProps) {
  const [raw, setRaw] = useState<string[]>(() => operation.signature.map((parameter) => (isBooleanMBeanType(parameter.type) ? "false" : "")));
  const [result, setResult] = useState<{ value: unknown }>();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const setArgument = (index: number, value: string) => setRaw((current) => current.map((other, position) => (position === index ? value : other)));

  const invoke = async () => {
    setError(undefined);
    setResult(undefined);
    setPending(true);
    try {
      setResult({ value: await onInvoke(parseArguments(operation, raw)) });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : String(cause));
    } finally {
      setPending(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={
        <span>
          {operation.name} <span className="font-mono text-sm font-normal text-muted-foreground">→ {operation.returnType}</span>
        </span>
      }
      aria-label={`Invoke ${operation.name}`}
      subtitle={<span className="break-all font-mono text-xs text-muted-foreground">{objectName}</span>}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          <Button loading={pending} onClick={() => void invoke()}>
            Invoke
          </Button>
        </div>
      }
    >
      <div className="space-y-3 text-xs">
        {operation.signature.length === 0 ? <p className="text-muted-foreground">This operation takes no parameters.</p> : null}
        {operation.signature.map((parameter, index) => (
          <div key={`${parameter.name}:${index}`} className="flex flex-col gap-1">
            <span className="font-mono">
              {parameter.type} {parameter.name}
            </span>
            {parameter.description && parameter.description !== parameter.name ? (
              <span className="text-muted-foreground">{parameter.description}</span>
            ) : null}
            {isBooleanMBeanType(parameter.type) ? (
              <Checkbox aria-label={parameter.name} checked={raw[index] === "true"} onChange={(checked) => setArgument(index, String(checked))} />
            ) : (
              <InputField aria-label={parameter.name} inputClassName="font-mono text-xs" value={raw[index] ?? ""} onChange={(value) => setArgument(index, value)} />
            )}
          </div>
        ))}
        {error ? (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        ) : null}
        {result ? (
          <section aria-label="Result" className="rounded border border-border bg-muted/30 p-2">
            <p className="mb-1 font-semibold">Result</p>
            {result.value === null || result.value === undefined ? (
              <p className="text-muted-foreground">{operation.returnType === "void" ? "Completed." : "null"}</p>
            ) : (
              <JsonView data={result.value} />
            )}
          </section>
        ) : null}
      </div>
    </Modal>
  );
}
