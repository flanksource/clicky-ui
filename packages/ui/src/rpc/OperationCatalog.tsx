import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useOperationPages } from "./useOperationPages";
import { filterOperationsByDomain } from "./classify";
import {
  filterOperationsBySurface,
  findSurfaceCollectionActions,
  findSurfaceDetailOperation,
  findSurfaceListOperation,
  getOperationClickyMeta,
} from "./clickyMetadata";
import type {
  ClickyCommandRuntime,
  ClickyDownloadOptions,
  ClickyRemoteFormat,
  ClickyRow,
  ClickyRowDetailRenderer,
  ClickyRowDetailTitle,
} from "../data/Clicky";
import type { ModalSize } from "../overlay/Modal";
import type { CellFilterChange } from "../data/cells/CellFilterActions";
import { EndpointList, type RenderLink } from "./EndpointList";
import { OperationCatalogActions } from "./OperationCatalogActions";
import { OperationsApiClientError } from "./apiClient";
import { renderOperationError } from "./operationErrorDiagnostics";
import {
  OperationResultView,
  type OperationResultFilterConfig,
  type ResultRenderer,
} from "./OperationResultView";
import { type FormActionsRenderer } from "./SchemaActionForm";
import {
  applyFilterExtensions,
  type FilterExtension,
} from "../components/filter-bar-utils";
import type {
  PreExtension,
  PostExtension,
} from "../components/json-schema-form-types";
import {
  type DomainDefinition,
  type OperationLookupResponse,
  type ResolvedOperation,
} from "./types";
import { useOperations, type OperationsApiClient } from "./useOperations";
import {
  dataTablePaginationFromForm,
  packLookupParameterValues,
  parametersToFormConfig,
  type ParameterFormOptions,
} from "./formMetadata";
import { cursorParameterName, useCursorStaleRecovery } from "./cursorStale";
import { useOperationFilterSearch } from "./operationFilterSearch";
import {
  parseMultiFilterValue,
  serializeMultiFilterValue,
} from "../data/data-table-filter-values";
import { Loading } from "../components/loading";
import { getClickyRowId } from "./rowNavigation";
import { useOperationCatalogFilterState } from "./operationCatalogFilterState";

export type OperationCatalogProps = {
  definition: DomainDefinition;
  entities: string[];
  client: OperationsApiClient;
  renderLink: RenderLink;
  // Override to return all operations (e.g. for an "API explorer" domain
  // that shouldn't be filtered by entity tags).
  allOperations?: boolean;
  surfaceKey?: string;
  // Domain-specific filter decorators (e.g. stamp an entity icon by filter
  // name). Composed in array order; mirrors JsonSchemaForm's `pre`.
  filterPre?: FilterExtension[];
  getCommandHref?: (operationId: string, op: ResolvedOperation) => string;
  renderError?: (err: unknown, title: string) => ReactNode;
  commandRuntime?: ClickyCommandRuntime;
  // Custom JsonSchemaForm field extensions forwarded to the create/edit form.
  formPre?: PreExtension[];
  formPost?: PostExtension[];
  // Optional extra footer actions for the create/edit form (e.g. a connection
  // "Test" button).
  formActions?: FormActionsRenderer;
  actionLabels?: Record<string, string>;
  // Optional host override for the result surface, keyed off the current surface.
  // Receives the default OperationResultView so non-overridden surfaces render
  // unchanged.
  resultRenderer?: ResultRenderer;
  /**
   * Portal target for the collection action bar (Create, bulk actions). When
   * set, the bar renders into this element — typically an app shell's
   * `bodyActions` slot — instead of inline under the catalog header.
   *
   * A portal rather than a render-prop because the bar owns its own dialog
   * state and closes over the catalog's live filters and list query; moving the
   * element would sever both. Falls back to inline rendering when null, so
   * existing consumers are unaffected.
   */
  actionsContainer?: Element | null;
  getRowDetailHref?: (id: string) => string | undefined;
  actionInitialValues?: Record<string, Record<string, string>>;
  /** Plural noun used by the cross-page selection notice. */
  selectionNoun?: string;
  /**
   * Parameter values pinned by the host — sent on every list request, every
   * filter lookup (both `client.lookupFilters` and per-filter type-ahead), and
   * every export/download URL. Never rendered as an editable filter chip or
   * form field, and never round-tripped through the URL: the host, not the
   * reader, owns them (e.g. the `stream` a trace-results panel is scoped to).
   */
  lockedValues?: Record<string, string>;
  /**
   * Controls whether list filters/pagination/sort read and write the URL.
   * Omit for today's behaviour: unprefixed query params. `false` neither
   * reads nor writes the URL — for a catalog embedded where the host owns the
   * whole URL. `{ prefix }` reads and writes only `<prefix>.<name>` keys, so
   * the catalog can live inside a host route with its own `?step=`/`?tab=`
   * params without colliding.
   */
  urlState?: false | { prefix: string };
  /**
   * Host row-detail configuration for the result table. `render` receives raw
   * row values keyed by column name, including columns hidden from `columns`
   * — see `ClickyRowDetailRenderer`. Never disturbs server paging, filters,
   * sort or export.
   */
  rowDetail?: {
    render: ClickyRowDetailRenderer;
    /** How the detail is surfaced when a row is clicked. Defaults to "row". */
    style?: "row" | "dialog";
    /** Dialog size when `style` is "dialog". Defaults to DataTable's "lg". */
    dialogSize?: ModalSize;
    /** Dialog title when `style` is "dialog", given the same raw row values as `render`. */
    title?: ClickyRowDetailTitle;
  };
};

