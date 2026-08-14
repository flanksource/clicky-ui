import type { PostExtension } from "../../components/json-schema-form-types";
import type { ProcessorPreset, ProcessorSpec } from "./processorConfig";
import { ProcessorPipeline } from "./processorPipeline";

const PROCESSOR_PIPELINE_WIDGET = "processor-pipeline";

const processorPipelinePost: PostExtension = (field, nodes, ctx) => {
  if (field.schema["x-clicky-component"] !== PROCESSOR_PIPELINE_WIDGET)
    return nodes;
  const presets =
    (field.schema["x-clicky-presets"] as Record<string, ProcessorPreset>) ?? {};
  const steps = Array.isArray(field.value)
    ? (field.value as ProcessorSpec[])
    : [];
  return {
    label: nodes.label,
    value: (
      <ProcessorPipeline
        steps={steps}
        presets={presets}
        onChange={(next) => field.onChange(next)}
        profile={ctx?.rootValue}
      />
    ),
  };
};

export const processorPipelineFormExtensions = {
  post: [processorPipelinePost],
};
