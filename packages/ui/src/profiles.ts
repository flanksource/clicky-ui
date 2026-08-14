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

export * from "./profiles/profileApi";
export * from "./profiles/cel";
export * from "./profiles/connections";
export * from "./profiles/editor";
export * from "./profiles/elasticsearch";
export * from "./profiles/fields";
export * from "./profiles/processor";
export * from "./profiles/query";
export * from "./profiles/wizard";
