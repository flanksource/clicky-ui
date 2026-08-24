import type { QueryBrowserRequest } from "../../data/query-browser/QueryBrowser.types";
import { sampleRequestProfile } from "./jsonPathSample";
import type {
  ProfileColumn,
  ProfileWizardDraft,
} from "../wizard/profileWizardModel";

export type ProfileSamplePayloadOptions = {
  draft: ProfileWizardDraft;
  request: QueryBrowserRequest;
  params?: Record<string, unknown>;
  filterColumns?: ProfileColumn[];
};

export function profileSamplePayload(options: ProfileSamplePayloadOptions) {
  const { draft, request } = options;
  const profile = sampleRequestProfile(draft);
  if (!profile) throw new Error("Cannot sample a profile without a provider");
  return {
    profile,
    params: options.params ?? {},
    ...(request.filters ? { filters: request.filters } : {}),
    ...(options.filterColumns
      ? { filterColumns: options.filterColumns }
      : {}),
    ...(request.pagination ? { pagination: request.pagination } : {}),
  };
}
