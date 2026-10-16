import { DataTable, type DataTableColumnInput } from "../DataTable";
import { SAMPLE_FACETS, type FacetReading } from "./process-facets";
import { formatProcessTimestamp } from "./process-tree";
import type { ProcessDescriptor, ProcessEnv, ProcessSampleFacet } from "./types";

type EnvRow = { name: string; value: string };

const addressColumns: Array<DataTableColumnInput<ProcessDescriptor>> = [
  { key: "fd", label: "FD", sortable: true },
  {
    key: "protocol",
    label: "Protocol",
    sortable: true,
    filterable: true,
    accessor: (descriptor) => descriptor.protocol || descriptor.type,
  },
  { key: "state", label: "State", sortable: true, filterable: true },
  {
    key: "localAddr",
    label: "Local",
    sortable: true,
    grow: true,
    accessor: (descriptor) => descriptor.localAddr || descriptor.name,
  },
  { key: "remoteAddr", label: "Remote", sortable: true },
];

const descriptorColumns: Record<ProcessSampleFacet, Array<DataTableColumnInput<ProcessDescriptor>>> = {
  openFiles: [
    { key: "fd", label: "FD", sortable: true },
    { key: "type", label: "Type", sortable: true, filterable: true },
    { key: "name", label: "Path", sortable: true, grow: true },
  ],
  sockets: addressColumns,
  connections: addressColumns,
  ports: [
    { key: "port", label: "Port", sortable: true },
    { key: "protocol", label: "Protocol", sortable: true, filterable: true },
    { key: "localAddr", label: "Address", sortable: true, grow: true },
    { key: "fd", label: "FD", sortable: true },
  ],
};

const envColumns: Array<DataTableColumnInput<EnvRow>> = [
  { key: "name", label: "Name", sortable: true },
  { key: "value", label: "Value", grow: true },
];

const tableChrome = { autoFilter: true, showThemeControl: false, showFullscreenControl: false } as const;

export type ProcessFacetTableProps =
  | {
      facet: "env";
      /** The environment recorded on the process's `process_tree` node. */
      environment?: ProcessEnv;
      /** Why the environment could not be read. */
      error?: string;
    }
  | {
      facet: ProcessSampleFacet;
      /** The latest stored list of the facet; undefined when none was stored for this process. */
      reading: FacetReading | undefined;
    };

/**
 * One facet of a process as a trace stored it, in a filterable table: its
 * environment (recorded once on its `process_tree` node) or the latest list of
 * its open files, sockets, listening ports or connections from `process_samples`,
 * with the time that list was read. Presentational: nothing is fetched.
 */
export function ProcessFacetTable(props: ProcessFacetTableProps) {
  if (props.facet === "env") {
    const rows: EnvRow[] = Object.entries(props.environment ?? {})
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => a.name.localeCompare(b.name));
    return (
      <div className="space-y-2" data-process-facet="env">
        {props.error && (
          <div className="whitespace-pre-wrap text-xs text-red-700 dark:text-red-400" role="alert">
            {props.error}
          </div>
        )}
        {props.environment && (
          <DataTable<EnvRow>
            data={rows}
            columns={envColumns}
            getRowId={(row) => row.name}
            emptyMessage="The process has no environment variables"
            {...tableChrome}
          />
        )}
      </div>
    );
  }

  const { reading, facet } = props;
  return (
    <div className="space-y-2" data-process-facet={facet}>
      <div className="text-xs text-muted-foreground">
        {reading ? `Read at ${formatProcessTimestamp(reading.readAt)}` : "No reading stored for this process yet"}
      </div>
      {reading && (
        <DataTable<ProcessDescriptor>
          data={reading.rows}
          columns={descriptorColumns[facet]}
          getRowId={(row, index) => `${row.fd}:${index}`}
          emptyMessage={SAMPLE_FACETS[facet].empty}
          {...tableChrome}
        />
      )}
    </div>
  );
}
