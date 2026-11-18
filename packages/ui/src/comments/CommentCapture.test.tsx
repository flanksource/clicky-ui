import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it } from "vitest";
import { CommentCapture, type CommentCaptureContext } from "./CommentCapture";
import { CommentThreadList } from "./CommentThreadList";
import { DEFAULT_COMMENT_STATUSES } from "./comment-types";

const capture: CommentCaptureContext = {
  pageUrl: "http://localhost:9094/?file=products%2Fexample.yaml&view=form",
  componentName: "ProductForm",
  source: "ProductForm\n  src/product.tsx:12\n  src/editor.tsx:5",
  html: '<section>\n  <button>Product</button>\n</section>',
  screenshot: { status: "captured", url: "/captures/product.png" },
};

it("keeps multiline capture details collapsed until the context summary is opened", () => {
  render(<CommentCapture capture={capture} />);
  expect(screen.getByText("Capture context").closest("details")).not.toHaveAttribute("open");
  expect(screen.getByText((_, node) => node?.tagName === "PRE" && node.textContent === capture.source)).not.toBeVisible();
  expect(screen.getByRole("link", { name: "View full capture" })).not.toBeVisible();
  fireEvent.click(screen.getByText("Capture context"));
  expect(screen.getByText((_, node) => node?.tagName === "PRE" && node.textContent === capture.source)).toBeVisible();
  expect(screen.getByRole("link", { name: "View full capture" })).toHaveAttribute("href", "/captures/product.png");
});

it("keeps the original capture available in a maximized comment thread", () => {
  render(<CommentThreadList
    comments={[{ id: "capture-root", body: "Review the product", createdAt: "2026-11-13", author: null }]}
    config={{ statuses: DEFAULT_COMMENT_STATUSES }}
    renderRootDetails={() => <CommentCapture capture={capture} />}
  />);
  fireEvent.click(screen.getByRole("button", { name: "Comment actions" }));
  fireEvent.click(screen.getByText("Maximise"));
  const modal = within(screen.getByTestId("comment-thread-modal"));
  fireEvent.click(modal.getByText("Capture context"));
  expect(modal.getByText((_, node) => node?.tagName === "PRE" && node.textContent === capture.source)).toBeVisible();
  expect(modal.getByText((_, node) => node?.tagName === "PRE" && node.textContent === capture.html)).toBeVisible();
  expect(modal.getByRole("link", { name: capture.pageUrl })).toHaveAttribute("href", capture.pageUrl);
});
