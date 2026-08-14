/**
 * What each wizard step asks the author to do.
 *
 * Kept apart from profileWizardSteps.tsx so that module exports only components
 * (react/only-export-components).
 */

export const stepHelp = {
  source: "Start with a saved connection. We will tailor the query workspace to its provider.",
  query: "Browse the catalog, write a query, and run a safe sample to discover fields.",
  fields: "Name the profile, choose the fields to expose, and tune how each field is displayed.",
  review: "Check the source, query, and field shape before creating the profile.",
};
