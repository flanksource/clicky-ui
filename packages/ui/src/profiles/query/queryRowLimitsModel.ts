/**
 * The four row caps, edited beside the filters they bound rather than buried in
 * the generic options form. They answer different questions and so get a field
 * each: Limit is how many rows the query asks the source for (a provider
 * option), while the page a caller gets by default, the largest page it may ask
 * for and where an export stops belong to the profile. A cap the profile leaves
 * empty shows the inherited default as its placeholder.
 */

import type {
  ProfileRowLimits
} from "../connections/connectionBrowserModel";

/**
 * applyRowLimit writes one cap. An emptied field removes the key rather than
 * storing a zero, so the profile visibly falls back to the default instead of
 * declaring a cap that returns nothing — and clearing the last one leaves no
 * block at all, which is what "this profile caps nothing" looks like.
 */
export function applyRowLimit(
  limits: ProfileRowLimits | undefined,
  key: keyof ProfileRowLimits,
  text: string,
): ProfileRowLimits | undefined {
  const next = { ...limits };
  if (text.trim() === "") delete next[key];
  else next[key] = Number(text);
  return Object.keys(next).length > 0 ? next : undefined;
}
