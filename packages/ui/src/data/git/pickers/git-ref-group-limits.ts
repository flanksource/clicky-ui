/** The newest branches and tags a ref picker lists before "Show more"; a search reaches every ref. */
export const GIT_REF_GROUP_LIMITS = [
  { group: "Branches", limit: 50, plural: "branches" },
  { group: "Tags", limit: 10, plural: "tags" },
] as const;
