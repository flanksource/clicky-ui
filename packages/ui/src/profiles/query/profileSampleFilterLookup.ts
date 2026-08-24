import type { QueryBrowserFilterLookupRequest } from "../../data/query-browser/QueryBrowser.types";
import type { DataTableFilterLookupResult } from "../../data/data-table-server-filters";
import { debugCaptureHeaders } from "../../data/debugConsoleSignal";
import { fetchJSON } from "../connections/connectionBrowserModel";
import { profileApiPath } from "../profileApi";
import type {
  ProfileColumn,
  ProfileWizardDraft,
} from "../wizard/profileWizardModel";
import { sampleRequestProfile } from "./jsonPathSample";

type ProfileSampleFilterLookupOptions = {
  draft: ProfileWizardDraft;
  params: Record<string, unknown>;
  filterColumns: ProfileColumn[];
  request: QueryBrowserFilterLookupRequest;
};

export async function lookupProfileSampleFilterValues(
  options: ProfileSampleFilterLookupOptions,
): Promise<DataTableFilterLookupResult> {
  const profile = sampleRequestProfile(options.draft);
  if (!profile) {
    throw new Error("Cannot look up profile filters without a provider");
  }
  const response = await fetchJSON<DataTableFilterLookupResult>(
    profileApiPath("profile/sample/filters/values"),
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...debugCaptureHeaders(),
      },
      body: JSON.stringify({
        profile,
        params: options.params,
        filters: options.request.filters,
        filterColumns: options.filterColumns,
        filterKey: options.request.filterKey,
        search: options.request.search,
        limit: options.request.limit,
      }),
    },
  );
  return { options: response.options };
}