const defaultCommandHref = (operationId: string) => `/commands/${operationId}`;
const EMPTY_LOCKED_VALUES: Record<string, string> = {};

export function OperationCatalog({
  definition,
  entities,
  client,
  renderLink,
  allOperations = false,
  surfaceKey,
  filterPre,
  getCommandHref = defaultCommandHref,
  renderError = renderOperationError,
  commandRuntime,
  formPre,
  formPost,
  formActions,
  actionLabels,
  resultRenderer,
  actionsContainer,
  getRowDetailHref,
  actionInitialValues,
  selectionNoun,
  lockedValues = EMPTY_LOCKED_VALUES,
  urlState,
  rowDetail,
}: OperationCatalogProps) {
  const renderRowDetail = rowDetail?.render;
  const rowDetailStyle = rowDetail?.style;
  const rowDetailDialogSize = rowDetail?.dialogSize;
  const rowDetailTitle = rowDetail?.title;
  const { operations, spec, isLoading } = useOperations(client);
  const filterShapes = spec?.components?.["x-clicky-filters"];

  const surfaceOps = useMemo(
    () => filterOperationsBySurface(operations, surfaceKey),
    [operations, surfaceKey]
  );
  const useSurfaceMetadata = surfaceOps.length > 0;

  const domainOps = useMemo(() => {
    if (useSurfaceMetadata) return surfaceOps;
    return allOperations
      ? operations
      : filterOperationsByDomain(operations, entities);
  }, [allOperations, entities, operations, surfaceOps, useSurfaceMetadata]);

  const listEndpoint = useMemo(() => {
    if (!useSurfaceMetadata) return undefined;
    return findSurfaceListOperation(domainOps, surfaceKey);
  }, [domainOps, surfaceKey, useSurfaceMetadata]);
  const detailOperation = useMemo(
    () =>
      useSurfaceMetadata
        ? findSurfaceDetailOperation(domainOps, surfaceKey)
        : undefined,
    [domainOps, surfaceKey, useSurfaceMetadata]
  );
  const listParameters = listEndpoint?.operation.parameters ?? [];
  const { filters, setFilters, effectiveFilters } =
    useOperationCatalogFilterState({ listParameters, lockedValues, urlState });
  const [selectedRowIds, setSelectedRowIds] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<ClickyRow[]>([]);
  const [selectedScopeId, setSelectedScopeId] = useState<string>();
  const membershipFilterParameterNames = useMemo(
    () =>
      listParameters
        .filter(
          (parameter) =>
            !["limit", "offset", "cursor", "sort", "order"].includes(
              parameter["x-clicky"]?.role ?? ""
            )
        )
        .map((parameter) => parameter.name),
    [listParameters]
  );
  const membershipFilterKey = useMemo(
    () =>
      JSON.stringify(
        membershipFilterParameterNames.map((name) => [
          name,
          filters[name] ?? "",
        ])
      ),
    [filters, membershipFilterParameterNames]
  );
  const previousMembershipFilterKey = useRef(membershipFilterKey);
  useEffect(() => {
    if (previousMembershipFilterKey.current !== membershipFilterKey) {
      setSelectedRowIds([]);
      setSelectedRows([]);
      setSelectedScopeId(undefined);
      previousMembershipFilterKey.current = membershipFilterKey;
    }
  }, [membershipFilterKey]);
  const lookupParameters = useMemo(
    () => packLookupParameterValues(effectiveFilters, listParameters),
    [effectiveFilters, listParameters]
  );
  const download = useMemo<ClickyDownloadOptions | undefined>(() => {
    const meta = listEndpoint?.operation["x-clicky"]?.export;
    if (!meta) return undefined;
    return {
      label: definition.title,
      ...(meta.formats
        ? { formats: meta.formats as ClickyRemoteFormat[] }
        : {}),
      ...(meta.scopes ? { scopes: meta.scopes } : {}),
      ...(meta.allRowsMode ? { allRowsMode: meta.allRowsMode } : {}),
      ...(meta.formatMaxRows
        ? {
            formatMaxRows: meta.formatMaxRows as Partial<
              Record<ClickyRemoteFormat, number>
            >,
          }
        : {}),
    };
  }, [definition.title, listEndpoint]);

  const list = useOperationPages({
    client,
    endpoint: listEndpoint,
    parameters: listParameters,
    filters: effectiveFilters,
  });

  useCursorStaleRecovery({
    error: list.error,
    parameters: listParameters,
    values: filters,
    setValues: setFilters,
  });

  const lookupQuery = useQuery<OperationLookupResponse>({
    queryKey: [
      "operation-lookup",
      listEndpoint?.method,
      listEndpoint?.path,
      lookupParameters,
    ],
    queryFn: async () =>
      (await client.lookupFilters?.(
        listEndpoint!.path,
        listEndpoint!.method,
        lookupParameters,
        { Accept: "application/json+clicky" }
      )) ?? { filters: {} },
    enabled: !!listEndpoint && !!client.lookupFilters,
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    retry: 0,
  });

  const actionOps = useMemo(
    () =>
      useSurfaceMetadata
        ? findSurfaceCollectionActions(domainOps, surfaceKey)
        : [],
    [domainOps, surfaceKey, useSurfaceMetadata]
  );
  const selectionActionOps = useMemo(
    () =>
      actionOps.filter(
        (operation) => getOperationClickyMeta(operation)?.supportsFilterMode
      ),
    [actionOps]
  );
  const collectionActionOps = useMemo(
    () =>
      actionOps.filter(
        (operation) => !getOperationClickyMeta(operation)?.supportsFilterMode
      ),
    [actionOps]
  );

  const lookupSearch = useOperationFilterSearch(
    client,
    listEndpoint,
    effectiveFilters,
    listParameters
  );

  const filterBarConfig = useMemo(() => {
    const options: ParameterFormOptions = {
      includeLocations: ["query"],
      lookupSearch,
      components: filterShapes,
      lockedValues,
      hideLocked: true,
    };
    if (lookupQuery.data != null) {
      options.lookup = lookupQuery.data;
    }
    return parametersToFormConfig(listParameters, filters, setFilters, options);
  }, [
    filters,
    filterShapes,
    listParameters,
    lockedValues,
    lookupQuery.data,
    lookupSearch,
  ]);
  const dataTablePagination = useMemo(
    () =>
      dataTablePaginationFromForm(filterBarConfig.pagination, list.response),
    [filterBarConfig.pagination, list.response]
  );
  const decoratedFilters = useMemo(
    () =>
      filterBarConfig.filters.map((filter) =>
        applyFilterExtensions(filter, filterPre)
      ),
    [filterBarConfig.filters, filterPre]
  );
  const cellFilters = useMemo(
    () =>
      Object.fromEntries(
        listParameters
          .filter((parameter) => parameter["x-clicky"]?.role === "filter")
          .map((parameter) => [
            parameter.name,
            parseMultiFilterValue(filters[parameter.name] ?? ""),
          ])
      ),
    [filters, listParameters]
  );
  const onCellFilterChange = useCallback(
    ({ key, value, mode }: CellFilterChange) => {
      if (
        !listParameters.some(
          (parameter) =>
            parameter.name === key && parameter["x-clicky"]?.role === "filter"
        )
      ) {
        throw new Error(
          `Clicky table column references unknown filter parameter ${key}`
        );
      }

      setFilters((current) => {
        const selected = parseMultiFilterValue(current[key] ?? "");
        if (mode === undefined) {
          delete selected[value];
        } else {
          selected[value] = mode;
        }

        const next = { ...current };
        const serialized = serializeMultiFilterValue(selected);
        if (serialized) {
          next[key] = serialized;
        } else {
          delete next[key];
        }

        const offset = listParameters.find(
          (parameter) => parameter["x-clicky"]?.role === "offset"
        );
        if (offset) next[offset.name] = "0";
        const cursor = cursorParameterName(listParameters);
        if (cursor) next[cursor] = "";
        return next;
      });
    },
    [listParameters]
  );
  const resultFilterConfig = useMemo<OperationResultFilterConfig>(
    () => ({
      filters: decoratedFilters,
      cellFilters,
      onCellFilterChange,
      ...(filterBarConfig.search ? { search: filterBarConfig.search } : {}),
      ...(filterBarConfig.timeRange
        ? { timeRange: filterBarConfig.timeRange }
        : {}),
    }),
    [
      cellFilters,
      decoratedFilters,
      filterBarConfig.search,
      filterBarConfig.timeRange,
      onCellFilterChange,
    ]
  );

  const showTable = !!listEndpoint;
  let listError: unknown;
  if (!list.isFetching) {
    if (list.isError) {
      listError = list.error;
    } else if (list.response?.success === false) {
      listError = new OperationsApiClientError(
        list.response.error ||
          list.response.message ||
          list.response.stderr ||
          `Command failed with exit code ${list.response.exit_code}`,
        {
          method: listEndpoint?.method,
          url: list.response.requestUrl,
          responseBody: list.response.stdout,
          responseData: list.response.parsed,
          responseHeaders: list.response.responseHeaders,
        }
      );
    }
  }
  const tableError =
    listError !== undefined
      ? renderError(listError, `Failed to load ${listEndpoint?.path ?? ""}`)
      : undefined;
  const tableResponse = list.response?.success === false ? null : list.response;
  const walkProps = list.infinite
    ? { pages: list.pages, infinite: list.infinite }
    : {};
  if (isLoading || (showTable && list.isPending && list.response == null)) {
    return (
      <Loading variant="centered" label={`Loading ${definition.title}…`} />
    );
  }

  return (
    <div
      className="flex h-full min-h-0 flex-col gap-2"
      data-slot="operation-catalog"
    >
      {/* No title/description here by design: page headers and breadcrumbs are
          the host's to define (e.g. an app shell's bodyHeader), so the catalog
          never invents chrome the consumer would have to fight or duplicate. */}
      <OperationCatalogActions
        actions={collectionActionOps}
        selectionActions={selectionActionOps}
        filters={filters}
        filterParameterNames={listParameters.map((parameter) => parameter.name)}
        membershipFilterParameterNames={membershipFilterParameterNames}
        selectedRowIds={selectedRowIds}
        selectedRows={selectedRows}
        {...(selectedScopeId && dataTablePagination?.total != null
          ? {
              selectedScope: {
                id: selectedScopeId,
                total: dataTablePagination.total,
              },
            }
          : {})}
        clearSelection={() => {
          setSelectedRowIds([]);
          setSelectedRows([]);
          setSelectedScopeId(undefined);
        }}
        onExecuted={() => list.refetch()}
        {...(actionsContainer ? { actionsContainer } : {})}
        {...(actionInitialValues
          ? { initialValuesByAction: actionInitialValues }
          : {})}
        {...(commandRuntime ? { commandRuntime } : {})}
        {...(formPre ? { formPre } : {})}
        {...(formPost ? { formPost } : {})}
        {...(formActions ? { formActions } : {})}
        {...(actionLabels ? { actionLabels } : {})}
        client={client}
      />

      {showTable ? (
        <div className="min-h-0 flex-1" data-slot="operation-catalog-results">
          {(() => {
            const defaultView = (
              <OperationResultView
                response={tableResponse}
                loading={list.isFetching}
                loadingMessage={`Loading ${definition.title} results…`}
                emptyMessage="No records returned"
                ariaLabel={`${definition.title} results`}
                className="mt-0 h-full min-h-0"
                detailOperation={detailOperation}
                {...(getRowDetailHref ? { getRowDetailHref } : {})}
                {...(selectionActionOps.length > 0
                  ? {
                      rowSelection: {
                        selectedRowIds,
                        onSelectionChange: (
                          ids: string[],
                          rows: ClickyRow[]
                        ) => {
                          setSelectedRowIds(ids);
                          setSelectedRows(rows);
                          setSelectedScopeId(undefined);
                        },
                        ...(dataTablePagination?.total != null &&
                        dataTablePagination.totalRelation === "eq"
                          ? {
                              selectAllPages: {
                                ...(selectedScopeId ? { selectedScopeId } : {}),
                                noun:
                                  selectionNoun ??
                                  definition.title.toLocaleLowerCase(),
                                scopes: [
                                  {
                                    id: "all-matching",
                                    total: dataTablePagination.total,
                                    onSelectAll: () =>
                                      setSelectedScopeId("all-matching"),
                                  },
                                ],
                              },
                            }
                          : {}),
                        getRowId: (row: ClickyRow) => {
                          const id = getClickyRowId(row);
                          if (!id) {
                            throw new Error(
                              "Clicky bulk action row is missing an _id or id cell"
                            );
                          }
                          return id;
                        },
                        isRowSelectable: (row: ClickyRow) =>
                          getClickyRowId(row) != null,
                      },
                    }
                  : {})}
                filterConfig={resultFilterConfig}
                {...(tableError ? { error: tableError } : {})}
                {...(commandRuntime ? { commandRuntime } : {})}
                {...(dataTablePagination
                  ? { pagination: dataTablePagination }
                  : {})}
                {...(filterBarConfig.sort
                  ? { sort: filterBarConfig.sort }
                  : {})}
                {...(download ? { download } : {})}
                {...(renderRowDetail ? { renderRowDetail } : {})}
                {...(rowDetailStyle ? { detailStyle: rowDetailStyle } : {})}
                {...(rowDetailDialogSize
                  ? { detailDialogSize: rowDetailDialogSize }
                  : {})}
                {...(rowDetailTitle ? { detailDialogTitle: rowDetailTitle } : {})}
                {...walkProps}
              />
            );
            return resultRenderer
              ? resultRenderer({
                  response: list.response,
                  loading: list.isFetching,
                  defaultView,
                  filterConfig: resultFilterConfig,
                  // A renderer that replaces the table owns the whole surface,
                  // pager and download menu included. Without these it can only
                  // drop them, which is how a replaced view silently loses the
                  // ability to reach page two — or, under a walk, page one's
                  // rows the moment page two arrives.
                  ...(dataTablePagination
                    ? { pagination: dataTablePagination }
                    : {}),
                  ...(filterBarConfig.sort
                    ? { sort: filterBarConfig.sort }
                    : {}),
                  ...(download ? { download } : {}),
                  ...(surfaceKey ? { surfaceKey } : {}),
                  ...(renderRowDetail ? { renderRowDetail } : {}),
                  ...(rowDetailStyle ? { detailStyle: rowDetailStyle } : {}),
                  ...(rowDetailDialogSize
                    ? { detailDialogSize: rowDetailDialogSize }
                    : {}),
                  ...(rowDetailTitle ? { detailDialogTitle: rowDetailTitle } : {}),
                  ...walkProps,
                })
              : defaultView;
          })()}
        </div>
      ) : (
        <EndpointList
          operations={domainOps}
          definition={definition}
          renderLink={renderLink}
          getCommandHref={getCommandHref}
        />
      )}
    </div>
  );
}
