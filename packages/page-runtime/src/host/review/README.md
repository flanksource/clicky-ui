# Remote review

`createRemoteReview` adapts the page agent's review messages to host controls. The host owns comment persistence, source mutation, export upload/download, screenshots and clipboard access. The frame supplies review targets and their current source and viewport geometry. Treat returned HTML as text until an export renderer sanitizes it.

The implementation and types live in `src/host/review/index.ts`. The public `@flanksource/page-runtime/host` re-export and the shared envelope/boot dispatch are owner changes recorded in `.tmp/V-runtime-for-j/report.md`; they must land before the following host integration can run.

```ts
import { createRemoteReview } from "@flanksource/page-runtime/host";

const review = createRemoteReview({
  send: (message) => frame.send(message),
  onState: (state) => renderReviewControls(state.elements),
  onAction: (request) => handleReviewAction(request),
});

await review.setVisibility({ visible: true, showRejected: false });
await review.select("summary");
await review.action({ id: "summary", action: "approved" });
```

Route authenticated `review-state`, `review-action-request` and `review-error` messages to `review.receive(message)`. Enumeration and selection return `review-state`; actions return `review-action-request`. Mutations and scroll/resize changes also send unsolicited state updates. `requestId` correlates replies. Invalid targets and failed operations produce `review-error`; timeouts and disposal reject pending promises. Call `review.dispose()` when removing the frame.

Each element contains `id`, optional `domId` and `selection` (anchor, label, source/component/HTML/locators and rectangle). Add the iframe's offset to its rectangle for host controls and capture. Actions are `mark`, `approved`, `rejected`, `revision_requested`, `delete` and `export`; picker context actions use the same protocol. Export requests also contain the chosen `[data-review-content]` region's HTML and SVG when that region itself is SVG. Scripts and picker/agent hosts are excluded. Host export rendering and screenshot capture remain host responsibilities.

Delete requests require `containedAnchors: string[]`: the saved pin anchor IDs whose current resolved elements belong to the selected subtree, including its root. Registered anchors and locator-recovered pins retain their original IDs; orphaned and outside pins are excluded. The list has at most 10,000 unique nonempty strings, each at most 4,096 characters with no control characters. It is absent from other actions. Hosts send current comment pins before requesting deletion, then map these IDs to root comment IDs for their confirmed source-and-feedback deletion API; replies are removed with their root thread. Both host controls and picker actions request this same frame action, so the host never infers containment from HTML snippets or rectangles.

Run the focused validation/adapter and real-browser checks through Gavel:

```sh
gavel test --work-dir ./packages/page-runtime --framework vitest --recursive=false -- src/host/review
gavel test --work-dir ./packages/page-runtime --framework vitest --recursive=false -- --config vitest.browser.config.ts src/frame/agent/review.browser.ts
```
