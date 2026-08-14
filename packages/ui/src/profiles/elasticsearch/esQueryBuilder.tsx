/**
 * The query builder panel and the form extension that mounts it. The panel is
 * pure: it takes a specification and the vocabulary the schema described, and
 * reports edits. Everything that needs a connection — field mappings and the
 * compiled preview — is wired by the host that has one.
 */

import { Combobox } from "../../components/Combobox";
import type { JsonSchemaProperty } from "../../components/json-schema-form-types";
import {
  browserBaseUrl,
  savedConnectionID,
  useInspection
} from "../connections/connectionBrowserModel";
import {
  conditionAt,
  emptyGroup,
  insertAt,
  removeAt,
  updateAt,
  type EsSearch,
  type EsTimeFieldFormat,
} from "./esQueryBuilderModel";
import {
  makeFieldValueLookup,
  valueLookupField,
  type FieldValuesSource
} from "./esFieldValues";
import { EsQueryClauseGroup } from "./esQueryClauseGroup";
import type {
  EsQueryContext,
  EsQueryTreeActions
} from "./esQueryConditionRow";
import {
  esBuilderVocabulary,
  type EsBuilderVocabulary,
  type EsFieldMapping
} from "./esQueryOperators";
import { EsQueryOutputEditor } from "./esQueryOutputEditor";
import {
  EsQueryPreview
  } from "./esQueryPreview";
import { EsQuerySortEditor } from "./esQuerySortEditor";
import type { ProfileDraft } from "../editor/profileBuilderWorkspace";
import type { ParamDraft } from "../wizard/profileWizardModel";
import {
  bindParamOperand,
  reconcileSearchParamMappings,
  removeParamMapping,
  type ParamMappingEdit
} from "./esParamMappingModel";
import {
  defaultParamValues,
  esQueryFields,
  paramRoles,
  selectTimeField,
  timeFieldFormatRequired,
  timeFieldMappings,
} from "./esQueryBuilderForm";
import { useCompiledSearch, type EsCompilation } from "./esQueryCompile";

export type EsQueryBuilderProps = {
  search: EsSearch;
  onChange: (search: EsSearch) => void;
  fields: EsFieldMapping[];
  vocabulary: EsBuilderVocabulary;
  /** Declared profile parameters an operand can bind to. */
  params?: ParamDraft[];
  onMappingChange?: (edit: ParamMappingEdit) => void;
  /** Where a field's own values come from; absent without a connection. */
  values?: FieldValuesSource;
  compilation?: EsCompilation;
  className?: string;
};

