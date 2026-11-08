# Annotating an editor

`AnnotationSurface` from `@flanksource/clicky-ui/comments` adds element selection, a floating composer, pins, and a responsive comment rail. It owns no persistence or agent execution. Supply controlled `comments`, a `captures` map keyed by root comment ID, lifecycle callbacks, and `onCreate`. Use a stable document-specific `documentKey` for tab-local draft recovery.

`view` distinguishes source, form, and rich text. `onPrepareCapture` can flush autosave and attach the captured revision before composition begins. `onCreate` receives the comment, the prepared capture, and optional screenshot result. Reject stale revisions without discarding the draft. Screenshot capture requires the user to select the current browser tab; ordinary comments do not request it.

For source annotations, pass typed `sourceComments` to `DocumentEditor`: current resolved ranges, `onSelect`, and `onCreate`. The gutter opens an existing thread or creates a line comment; the context menu creates a comment on the selected range. Set `selection` on the annotation surface to compose that range in the rail. `onSelectCapture` lets the host restore the originating view and reveal the target. The host retains original captures separately from current resolved positions.

The **Comments / AnnotationSurface / VisualFeedback** Storybook example is runnable without a server. Gavel Editor supplies persisted comments, versioned mutations, screenshots, and patch-context anchoring through its comments service. Configure Gavel PostgreSQL and run `gavel comments provision` explicitly before using persistence; database failures remain visible without disabling file editing.

The playground application keeps its existing integration. Its migration to this shared surface is deferred.
