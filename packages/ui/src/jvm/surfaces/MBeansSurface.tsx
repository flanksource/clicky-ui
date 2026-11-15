import { useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "../../components/button";
import { Loading } from "../../components/loading";
import { Workspace, type WorkspacePaneSpec } from "../../layout/Workspace";
import { InlineError } from "../../rpc/InlineError";
import { UiRefresh } from "../../icons";
import { MBeanBrowser } from "../mbeans/MBeanBrowser";
import { MBeanDetailView, type MBeanDetailTab } from "../mbeans/MBeanDetailView";
import { mergeMBeanReadings } from "../model/mbean-readings";
import type { MBeanInfo } from "../protocol/types";
import { MutationGate } from "../safety/MutationGate";
import { mutationAllowed } from "../safety/mutation-allowed";
import { useJvm, useJvmStatus } from "./jvm-context";

/** URL-shaped selection the host persists (search params, router state, …). */
export type MBeansSurfaceState = { q?: string; mbean?: string; view?: string };

export type MBeansSurfaceProps = {
  state: MBeansSurfaceState;
  onStateChange: (next: MBeansSurfaceState) => void;
  /** JMX pattern listed in the browser; `""` lists every MBean. */
  pattern?: string;
  /** The host lets this operator change the JVM. Default true. */
  canMutate?: boolean;
  /** Ask the operator to opt in before writes. Default true. */
  requireConsent?: boolean;
  /** Host tabs for the selected MBean. */
  extraTabs?: (info: MBeanInfo) => MBeanDetailTab[];
  /** Tab opened when the state names none. Default "attributes". */
  defaultView?: (info: MBeanInfo) => string;
  notificationsFooter?: (info: MBeanInfo) => ReactNode;
  /** Host panes added beside the browser and detail, e.g. a notification stream. */
  extraPanes?: WorkspacePaneSpec[];
  storageKey?: string;
  className?: string;
};

function MBeanDetail({ objectName, ...props }: Omit<MBeansSurfaceProps, "pattern" | "extraPanes" | "storageKey" | "className"> & { objectName: string }) {
  const { client, keys } = useJvm();
  const queryClient = useQueryClient();
  const status = useJvmStatus();
  const [consent, setConsent] = useState(false);
  const info = useQuery({ queryKey: keys.mbean(objectName), queryFn: ({ signal }) => client.mbeanInfo(objectName, { signal }) });
  const values = useQuery({ queryKey: keys.mbeanValues(objectName), queryFn: ({ signal }) => client.readMBeanAttributes(objectName, { signal }) });
  const attributes = useMemo(() => (info.data ? mergeMBeanReadings(info.data, values.data) : []), [info.data, values.data]);

  if (info.isPending) return <Loading />;
  if (info.error) return <InlineError title="MBean read failed" error={info.error} />;
  const gate = {
    runtime: status.data?.allowMutation,
    permitted: props.canMutate ?? true,
    consent,
    requireConsent: props.requireConsent ?? true,
  };
  const refreshValues = () => queryClient.invalidateQueries({ queryKey: keys.mbeanValues(objectName) });

  return (
    <MBeanDetailView
      info={info.data}
      attributes={attributes}
      view={props.state.view ?? props.defaultView?.(info.data) ?? "attributes"}
      onViewChange={(view) => props.onStateChange({ ...props.state, view })}
      canWrite={mutationAllowed(gate)}
      onWriteAttribute={async (attribute, value) => {
        await client.writeMBeanAttribute({ objectName, attribute, value });
        await refreshValues();
      }}
      onInvoke={async (operation, args) => {
        const result = await client.invokeMBean({
          objectName,
          operation: operation.name,
          signature: operation.signature.map((parameter) => parameter.type),
          args,
        });
        await refreshValues();
        return result;
      }}
      toolbar={<MutationGate {...gate} label="Allow MBean changes" onConsentChange={setConsent} />}
      attributeActions={
        <>
          {values.error ? <InlineError title="Attribute values unavailable" error={values.error} /> : null}
          <Button size="sm" variant="outline" loading={values.isFetching} onClick={() => void refreshValues()}>
            <UiRefresh /> Refresh values
          </Button>
        </>
      }
      notificationsFooter={props.notificationsFooter?.(info.data)}
      extraTabs={props.extraTabs?.(info.data) ?? []}
    />
  );
}

/** Browse every MBean of the JVM in scope, read live attributes, write them and invoke operations. */
export function MBeansSurface({ pattern = "", extraPanes = [], storageKey, className, ...props }: MBeansSurfaceProps) {
  const { client, keys } = useJvm();
  const names = useQuery({ queryKey: keys.mbeans(pattern), queryFn: ({ signal }) => client.searchMBeans(pattern, { signal }), staleTime: 30_000 });
  const selected = props.state.mbean ?? "";
  const panes: WorkspacePaneSpec[] = [
    {
      id: "browser",
      label: "MBeans",
      location: "left",
      width: 340,
      minWidth: 240,
      contentClassName: "overflow-hidden p-2",
      content: (
        <MBeanBrowser
          names={names.data ?? []}
          loading={names.isPending}
          error={names.error ? <InlineError title="MBean search failed" error={names.error} /> : undefined}
          filter={props.state.q ?? ""}
          onFilterChange={(q) => props.onStateChange({ ...props.state, q })}
          selected={selected}
          onSelect={(mbean) => props.onStateChange({ q: props.state.q ?? "", mbean })}
        />
      ),
    },
    {
      id: "detail",
      label: selected || "MBean details",
      location: "center",
      collapsible: false,
      contentClassName: "overflow-auto p-3",
      content: selected ? (
        <MBeanDetail key={selected} objectName={selected} {...props} />
      ) : (
        <p className="text-sm text-muted-foreground">Select an MBean to inspect its metadata, live attributes and operations.</p>
      ),
    },
    ...extraPanes,
  ];
  return <Workspace panes={panes} {...(storageKey ? { storageKey } : {})} className={className ?? "h-full rounded border border-border"} />;
}
