import { useState } from "react";
import { Button } from "../../components/button";
import { Checkbox } from "../../components/Checkbox";
import { InputField } from "../../components/InputField";
import { Modal } from "../../overlay/Modal";
import { isBooleanMBeanType, isScalarMBeanType, parseMBeanArgument } from "../model/mbean-arguments";
import type { MBeanAttributeReading } from "../protocol/types";
import { MBeanAttributeLabel } from "./MBeanAttributeLabel";

export type MBeanAttributeEditDialogProps = {
  objectName: string;
  attribute: MBeanAttributeReading;
  onWrite: (value: unknown) => Promise<void>;
  onClose: () => void;
};

function initialDraft(attribute: MBeanAttributeReading): string {
  if (isScalarMBeanType(attribute.type)) return attribute.value == null ? "" : String(attribute.value);
  return JSON.stringify(attribute.value ?? null, null, 2);
}

function parseDraft(attribute: MBeanAttributeReading, draft: string): unknown {
  if (isScalarMBeanType(attribute.type)) return parseMBeanArgument(draft, attribute.type);
  return JSON.parse(draft) as unknown;
}

/**
 * Edits one writable attribute. Scalars are typed against the attribute's Java
 * type; anything else is entered as JSON. The dialog stays open with the error
 * when the write fails.
 */
export function MBeanAttributeEditDialog({ objectName, attribute, onWrite, onClose }: MBeanAttributeEditDialogProps) {
  const [draft, setDraft] = useState(() => initialDraft(attribute));
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  const scalar = isScalarMBeanType(attribute.type);

  const submit = async () => {
    setError(undefined);
    setPending(true);
    try {
      await onWrite(parseDraft(attribute, draft));
      onClose();
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
      title={`Edit ${attribute.name}`}
      subtitle={<span className="break-all font-mono text-xs text-muted-foreground">{objectName}</span>}
      size="md"
      footer={
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={pending} onClick={() => void submit()}>
            Write
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-2 text-xs">
        <span className="font-mono">
          <MBeanAttributeLabel objectName={objectName} attribute={attribute} />
        </span>
        {isBooleanMBeanType(attribute.type) ? (
          <Checkbox aria-label={`${attribute.name} value`} checked={draft === "true"} onChange={(checked) => setDraft(String(checked))} />
        ) : (
          <>
            <span className="text-muted-foreground">{scalar ? `Enter a ${attribute.type}.` : "Enter a JSON value. Quote strings."}</span>
            <InputField
              {...(scalar ? {} : { as: "textarea" as const, rows: 8 })}
              aria-label={`${attribute.name} value`}
              inputClassName="font-mono text-xs"
              value={draft}
              onChange={setDraft}
            />
          </>
        )}
        {error ? (
          <p role="alert" className="text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
