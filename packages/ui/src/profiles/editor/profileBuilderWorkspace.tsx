import { JsonSchemaForm } from "../../components/JsonSchemaForm";
import { Button } from "../../components/button";
import { debugCaptureHeaders } from "../../data/debugConsoleSignal";
import { Icon } from "../../data/Icon";
import { Modal } from "../../overlay/Modal";
import { UiCheck, UiColumns, UiSqlColumn } from "../../icons";
import { useQuery } from "@tanstack/react-query";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  browserBaseUrl,
  fetchJSON,
  mergeProviderOptions,
  type BrowserDescriptor,
  type ProfileRowLimits,
} from "../connections/connectionBrowserModel";
import { ConnectionQueryWorkspace } from "../connections/connectionQueryWorkspace";
import { useInspection } from "../connections/useInspection";
import { profileApiPath } from "../profileApi";
import type { EsSearch } from "../elasticsearch/esQueryBuilderModel";
import {
  ColumnPicker,
  type ProfileColumn,
} from "../fields/profileColumnPicker";
import {
  withProfileLimits,
  type ParamDraft,
  type ProfileProvider,
} from "../wizard/profileWizardModel";
import {
  defaultParamValues,
  paramRoles,
} from "../elasticsearch/esQueryBuilderForm";
import { mapTimestampColumn } from "../fields/profileColumnModel";
import { sampleParamSchema } from "./profileBuilderModel";
import { profileSamplePayload } from "../query/profileSamplePayload";
import { lookupProfileSampleFilterValues } from "../query/profileSampleFilterLookup";
import {
  profileSampleFilterColumns,
  profileSampleQueryResult,
  type ProfileSampleResponse,
} from "../query/profileSampleResult";

// Same story as ProfileColumn: one ProfileProvider, defined with the draft
// model. The copy here had drifted to carry `role`, which the canonical type's
// index signature already admits.
export type { ProfileProvider };

export type ProfileDraft = Record<string, unknown> & {
  profile?: string;
  query?: string;
  provider?: ProfileProvider;
  params?: ParamDraft[];
  columns?: ProfileColumn[];
  /** The row caps this profile sets for itself; unset ones take their default. */
  limits?: ProfileRowLimits;
};

// Modal's body is a flex child. It must be allowed to shrink and must not own
// scrolling, otherwise QueryBrowser's intrinsic minimum height expands the
// whole workspace and pushes the editor/results below the dialog viewport.
//
// These are utilities rather than a stylesheet on purpose: a library CSS asset
// only reaches a consumer that remembers to import it, whereas Tailwind scans
// this source and folds the rules into the dist/styles.css every consumer
// already loads.
export const profileBuilderModalClassName =
  "h-[calc(100dvh-2rem)] [&>[data-slot=modal-body]]:flex [&>[data-slot=modal-body]]:min-h-0 [&>[data-slot=modal-body]]:overflow-hidden [&>[data-slot=modal-body]>*]:flex-1 [&>[data-slot=modal-body]>*]:h-auto [&>[data-slot=modal-body]>*]:min-h-0";

