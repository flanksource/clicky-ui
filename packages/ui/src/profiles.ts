/**
 * Profile authoring: the editor, the wizard, and the query builder behind them.
 *
 * These components author a commons-db `query.Profile` — the shape shared by
 * trace profiles, view specs and ad-hoc reports — so every app that stores
 * profiles edits them through one UI instead of growing its own.
 *
 * Call configureProfiles({ schema, basePath }) once at startup: the schema is
 * generated from commons-db's Go types and served by the host, and basePath is
 * where that host mounts the profile service (default `/api/v1`).
 */
// profileEditorRaw is deliberately absent. ProfileEditor reaches it through
// React.lazy so Monaco stays out of the initial chunk; re-exporting it here
// would make every importer of this entry load Monaco eagerly, and Monaco is
// an optional peer dependency a consumer may not have installed at all.
// testSchema is a test fixture, not API.

export * from "./profiles/catalogTree";
export * from "./profiles/connectionBrowserModel";
export * from "./profiles/connectionQueryWorkspace";
export * from "./profiles/connectionQueryWorkspaceModel";
export * from "./profiles/esFieldValues";
export * from "./profiles/esParamMappingModel";
export * from "./profiles/esParamMappingPill";
export * from "./profiles/esParamOperandExtension";
export * from "./profiles/esQueryBuilder";
export * from "./profiles/esQueryBuilderExtension";
export * from "./profiles/esQueryBuilderForm";
export * from "./profiles/esQueryBuilderModel";
export * from "./profiles/esQueryClauseGroup";
export * from "./profiles/esQueryCompile";
export * from "./profiles/esQueryConditionRow";
export * from "./profiles/esQueryGroupModel";
export * from "./profiles/esQueryOccur";
export * from "./profiles/esQueryOperandEditors";
export * from "./profiles/esQueryOperandModel";
export * from "./profiles/esQueryOperators";
export * from "./profiles/esQueryOutputEditor";
export * from "./profiles/esQueryOutputModel";
export * from "./profiles/esQueryPreview";
export * from "./profiles/esQuerySortEditor";
export * from "./profiles/esQuerySortModel";
export * from "./profiles/esValueCombobox";
export * from "./profiles/jsonPathSample";
export * from "./profiles/jsonPathSampleRow";
export * from "./profiles/profileApi";
export * from "./profiles/profileBuilder";
export * from "./profiles/profileBuilderExtension";
export * from "./profiles/profileBuilderWorkspace";
export * from "./profiles/profileColumnModel";
export * from "./profiles/profileColumnPicker";
export * from "./profiles/profileEditor";
export * from "./profiles/profileEditorModel";
export * from "./profiles/profileEditorPreview";
export * from "./profiles/profileEditorRail";
export * from "./profiles/profileEditorRoutes";
export * from "./profiles/profileEditorSections";
export * from "./profiles/profileFieldEditor";
export * from "./profiles/profileFieldGrid";
export * from "./profiles/profileFieldManager";
export * from "./profiles/profileFieldState";
export * from "./profiles/profileFieldTypes";
export * from "./profiles/profileParamModel";
export * from "./profiles/profileWizard";
export * from "./profiles/profileWizardHelp";
export * from "./profiles/profileWizardModel";
export * from "./profiles/profileWizardQueryStep";
export * from "./profiles/profileWizardSteps";
export * from "./profiles/profileYaml";
export * from "./profiles/prometheusResults";
export * from "./profiles/queryRowLimits";
export * from "./profiles/queryRowLimitsModel";
export * from "./profiles/queryTargetPicker";
