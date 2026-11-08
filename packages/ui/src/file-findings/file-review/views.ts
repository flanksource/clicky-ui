export const BUILTIN_FILE_REVIEW_VIEWS = ["preview", "source", "problems"] as const;
export type BuiltinFileReviewView = (typeof BUILTIN_FILE_REVIEW_VIEWS)[number];
/** A built-in tab, or the id of one of the host's `tabs`. */
export type FileReviewView = BuiltinFileReviewView | (string & {});

export function isBuiltinFileReviewView(view: string): view is BuiltinFileReviewView {
  return (BUILTIN_FILE_REVIEW_VIEWS as readonly string[]).includes(view);
}

/** A folder's built-in tab. */
export const FOLDER_PROBLEMS_VIEW = "problems";
