import { fetchJSON } from "../connections/connectionBrowserModel";
import { sampleRequestProfile } from "../query/jsonPathSample";
import { profileApiPath } from "../profileApi";

export type ProcessorPreviewStage = {
  index: number;
  label: string;
  type: string;
  rowsIn: number;
  rowsOut: number;
  rows: Record<string, unknown>[];
};

export type ProcessorPreview = {
  input: Record<string, unknown>[];
  stages: ProcessorPreviewStage[];
};

export type ProcessorSampleResult = {
  rows: Record<string, unknown>[];
  processorPreview?: ProcessorPreview;
};

export function processorStageRows(
  stage: ProcessorPreviewStage | undefined,
): string {
  if (!stage) return "";
  return `${stage.rowsIn} → ${stage.rowsOut}`;
}

export function processorPreviewRequestProfile(
  profile: unknown,
): Record<string, unknown> | null {
  const request = sampleRequestProfile(profile);
  if (!request || !isRecord(profile)) return null;
  for (const key of PROCESSOR_PREVIEW_KEYS) {
    if (profile[key] !== undefined) request[key] = profile[key];
  }
  return request;
}

export async function previewProfileProcessors(
  profile: unknown,
  params: Record<string, unknown> = {},
): Promise<ProcessorSampleResult> {
  const request = processorPreviewRequestProfile(profile);
  if (!request) throw new Error("Cannot preview processors without a provider");
  const result = await fetchJSON<ProcessorSampleResult>(
    profileApiPath("profile/sample"),
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        profile: request,
        params,
        previewProcessors: true,
      }),
    },
  );
  if (!result.processorPreview) {
    throw new Error(
      "Processor preview response did not include processorPreview",
    );
  }
  return result;
}

const PROCESSOR_PREVIEW_KEYS = [
  "columns",
  "aliases",
  "ignore",
  "filters",
  "processors",
  "limits",
  "order",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
