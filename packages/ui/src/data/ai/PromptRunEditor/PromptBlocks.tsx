import { useMemo, type ReactNode } from "react";
import type { JsonSchemaObject } from "../../../components/json-schema-form-types";
import { AttachmentButton, AttachmentList } from "../../chat/Attachment";
import {
  createAttachmentUploadAdapter,
  type AttachmentFilePart,
  type AttachmentLimits,
  type AttachmentUploadAdapter,
} from "../../chat/attachment-upload";
import type { ChatModel, FileUIPart } from "../../chat/types";
import { runtimeModelForValue } from "../../runtime/RuntimeBar.model";
import { withPrompt } from "../SpecRuntimeEditor/update";
import type { AIPromptRunValue } from "./model";
import { VariablesField } from "./VariablesField";

export type PromptBlocksProps = {
  value: AIPromptRunValue;
  onChange: (value: AIPromptRunValue) => void;
  models: ChatModel[];
  variablesSchema?: JsonSchemaObject | undefined;
  onVariablesValidityChange?: ((valid: boolean) => void) | undefined;
  promptEditor?: ReactNode | undefined;
  promptLabel: string;
  promptPlaceholder: string;
  enableAttachments: boolean;
  attachmentUpload?: AttachmentUploadAdapter | undefined;
  attachmentLimits?: AttachmentLimits | undefined;
};

// The Variables and user-prompt blocks of the run composer; hosts render them
// inline under the runtime block or as the leading tab of the spec tabs.
export function PromptBlocks({
  value,
  onChange,
  models,
  variablesSchema,
  onVariablesValidityChange,
  promptEditor,
  promptLabel,
  promptPlaceholder,
  enableAttachments,
  attachmentUpload,
  attachmentLimits,
}: PromptBlocksProps) {
  const spec = value.spec ?? {};
  const selectedModel = runtimeModelForValue(models, spec);
  const resolvedAttachmentUpload = useMemo(
    () => attachmentUpload ?? createAttachmentUploadAdapter(),
    [attachmentUpload],
  );
  const attachmentFiles: FileUIPart[] = (spec.prompt?.attachments ?? []).map(
    (attachment) => ({
      type: "file",
      url: attachment.id
        ? `/api/attachments/${attachment.id}`
        : (attachment.url ?? ""),
      mediaType: attachment.mediaType ?? "application/octet-stream",
      ...(attachment.id ? { attachmentId: attachment.id } : {}),
      ...(attachment.size != null ? { size: attachment.size } : {}),
      ...(attachment.filename ? { filename: attachment.filename } : {}),
      ...(!attachment.filename && attachment.path
        ? { filename: attachment.path }
        : {}),
    }),
  ) as FileUIPart[];

  return (
    <>
      <Block title="Variables">
        <VariablesField
          {...(variablesSchema ? { schema: variablesSchema } : {})}
          value={value.variables ?? {}}
          onChange={(variables) => onChange({ ...value, variables })}
          {...(onVariablesValidityChange
            ? { onValidityChange: onVariablesValidityChange }
            : {})}
        />
      </Block>

      <Block title={promptLabel}>
        {promptEditor ?? (
          <textarea
            value={spec.prompt?.user ?? ""}
            onChange={(event) =>
              onChange({
                ...value,
                spec: withPrompt(spec, { user: event.target.value }),
              })
            }
            spellCheck={false}
            placeholder={promptPlaceholder}
            aria-label={promptLabel}
            className="min-h-[7rem] w-full resize-y rounded-md border border-border bg-background px-density-2 py-density-1 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        )}
        {enableAttachments && (
          <div className="space-y-density-2">
            <AttachmentList
              files={attachmentFiles}
              onRemove={(index) =>
                onChange({
                  ...value,
                  spec: withPrompt(spec, {
                    attachments: (spec.prompt?.attachments ?? []).filter(
                      (_, itemIndex) => itemIndex !== index,
                    ),
                  }),
                })
              }
            />
            <AttachmentButton
              files={attachmentFiles}
              upload={resolvedAttachmentUpload}
              onAdd={(parts) =>
                onChange({
                  ...value,
                  spec: withPrompt(spec, {
                    attachments: [
                      ...(spec.prompt?.attachments ?? []),
                      ...parts.map((part) => {
                        const uploaded = part as AttachmentFilePart;
                        return {
                          id: uploaded.attachmentId,
                          mediaType: uploaded.mediaType,
                          size: uploaded.size,
                          ...(uploaded.filename
                            ? { filename: uploaded.filename }
                            : {}),
                        };
                      }),
                    ],
                  }),
                })
              }
              {...(selectedModel?.inputMediaTypes
                ? { acceptedMediaTypes: selectedModel.inputMediaTypes }
                : {})}
              {...(attachmentLimits ? { limits: attachmentLimits } : {})}
            />
          </div>
        )}
      </Block>
    </>
  );
}

export function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-density-2">
      <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </div>
      {children}
    </section>
  );
}
