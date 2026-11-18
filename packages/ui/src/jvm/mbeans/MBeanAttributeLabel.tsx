import { HelpTip } from "../../overlay/HelpTip";
import { mbeanAttributeProperty } from "../model/mbean-properties";
import type { MBeanAttributeReading } from "../protocol/types";
import { mbeanAttributeIcon } from "./mbean-attribute-icon";

export type MBeanAttributeLabelProps = {
  objectName: string;
  attribute: MBeanAttributeReading;
};

/** Attribute name with a Java-type icon and, when the MBean describes it, a help tip. */
export function MBeanAttributeLabel({ objectName, attribute }: MBeanAttributeLabelProps) {
  const TypeIcon = mbeanAttributeIcon(attribute, mbeanAttributeProperty(objectName, attribute));
  const description = attribute.description?.trim();
  return (
    <span className="inline-flex max-w-full items-center gap-1 align-middle">
      <span role="img" aria-label={`${attribute.name} type: ${attribute.type}`} title={attribute.type} className="shrink-0 text-muted-foreground">
        <TypeIcon size="0.875rem" />
      </span>
      <span title={attribute.name} className="truncate">
        {attribute.name}
      </span>
      {description && description !== attribute.name ? <HelpTip label={attribute.name} help={description} className="shrink-0" /> : null}
    </span>
  );
}
