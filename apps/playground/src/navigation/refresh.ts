/**
 * Window events that make the sidebar tree re-fetch. Page filesystem actions dispatch
 * {@link NAVIGATION_REFRESH_EVENT}; repository changes keep their existing
 * `playground:documents-refresh`. Both are "hard": the tree may have changed shape, so every
 * loaded folder is dropped. Focus and `playground-feedback-updated` are "soft": only the root
 * is re-read and a folder re-fetches when its own activity changed.
 */
export const NAVIGATION_REFRESH_EVENT = "playground:navigation-refresh";
export const DOCUMENTS_REFRESH_EVENT = "playground:documents-refresh";
export const FEEDBACK_UPDATED_EVENT = "playground-feedback-updated";

/** A page's source was saved: activity changed but the tree kept its shape. */
export const ACTIVITY_REFRESH_EVENT = "playground:activity-refresh";

export const HARD_REFRESH_EVENTS = [NAVIGATION_REFRESH_EVENT, DOCUMENTS_REFRESH_EVENT] as const;
export const SOFT_REFRESH_EVENTS = ["focus", FEEDBACK_UPDATED_EVENT, ACTIVITY_REFRESH_EVENT] as const;

export function requestNavigationRefresh(): void {
  window.dispatchEvent(new Event(NAVIGATION_REFRESH_EVENT));
}

export function requestActivityRefresh(): void {
  window.dispatchEvent(new Event(ACTIVITY_REFRESH_EVENT));
}
