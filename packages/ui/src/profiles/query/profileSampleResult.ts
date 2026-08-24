import type { DataTableServerColumn } from "../../data/data-table-server-filters";
import type { QueryBrowserResult } from "../../data/query-browser/QueryBrowser.types";
import type { ProfileColumn } from "../wizard/profileWizardModel";

export type ProfileSampleResponse = Omit<QueryBrowserResult, "columns"> & {
  columns: ProfileColumn[];
  resultColumns?: DataTableServerColumn[];
  renderedQuery: string;
};

export function profileSampleQueryResult(
  response: ProfileSampleResponse,
): QueryBrowserResult {
  if (!Array.isArray(response.resultColumns)) {
    throw new Error("Profile sample response is missing resultColumns");
  }
  const result = {
    ...response,
    columns: response.resultColumns,
  } as QueryBrowserResult & {
    resultColumns?: DataTableServerColumn[];
    renderedQuery?: string;
  };
  delete result.resultColumns;
  delete result.renderedQuery;
  return result;
}

export function profileSampleFilterColumns(
  response: ProfileSampleResponse,
): ProfileColumn[] {
  if (!Array.isArray(response.resultColumns)) {
    throw new Error("Profile sample response is missing resultColumns");
  }
  const filterable = new Set(
    response.resultColumns
      .filter((column) => column.filterKey !== undefined)
      .map((column) => column.name),
  );
  return response.columns.filter((column) => filterable.has(column.name));
}
