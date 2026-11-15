import { useState } from "react";
import { Properties } from "../../data/Properties";
import { UiEdit } from "../../icons";
import { mbeanAttributeProperty } from "../model/mbean-properties";
import type { MBeanAttributeReading } from "../protocol/types";
import { MBeanAttributeEditDialog } from "./MBeanAttributeEditDialog";
import { MBeanAttributeLabel } from "./MBeanAttributeLabel";

export type MBeanAttributesProps = {
  objectName: string;
  attributes: MBeanAttributeReading[];
  /** Show Edit on writable attributes. */
  canWrite: boolean;
  /** Writes the parsed value; reject to keep the dialog open with the error. */
  onWrite: (attribute: string, value: unknown) => Promise<void>;
};

function sortByName(attributes: MBeanAttributeReading[]): MBeanAttributeReading[] {
  return [...attributes].sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: "base" }));
}

/** An MBean's attributes as typed properties, sorted by name, with an editor for writable ones. */
export function MBeanAttributes({ objectName, attributes, canWrite, onWrite }: MBeanAttributesProps) {
  const [editing, setEditing] = useState<MBeanAttributeReading | null>(null);
  const byName = new Map(attributes.map((attribute) => [attribute.name, attribute]));
  const attributeNamed = (name: string) => {
    const attribute = byName.get(name);
    if (!attribute) throw new Error(`MBean attribute ${name} is missing from ${objectName}`);
    return attribute;
  };

  return (
    <>
      <Properties
        keyRef="jvm-mbean-attributes"
        gridTemplateColumns="minmax(0, 45%) minmax(0, 1fr)"
        labelClassName="font-mono"
        items={sortByName(attributes).map((attribute) => mbeanAttributeProperty(objectName, attribute))}
        renderLabel={(key) => <MBeanAttributeLabel objectName={objectName} attribute={attributeNamed(key)} />}
        suffixActions={[
          {
            id: "edit",
            icon: UiEdit,
            label: (key) => `Edit ${key}`,
            visible: (key) => canWrite && attributeNamed(key).writable,
            onClick: (key) => setEditing(attributeNamed(key)),
          },
        ]}
        emptyMessage="No attributes."
      />
      {editing ? (
        <MBeanAttributeEditDialog
          key={`${objectName}:${editing.name}`}
          objectName={objectName}
          attribute={editing}
          onWrite={(value) => onWrite(editing.name, value)}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </>
  );
}