export function EsQueryBuilder({
  search,
  onChange,
  fields,
  vocabulary,
  params = [],
  onMappingChange,
  values,
  compilation,
  className
}: EsQueryBuilderProps) {
  const root = search.query ?? emptyGroup();
  const requiresTimeFieldFormat = timeFieldFormatRequired(
    fields,
    search.timeField,
  );
  const mappingFieldsChanged = (edit: ParamMappingEdit) =>
    edit.params.some((param, index) => param.field !== params[index]?.field);
  const commitMappingEdit = (edit: ParamMappingEdit) => {
    if (onMappingChange) {
      onMappingChange(edit);
      return;
    }
    if (mappingFieldsChanged(edit)) {
      throw new Error(
        "list parameter mappings require an atomic mapping change handler",
      );
    }
    onChange(edit.search);
  };
  const commitSearchEdit = (nextSearch: EsSearch) => {
    const edit = reconcileSearchParamMappings({
      previousSearch: search,
      nextSearch,
      params
    });
    if (mappingFieldsChanged(edit)) {
      commitMappingEdit(edit);
      return;
    }
    onChange(nextSearch);
  };
  const context: EsQueryContext = {
    fields,
    vocabulary,
    params,
    // The builder owns the tree, so it — not the host — decides what a lookup is
    // scoped by: the query without the row being edited. Leaving that row in
    // would filter the suggestions by the half-typed value they are meant to
    // complete.
    ...(values
      ? {
          values: ({ path, field }) => {
            const target = valueLookupField(fields, field);
            if (!target) return undefined;
            return values({ field: target, search: { ...search, query: removeAt(root, path) } });
          }
        }
      : {})
  };
  const actions: EsQueryTreeActions = {
    update: (path, update) =>
      commitSearchEdit({ ...search, query: updateAt(root, path, update) }),
    insert: (groupPath, condition) =>
      commitSearchEdit({
        ...search,
        query: insertAt(
          root,
          groupPath,
          conditionAt(root, groupPath)?.conditions?.length ?? 0,
          condition,
        )
      }),
    remove: (path) =>
      commitSearchEdit({ ...search, query: removeAt(root, path) }),
    mapParam: (path, operand, name) => {
      const edit = bindParamOperand({ search, params, path, operand, name });
      commitMappingEdit(edit);
    },
    unmapParam: (path, name) => {
      const edit = removeParamMapping({ search, params, name, path });
      commitMappingEdit(edit);
    }
  };

  return (
    <div className={className ?? "flex min-w-0 flex-col gap-3"}>
      <EsQueryClauseGroup
        condition={root}
        path={[]}
        context={context}
        actions={actions}
        root
      />
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground">Time field</span>
        <Combobox
          ariaLabel="Time field"
          className="min-w-48"
          value={search.timeField ?? ""}
          onChange={(next) => onChange(selectTimeField(search, fields, next))}
          options={timeFieldMappings(fields).map((field) => ({
            value: field.name,
            label: field.name,
          }))}
          placeholder="Timestamp field…"
          allowCustomValue
        />
        {requiresTimeFieldFormat ? (
          <>
            <span className="text-xs text-muted-foreground">Epoch unit</span>
            <Combobox
              ariaLabel="Time field format"
              ariaRequired
              required
              invalid={!search.timeFieldFormat}
              className="min-w-40"
              value={search.timeFieldFormat ?? ""}
              onChange={(next) =>
                onChange({
                  ...search,
                  timeFieldFormat: (next || undefined) as
                    | EsTimeFieldFormat
                    | undefined,
                })
              }
              options={(vocabulary.timeFieldFormats ?? []).map((format) => ({
                value: format,
                label: timeFieldFormatLabel(format),
              }))}
              placeholder="Select epoch unit…"
              allowCustomValue={false}
            />
          </>
        ) : null}
        <span className="text-xs text-muted-foreground">
          Where time-from and time-to parameters apply
        </span>
      </div>
      <EsQuerySortEditor
        sort={search.sort ?? []}
        fields={fields}
        orders={vocabulary.sortOrders}
        onChange={(sort) => onChange({ ...search, sort: sort.length ? sort : undefined })}
      />
      <EsQueryOutputEditor
        search={search}
        onChange={(patch) => onChange({ ...search, ...patch })}
      />
      {compilation ? <EsQueryPreview compilation={compilation} /> : null}
    </div>
  );
}

/**
 * The builder as the profile form mounts it. The form knows the connection and
 * the index, so the field mappings and the compiled preview come from the same
 * browser endpoints the connection browser uses.
 */
export function EsQueryBuilderField({
  search,
  onChange,
  schema,
  rootValue,
  onRootChange
}: {
  search: EsSearch;
  onChange: (next: unknown) => void;
  schema: JsonSchemaProperty;
  rootValue: ProfileDraft;
  onRootChange?: ((next: Record<string, unknown>) => void) | undefined;
}) {
  const connectionID = savedConnectionID(rootValue.provider?.connection);
  const baseUrl = connectionID ? browserBaseUrl(connectionID) : "";
  const target = String(rootValue.provider?.options?.index ?? "");
  const inspection = useInspection({
    cacheKey: "es-query-builder",
    id: connectionID ?? "",
    baseUrl,
    enabled: baseUrl !== "",
    database: "",
    target
  });
  const roles = paramRoles(rootValue.params);
  const params = defaultParamValues(rootValue.params);
  const compilation = useCompiledSearch({
    baseUrl,
    index: target,
    search,
    params,
    roles,
    enabled: baseUrl !== ""
  });
  const values = makeFieldValueLookup({ baseUrl, index: target, params, roles });

  return (
    <EsQueryBuilder
      search={search}
      onChange={(next) => onChange(next)}
      fields={esQueryFields(inspection.completion)}
      vocabulary={esBuilderVocabulary({ properties: { search: schema } })}
      params={rootValue.params ?? []}
      onMappingChange={(edit) => {
        if (!onRootChange) {
          throw new Error(
            "query parameter mappings require an atomic root form update",
          );
        }
        onRootChange({
          ...rootValue,
          params: edit.params,
          provider: {
            ...rootValue.provider,
            options: {
              ...rootValue.provider?.options,
              search: edit.search
            }
          }
        });
      }}
      {...(values ? { values } : {})}
      compilation={compilation}
    />
  );
}

function timeFieldFormatLabel(format: EsTimeFieldFormat): string {
  switch (format) {
    case "epoch_second":
      return "Seconds";
    case "epoch_millis":
      return "Milliseconds";
    case "epoch_micros":
      return "Microseconds";
    case "epoch_nanos":
      return "Nanoseconds";
  }
}
