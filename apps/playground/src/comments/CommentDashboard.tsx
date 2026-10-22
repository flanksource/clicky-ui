import {
  Button,
  DataTable,
  type DataTableColumn,
} from "@flanksource/clicky-ui";
import {
  externalPage,
  useExternalCatalog,
} from "../bookmarklet/external-catalog";
import { findPage, pageTitle } from "../registry";
import { CommentDashboardEntry } from "./CommentDashboardRow";
import { useDashboardState } from "./dashboard-state";
import { PLAYGROUND_COMMENT_CONFIG, type PageComment } from "./useComments";
import { dashboardFilters } from "./dashboard-filters";
import { filterDashboardComments } from "./dashboard-model";
import { CommentDashboardCopy } from "./CommentDashboardCopy";
import { buildReplyMap } from "@flanksource/clicky-ui/comments";

function titleFor(slug: string) {
  const page = findPage(slug);
  return page ? pageTitle(page) : (externalPage(slug)?.title ?? slug);
}

export function CommentDashboard({
  comments,
  loading,
  error,
  pageHref,
}: {
  comments: PageComment[];
  loading: boolean;
  error: string | null;
  pageHref: (page: string) => string;
}) {
  const [state, setState] = useDashboardState();
  const catalog = useExternalCatalog();
  const roots = comments.filter((comment) => !comment.parentId);
  const data = filterDashboardComments(comments, state);
  const replies = buildReplyMap(comments);
  const columns: DataTableColumn<PageComment>[] = [
    {
      key: "body",
      label: "Comment",
    },
    {
      key: "page",
      label: "Page",
      accessor: (comment) => titleFor(comment.page),
    },
    {
      key: "status",
      label: "Status",
      accessor: (comment) => comment.status ?? "open",
    },
    {
      key: "author",
      label: "Author",
      accessor: (comment) => comment.author?.name ?? "Anonymous",
    },
    { key: "createdAt", label: "Created", kind: "timestamp" },
    {
      key: "updatedAt",
      label: "Updated",
      accessor: (comment) => comment.updatedAt ?? comment.createdAt,
      kind: "timestamp",
    },
  ];

  return (
    <section
      aria-label="Comment dashboard"
      className="flex h-full min-h-0 flex-col gap-4 p-density-4"
    >
      <header className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold">Comments</h1>
          <p className="text-sm text-muted-foreground">
            Feedback across all pages ·{" "}
            {
              roots.filter((comment) =>
                PLAYGROUND_COMMENT_CONFIG.statuses.some(
                  (status) =>
                    status.value === (comment.status ?? "open") &&
                    status.unresolved,
                ),
              ).length
            }{" "}
            unresolved
          </p>
          <p className="text-xs text-muted-foreground">
            Comments and replies refresh every 5 seconds
          </p>
        </div>
        <div className="flex flex-wrap items-start justify-end gap-2">
          <CommentDashboardCopy
            comments={comments}
            selected={data}
            state={state}
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() =>
              setState({
                status: "unresolved",
                pages: {},
                projects: {},
                author: "",
                screenshots: "all",
                query: "",
                sort: { key: "updatedAt", dir: "desc" },
              })
            }
          >
            Reset filters
          </Button>
        </div>
      </header>
      <DataTable
        className="min-h-0 flex-1"
        data={data}
        getRowId={(comment) => comment.id}
        columns={columns}
        renderCard={(comment) => (
          <CommentDashboardEntry
            comment={comment}
            title={titleFor(comment.page)}
            href={pageHref(comment.page)}
            replies={replies.get(comment.id) ?? []}
          />
        )}
        loading={loading}
        error={error ?? catalog.error}
        emptyMessage="No comments match these filters."
        showGlobalFilter
        manualFilter
        externalFilters={dashboardFilters({
          comments,
          state,
          onChange: setState,
          externalPages: catalog.pages.map((page) => page.id),
        })}
        globalFilter={state.query}
        onGlobalFilterChange={(query) => setState({ query })}
        globalFilterPlaceholder="Search comments…"
        sort={state.sort}
        onSortChange={(sort) => setState({ sort })}
      />
    </section>
  );
}
