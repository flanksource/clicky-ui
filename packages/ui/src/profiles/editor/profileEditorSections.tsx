import { JsonSchemaForm } from "../../components/JsonSchemaForm";
import type {
  FormLayout,
  LookupFetcher,
  PostExtension,
  PreExtension,
} from "../../components/json-schema-form-types";
import { Icon } from "../../data/Icon";
import type { ReactNode } from "react";
import {
  mergeProfileProjection,
  providerConnectionSchema,
  profileSchemaProjection,
  providerOptionsSchema,
  providerTypes,
} from "./profileEditorModel";
import { profileFormExtensions } from "../profileApi";
import {
  ProfileWizardQueryStep,
  type ProfileSample,
} from "../wizard/profileWizardQueryStep";
import {
  profileConnectionID,
  type ProfileColumn,
  type ProfileWizardDraft,
} from "../wizard/profileWizardModel";

const inputClassName =
  "w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/15";

export function ProfileGeneralSection({ draft, onChange }: EditorSectionProps) {
  return (
    <SectionCard
      title="Profile identity"
      description="Name the profile and choose its default presentation. Renaming updates dependent imports when you save."
    >
      <div className="grid gap-5 md:grid-cols-2">
        <EditorField label="Profile name" required>
          <input
            value={draft.profile ?? ""}
            className={inputClassName}
            onChange={(event) =>
              onChange({ ...draft, profile: event.target.value })
            }
          />
        </EditorField>
        <EditorField label="Namespace">
          <input
            value={draft.namespace ?? ""}
            className={inputClassName}
            placeholder="Default namespace"
            onChange={(event) =>
              onChange({ ...draft, namespace: event.target.value })
            }
          />
        </EditorField>
        <EditorField label="Render mode">
          <select
            value={typeof draft.render === "string" ? draft.render : ""}
            className={inputClassName}
            onChange={(event) =>
              onChange({ ...draft, render: event.target.value || undefined })
            }
          >
            <option value="">Table (default)</option>
            <option value="table">Table</option>
            <option value="logs">Logs</option>
          </select>
        </EditorField>
        <EditorField label="Icon">
          <div className="flex items-center gap-2">
            <input
              value={typeof draft.icon === "string" ? draft.icon : ""}
              className={inputClassName}
              // Empty is the norm: the provider type already supplies a mark.
              // This is for the profile whose subject is not its backend.
              placeholder="Provider default"
              onChange={(event) =>
                onChange({ ...draft, icon: event.target.value || undefined })
              }
            />
            {typeof draft.icon === "string" && draft.icon !== "" ? (
              // Shows what the name actually resolves to — an unresolvable name
              // renders nothing anywhere, which is invisible without a preview.
              <Icon name={draft.icon} className="size-5 shrink-0" />
            ) : null}
          </div>
        </EditorField>
      </div>
    </SectionCard>
  );
}

