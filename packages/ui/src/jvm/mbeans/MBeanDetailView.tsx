import type { ReactNode } from "react";
import { Tabs } from "../../layout/Tabs";
import type { MBeanAttributeReading, MBeanInfo, MBeanOperation } from "../protocol/types";
import { MBeanAttributes } from "./MBeanAttributes";
import { MBeanOperations } from "./MBeanOperations";

export type MBeanDetailTab = { id: string; label: ReactNode; count?: number; content: ReactNode };

export type MBeanDetailViewProps = {
  info: MBeanInfo;
  /** `info.attributes` merged with their read values. */
  attributes: MBeanAttributeReading[];
  /** Selected tab id; unknown ids fall back to attributes. */
  view: string;
  onViewChange: (view: string) => void;
  canWrite: boolean;
  onWriteAttribute: (attribute: string, value: unknown) => Promise<void>;
  onInvoke: (operation: MBeanOperation, args: unknown[]) => Promise<unknown>;
  /** Content above the tabs, e.g. a `MutationGate`. */
  toolbar?: ReactNode;
  /** Actions on the attributes tab, e.g. a refresh button. */
  attributeActions?: ReactNode;
  /** Shown under the notification types, e.g. a link to record them. */
  notificationsFooter?: ReactNode;
  /** Host tabs appended after the built-in ones (a logger table for java.util.logging, …). */
  extraTabs?: MBeanDetailTab[];
};

function Notifications({ info, footer }: { info: MBeanInfo; footer: ReactNode }) {
  return (
    <div className="space-y-2 text-xs">
      {info.notifications.length === 0 ? <p className="text-muted-foreground">This MBean emits no notifications.</p> : null}
      {info.notifications.map((notification) => (
        <div key={notification.name} className="rounded border border-border p-2">
          <p className="break-all font-mono font-medium">{notification.name}</p>
          {notification.description && notification.description !== notification.name ? (
            <p className="mt-1 text-muted-foreground">{notification.description}</p>
          ) : null}
          <ul className="mt-1 space-y-0.5 font-mono text-muted-foreground">
            {notification.types.map((type) => (
              <li key={type}>{type}</li>
            ))}
          </ul>
        </div>
      ))}
      {footer}
    </div>
  );
}

/** Header plus Attributes / Operations / Notifications tabs for one MBean. */
export function MBeanDetailView({
  info,
  attributes,
  view,
  onViewChange,
  canWrite,
  onWriteAttribute,
  onInvoke,
  toolbar,
  attributeActions,
  notificationsFooter,
  extraTabs = [],
}: MBeanDetailViewProps) {
  const tabs: MBeanDetailTab[] = [
    {
      id: "attributes",
      label: "Attributes",
      count: info.attributes.length,
      content: (
        <div className="space-y-2">
          {attributeActions ? <div className="flex justify-end gap-2">{attributeActions}</div> : null}
          <MBeanAttributes objectName={info.objectName} attributes={attributes} canWrite={canWrite} onWrite={onWriteAttribute} />
        </div>
      ),
    },
    {
      id: "operations",
      label: "Operations",
      count: info.operations.length,
      content: <MBeanOperations objectName={info.objectName} operations={info.operations} canInvoke={canWrite} onInvoke={onInvoke} />,
    },
    {
      id: "notifications",
      label: "Notifications",
      count: info.notifications.length,
      content: <Notifications info={info} footer={notificationsFooter} />,
    },
    ...extraTabs,
  ];
  const active = tabs.find((tab) => tab.id === view) ?? tabs[0]!;

  return (
    <div className="min-w-0 space-y-3">
      <header>
        <h2 className="break-all font-mono text-sm font-semibold">{info.objectName}</h2>
        <p className="mt-1 break-all font-mono text-xs text-muted-foreground">{info.className}</p>
        {info.description && info.description !== info.className ? <p className="mt-2 text-sm">{info.description}</p> : null}
      </header>
      {toolbar}
      <Tabs
        tabs={tabs.map(({ id, label, count }) => ({ id, label, ...(count === undefined ? {} : { count }) }))}
        value={active.id}
        onChange={onViewChange}
      />
      <div role="tabpanel" aria-label={typeof active.label === "string" ? active.label : active.id}>
        {active.content}
      </div>
    </div>
  );
}
