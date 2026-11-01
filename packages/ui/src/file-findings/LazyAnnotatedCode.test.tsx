import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const gate = vi.hoisted(() => {
  let release!: () => void;
  const opened = new Promise<void>((resolve) => (release = resolve));
  return { opened, release };
});

// Stands in for the Monaco-backed module so the chunk's load can be held open.
vi.mock("./AnnotatedCode", async () => {
  await gate.opened;
  return { AnnotatedCode: ({ path }: { path: string }) => <div data-testid="code-viewer">{path}</div> };
});

import { AnnotatedCode } from "./LazyAnnotatedCode";

describe("AnnotatedCode (lazy)", () => {
  it("shows a loading state while the editor chunk loads, then the code viewer with the same props", async () => {
    render(<AnnotatedCode path="pkg/a.go" source="package a" findings={[]} />);

    expect(screen.getByText("Loading editor")).toBeInTheDocument();
    expect(screen.queryByTestId("code-viewer")).toBeNull();

    gate.release();

    expect(await screen.findByTestId("code-viewer")).toHaveTextContent("pkg/a.go");
    expect(screen.queryByText("Loading editor")).toBeNull();
  });
});