export function ProfileSourceSection({
  draft,
  discovered,
  sampleStale,
  lookupFetcher,
  onChange,
  onSample,
}: EditorSectionProps & {
  discovered: ProfileColumn[];
  sampleStale: boolean;
  lookupFetcher?: LookupFetcher;
  onSample: (sample: ProfileSample) => void;
}) {
  const connectionID = profileConnectionID(draft.provider?.connection ?? "");
  const providerType = draft.provider?.type ?? "";
  return (
    <div className="grid h-full min-h-0 gap-4">
      <SectionCard
        title="Source"
        description="Select the provider and saved connection. Connection credentials remain server-side."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <EditorField label="Provider type" required>
            <select
              value={providerType}
              className={inputClassName}
              onChange={(event) =>
                onChange({
                  ...draft,
                  provider: { ...draft.provider, type: event.target.value },
                })
              }
            >
              <option value="">Choose a provider</option>
              {providerTypes().map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </EditorField>
          <JsonSchemaForm
            idPrefix="profile-source-connection"
            schema={providerConnectionSchema()}
            value={{
              connection: draft.provider?.connection ?? "",
              provider: draft.provider ?? {},
            }}
            onChange={(next) => {
              if (typeof next.connection !== "string") {
                throw new Error("provider.connection must be a string");
              }
              onChange({
                ...draft,
                provider: { ...draft.provider, connection: next.connection },
              });
            }}
            showPreferencesMenu={false}
            {...(lookupFetcher ? { lookupFetcher } : {})}
          />
        </div>
        {sampleStale ? (
          <p className="mt-4 rounded-lg border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-warning-foreground">
            Source or query settings changed after the latest sample. You can
            save, but sampling again will verify the current field shape.
          </p>
        ) : null}
      </SectionCard>
      {connectionID ? (
        <ProfileWizardQueryStep
          key={connectionID}
          connectionID={connectionID}
          draft={draft}
          discovered={discovered}
          onDraftChange={onChange}
          onSample={onSample}
        />
      ) : (
        <SectionCard
          title="Query and provider options"
          description="Inline sources use the provider schema for options while keeping the query workspace explicit."
        >
          <EditorField label="Query">
            <textarea
              rows={10}
              value={draft.query ?? ""}
              className={`${inputClassName} resize-y font-mono text-xs`}
              onChange={(event) =>
                onChange({ ...draft, query: event.target.value })
              }
            />
          </EditorField>
          <div className="mt-5">
            {/* The provider option schemas carry host widgets of their own —
                secret and workload-url selectors, the structured search builder —
                so this form needs the host's extensions as much as the sections
                built from the profile schema do. */}
            <JsonSchemaForm
              idPrefix="profile-provider-options"
              schema={providerOptionsSchema(providerType)}
              value={draft.provider?.options ?? {}}
              onChange={(options) =>
                onChange({
                  ...draft,
                  provider: { ...draft.provider, options },
                })
              }
              showPreferencesMenu={false}
              pre={profileFormExtensions().pre}
              post={profileFormExtensions().post}
            />
          </div>
        </SectionCard>
      )}
    </div>
  );
}

export function ProfileSchemaSection({
  draft,
  keys,
  title,
  description,
  idPrefix,
  layout,
  lookupFetcher,
  pre,
  post,
  onChange,
}: EditorSectionProps & {
  keys: string[];
  title: string;
  description: string;
  idPrefix: string;
  // Presentation is the call site's, not this component's — profile schema
  // sections can choose a dense layout or keep the plain stacked defaults.
  layout?: FormLayout;
  // JsonSchemaForm always installs its own lookup provider, so an outer one is
  // shadowed rather than inherited: without this, x-clicky-lookup fields (the
  // imports and reconcile.dest profile pickers) render with no options at all.
  lookupFetcher?: LookupFetcher;
  // Overrides the host's configured extensions for this section only. Passing an
  // empty array is meaningful — it renders the built-in controls — so these are
  // distinguished by being undefined, not by being empty.
  pre?: PreExtension[];
  post?: PostExtension[];
}) {
  const configured = profileFormExtensions();
  const fullRootPre = (pre ?? configured.pre).map<PreExtension>(
    (extension) => (field, context) =>
      extension(field, {
        ...context,
        rootValue: draft,
        onRootChange: onChange,
      }),
  );
  const fullRootPost = (post ?? configured.post).map<PostExtension>(
    (extension) => (field, nodes, context) =>
      extension(field, nodes, {
        ...context,
        rootValue: draft,
        onRootChange: onChange,
      }),
  );
  return (
    <SectionCard title={title} description={description}>
      <JsonSchemaForm
        idPrefix={idPrefix}
        schema={profileSchemaProjection(keys)}
        value={Object.fromEntries(
          keys.flatMap((key) =>
            Object.prototype.hasOwnProperty.call(draft, key)
              ? [[key, draft[key]]]
              : [],
          ),
        )}
        onChange={(next) => onChange(mergeProfileProjection(draft, keys, next))}
        showPreferencesMenu={false}
        pre={fullRootPre}
        post={fullRootPost}
        {...(layout ? { layout } : {})}
        {...(lookupFetcher ? { lookupFetcher } : {})}
      />
    </SectionCard>
  );
}

type EditorSectionProps = {
  draft: ProfileWizardDraft;
  onChange: (draft: ProfileWizardDraft) => void;
};

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mb-5 mt-1 text-sm text-muted-foreground">{description}</p>
      {children}
    </section>
  );
}

function EditorField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      <span>
        {label}
        {required ? <span className="text-destructive"> *</span> : null}
      </span>
      {children}
    </label>
  );
}
