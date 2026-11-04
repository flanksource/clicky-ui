export default [
  {
    "catalog": "facet",
    "type": "authorization",
    "id": "authorization/rbac-matrix",
    "label": "authorization/rbac-matrix",
    "description": "Roles × permissions; a column is everything one role grants.",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/authorization.tsx#AuthorizationModels"
    ],
    "section": "authorization-models"
  },
  {
    "catalog": "facet",
    "type": "authorization",
    "id": "authorization/rbac-assignment",
    "label": "authorization/rbac-assignment",
    "description": "Principal + role + scope; the grant inherits down the resource hierarchy.",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/authorization.tsx#AuthorizationModels"
    ],
    "section": "authorization-models"
  },
  {
    "catalog": "facet",
    "type": "authorization",
    "id": "authorization/abac-rule",
    "label": "authorization/abac-rule",
    "description": "One permit statement: who, what, on which resource, and the attribute conditions.",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/authorization.tsx#AuthorizationModels"
    ],
    "section": "authorization-models"
  },
  {
    "catalog": "facet",
    "type": "authorization",
    "id": "authorization/abac-table",
    "label": "authorization/abac-table",
    "description": "Attribute combinations resolve to an effect; first match wins, otherwise deny.",
    "references": [
      "apps/playground/src/vocabularies/facet/specimens/vocabulary/authorization.tsx#AuthorizationModels"
    ],
    "section": "authorization-models"
  }
];
