import type { ProcessDescriptor, ProcessSampleFacet, ProcessSampleRow } from "./types";

type FacetSpec = {
  label: string;
  countKey: "openFiles" | "sockets" | "ports" | "connections";
  listKey: "openFileList" | "socketList" | "portList" | "connectionList";
  empty: string;
};

/** The facets of `process_samples` in tab order, with the record fields that carry each one. */
export const SAMPLE_FACETS: Record<ProcessSampleFacet, FacetSpec> = {
  openFiles: { label: "Open files", countKey: "openFiles", listKey: "openFileList", empty: "No open files" },
  sockets: { label: "Sockets", countKey: "sockets", listKey: "socketList", empty: "No open sockets" },
  ports: { label: "Ports", countKey: "ports", listKey: "portList", empty: "Not listening on any port" },
  connections: {
    label: "Connections",
    countKey: "connections",
    listKey: "connectionList",
    empty: "No network connections",
  },
};

export const SAMPLE_FACET_ORDER: ProcessSampleFacet[] = ["openFiles", "sockets", "ports", "connections"];

const inTickOrder = (samples: ProcessSampleRow[], key: string) =>
  samples.filter((sample) => sample.key === key).sort((a, b) => a.tick - b.tick);

/**
 * The facets the session armed: those whose count some sample carries. A sample
 * carries a facet's count on every tick once it is armed and never otherwise, so
 * this is a property of the session, not of one process.
 */
export function armedFacets(samples: ProcessSampleRow[]): ProcessSampleFacet[] {
  return SAMPLE_FACET_ORDER.filter((facet) => samples.some((sample) => sample[SAMPLE_FACETS[facet].countKey] !== undefined));
}

/** One process's count of a facet over its samples, in tick order. */
export function facetCountSeries(samples: ProcessSampleRow[], key: string, facet: ProcessSampleFacet): number[] {
  const { countKey } = SAMPLE_FACETS[facet];
  return inTickOrder(samples, key).flatMap((sample) => (sample[countKey] === undefined ? [] : [sample[countKey]]));
}

export type FacetReading = {
  rows: ProcessDescriptor[];
  /** When this list was stored: the first tick it held, not the last tick it was still true. */
  readAt: string;
};

/**
 * The latest stored list of a facet for one process. Lists are stored only when
 * they change, so this is the list on the latest sample that carries one. An
 * empty list is never stored, so a sample whose count is 0 with no list ends a
 * non-empty reading with an empty one. Undefined when nothing was stored and no
 * count says the list is empty.
 */
export function latestFacetReading(
  samples: ProcessSampleRow[],
  key: string,
  facet: ProcessSampleFacet,
): FacetReading | undefined {
  const { countKey, listKey } = SAMPLE_FACETS[facet];
  let reading: FacetReading | undefined;
  for (const sample of inTickOrder(samples, key)) {
    const list = sample[listKey];
    if (list) reading = { rows: list, readAt: sample.sampledAt };
    else if (sample[countKey] === 0 && (!reading || reading.rows.length > 0)) {
      reading = { rows: [], readAt: sample.sampledAt };
    }
  }
  return reading;
}

/** One process's cumulative disk read and write bytes over the samples that carry them, in tick order. */
export function diskSeries(samples: ProcessSampleRow[], key: string): { read: number[]; write: number[] } {
  const own = inTickOrder(samples, key);
  return {
    read: own.flatMap((sample) => (sample.diskReadBytes === undefined ? [] : [sample.diskReadBytes])),
    write: own.flatMap((sample) => (sample.diskWriteBytes === undefined ? [] : [sample.diskWriteBytes])),
  };
}