export function ProfileBuilderWorkspace({
  connectionID,
  rootValue,
  onApply,
  onClose,
}: {
  connectionID: string;
  rootValue: ProfileDraft;
  onApply: (next: Record<string, unknown>) => void;
  onClose: () => void;
}) {
  const baseUrl = browserBaseUrl(connectionID);
  const descriptor = useQuery({
    queryKey: ["profile-builder-descriptor", connectionID],
    queryFn: () => fetchJSON<BrowserDescriptor>(baseUrl),
    retry: 0,
  });
  const initialProviderOptions = useMemo(
    () => ({ ...rootValue.provider?.options }),
    [rootValue.provider?.options],
  );
  const [query, setQuery] = useState(rootValue.query ?? "");
  const [search, setSearch] = useState<EsSearch | undefined>(
    () => initialProviderOptions.search as EsSearch | undefined,
  );
  const [params, setParams] = useState<ParamDraft[]>(
    () => rootValue.params ?? [],
  );
  const [liveOptions, setLiveOptions] = useState<Record<string, unknown>>(
    initialProviderOptions,
  );
  const [catalogOptions, setCatalogOptions] = useState<Record<string, unknown>>(
    {},
  );
  const [sampleParams, setSampleParams] = useState<Record<string, unknown>>(
    () => defaultParamValues(params),
  );
  const [sampleColumns, setSampleColumns] = useState<ProfileColumn[]>([]);
  const [selectedColumns, setSelectedColumns] = useState<Set<string>>(
    () => new Set(),
  );
  const [timestampColumn, setTimestampColumn] = useState(
    () =>
      rootValue.columns?.find((column) => column.kind === "timestamp")?.name ??
      "",
  );
  const [selectedDatabase, setSelectedDatabase] = useState("");
  const [limits, setLimits] = useState<ProfileRowLimits | undefined>(
    () => rootValue.limits,
  );
  const filterColumns = useRef<ProfileColumn[]>([]);

  useEffect(() => {
    if (!query && descriptor.data?.defaultQuery) {
      setQuery(descriptor.data.defaultQuery);
    }
  }, [descriptor.data?.defaultQuery, query]);

  const explicitTargetKind =
    liveOptions.targetKind ?? initialProviderOptions.targetKind;
  const targetOption =
    descriptor.data?.target?.kind === "index"
      ? descriptor.data.target.option
      : "";
  const inspection = useInspection({
    cacheKey: "profile-builder-inspection",
    id: connectionID,
    baseUrl,
    enabled: descriptor.data?.catalog === true,
    database: selectedDatabase,
    fallbackDatabase: String(initialProviderOptions.database ?? ""),
    target: targetOption
      ? String(
          liveOptions[targetOption] ??
            initialProviderOptions[targetOption] ??
            "",
        )
      : "",
    ...(typeof explicitTargetKind === "string"
      ? { targetKind: explicitTargetKind }
      : {}),
  });
  const browserOptions = useMemo(
    () =>
      mergeProviderOptions({
        layers: [
          descriptor.data?.initialOptions,
          initialProviderOptions,
          catalogOptions,
        ],
        database: inspection.sqlDatabase,
        keepTargetKind: true,
      }),
    [
      catalogOptions,
      descriptor.data?.initialOptions,
      initialProviderOptions,
      inspection.sqlDatabase,
    ],
  );
  // The specification is authored here, not merged from a layer, so it is
  // stamped on last — including its absence, which a lower layer would
  // otherwise reinstate after the author switched back to raw DSL.
  const effectiveOptions = useCallback(
    (options: Record<string, unknown>) => {
      const merged = mergeProviderOptions({
        layers: [initialProviderOptions, catalogOptions, options],
        database: inspection.sqlDatabase,
      });
      if (search) merged.search = search;
      else delete merged.search;
      return merged;
    },
    [catalogOptions, initialProviderOptions, inspection.sqlDatabase, search],
  );

  const paramSchema = useMemo(() => sampleParamSchema(params), [params]);
  const existingColumns = rootValue.columns ?? [];
  const existingNames = useMemo(
    () => new Set(existingColumns.map((column) => column.name)),
    [existingColumns],
  );

  const applyDraft = (mode: "query" | "merge" | "replace") => {
    const chosen = mapTimestampColumn(
      sampleColumns.filter((column) => selectedColumns.has(column.name)),
      timestampColumn,
    );
    let columns = existingColumns;
    if (mode === "merge") {
      columns = mapTimestampColumn(
        [
          ...existingColumns,
          ...chosen.filter((column) => !existingNames.has(column.name)),
        ],
        timestampColumn,
      );
    } else if (mode === "replace") {
      if (
        existingColumns.length > 0 &&
        !window.confirm(
          `Replace ${existingColumns.length} configured column${existingColumns.length === 1 ? "" : "s"}?`,
        )
      ) {
        return;
      }
      columns = chosen;
    }
    const next: ProfileDraft = withProfileLimits(
      {
        ...rootValue,
        query,
        params,
        provider: {
          ...rootValue.provider,
          options: effectiveOptions(liveOptions),
        },
        ...(mode === "query" ? {} : { columns }),
      },
      limits,
    );
    onApply(next);
    onClose();
  };

  const footer = (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Button type="button" variant="ghost" onClick={onClose}>
        Cancel
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={!query.trim() && !search}
        onClick={() => applyDraft("query")}
      >
        <Icon icon={UiCheck} className="size-4" />
        Use query
      </Button>
      <Button
        type="button"
        variant="outline"
        disabled={selectedColumns.size === 0}
        onClick={() => applyDraft("merge")}
      >
        <Icon icon={UiColumns} className="size-4" />
        Merge selected
      </Button>
      <Button
        type="button"
        disabled={selectedColumns.size === 0}
        onClick={() => applyDraft("replace")}
      >
        <Icon icon={UiSqlColumn} className="size-4" />
        Replace columns
      </Button>
    </div>
  );

  return (
    <Modal
      open
      onClose={onClose}
      title={`Build profile from ${connectionID}`}
      size="full"
      className={profileBuilderModalClassName}
      footer={footer}
    >
      <div className="flex h-full min-h-0 flex-col gap-3">
        {Object.keys(paramSchema.properties ?? {}).length > 0 ? (
          <div className="shrink-0 rounded-md border bg-card px-3 py-2">
            <div className="mb-2 text-xs font-medium text-muted-foreground">
              Temporary sample parameters (not saved)
            </div>
            <JsonSchemaForm
              schema={paramSchema}
              value={sampleParams}
              onChange={setSampleParams}
              size="sm"
              inline
              showPreferencesMenu={false}
              persistPreferences={false}
            />
          </div>
        ) : null}
        {descriptor.isLoading ? (
          <WorkspaceMessage>Loading connection browser…</WorkspaceMessage>
        ) : descriptor.isError ? (
          <WorkspaceMessage error>
            {errorMessage(
              descriptor.error,
              "Unable to load this connection browser",
            )}
          </WorkspaceMessage>
        ) : descriptor.data ? (
          <ConnectionQueryWorkspace
            id={`profile-builder:${connectionID}`}
            title="Profile query"
            descriptor={descriptor.data}
            inspection={inspection}
            onDatabaseChange={setSelectedDatabase}
            query={query}
            onQueryChange={setQuery}
            options={browserOptions}
            onOptionsChange={setLiveOptions}
            search={search}
            onSearchChange={(transition) => {
              setSearch(transition.search);
              setQuery(transition.query);
            }}
            {...(limits ? { limits } : {})}
            onLimitsChange={setLimits}
            params={params}
            onParamMappingChange={(edit) => {
              setSearch(edit.search);
              setParams(edit.params);
            }}
            paramValues={sampleParams}
            paramRoles={paramRoles(params)}
            compileBaseUrl={baseUrl}
            className="h-full min-h-0"
            onCatalogSelect={(node) => {
              if (node.query) setQuery(node.query);
              const nextOptions = node.options ?? {};
              setCatalogOptions(nextOptions);
              setLiveOptions({ ...browserOptions, ...nextOptions });
            }}
            lookupFilterValues={(request) =>
              lookupProfileSampleFilterValues({
                draft: {
                  ...rootValue,
                  params,
                  profile: rootValue.profile || "sample",
                  query: request.query,
                  provider: {
                    ...rootValue.provider,
                    options: effectiveOptions(request.options),
                  },
                },
                params: sampleParams,
                filterColumns: filterColumns.current,
                request,
              })
            }
            execute={async (request) => {
              const sampleDraft: ProfileDraft = {
                ...rootValue,
                params,
                profile: rootValue.profile || "sample",
                query: request.query,
                provider: {
                  ...rootValue.provider,
                  options: effectiveOptions(request.options),
                },
              };
              const result = await fetchJSON<ProfileSampleResponse>(
                profileApiPath("profile/sample"),
                {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    ...debugCaptureHeaders(),
                  },
                  body: JSON.stringify(
                    profileSamplePayload({
                      draft: sampleDraft,
                      request,
                      params: sampleParams,
                      filterColumns: filterColumns.current,
                    }),
                  ),
                },
              );
              filterColumns.current = profileSampleFilterColumns(result);
              setSampleColumns(result.columns ?? []);
              setSelectedColumns(
                new Set((result.columns ?? []).map((column) => column.name)),
              );
              return profileSampleQueryResult(result);
            }}
            renderResults={({ defaultView }) => (
              <div className="flex min-h-0 flex-1 flex-col gap-3">
                <div className="min-h-0 flex-1">{defaultView}</div>
                {sampleColumns.length > 0 ? (
                  <ColumnPicker
                    columns={sampleColumns}
                    selected={selectedColumns}
                    existing={existingNames}
                    onChange={setSelectedColumns}
                    timestampColumn={timestampColumn}
                    onTimestampColumnChange={setTimestampColumn}
                  />
                ) : null}
              </div>
            )}
          />
        ) : (
          <WorkspaceMessage>
            This saved connection does not expose a query browser.
          </WorkspaceMessage>
        )}
      </div>
    </Modal>
  );
}

function WorkspaceMessage({
  children,
  error = false,
}: {
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div
      className={`grid min-h-80 flex-1 place-items-center rounded-md border border-dashed p-6 text-sm ${error ? "border-destructive/40 text-destructive" : "text-muted-foreground"}`}
    >
      {children}
    </div>
  );
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message.trim()
    ? error.message.trim()
    : fallback;
}
