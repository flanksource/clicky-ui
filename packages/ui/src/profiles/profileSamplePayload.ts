import type { QueryBrowserRequest } from "../data/query-browser/QueryBrowser.types";
import { sampleRequestProfile } from "./jsonPathSample";
import type { ProfileWizardDraft } from "./profileWizardModel";

export function profileSamplePayload(
  draft: ProfileWizardDraft,
  request: QueryBrowserRequest,
) {
  const profile = sampleRequestProfile(draft);
  if (!profile) throw new Error("Cannot sample a profile without a provider");
  return {
    profile,
    params: {},
    ...(request.pagination ? { pagination: request.pagination } : {}),
    ...(request.debug ? { debug: true } : {}),
  };
}
