import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { MonacoProvider } from "../../monaco/MonacoProvider";
import type { ClassesSurfaceState } from "../classes/classes-state";
import { APP_LOADER } from "../fixtures/classes";
import { fakeJvmClient } from "../fixtures/fake-client";
import type { JvmStatus } from "../protocol/types";
import { ClassesSurface, type ClassesSurfaceProps } from "./ClassesSurface";
import { JvmProvider } from "./JvmProvider";

const CLASS = "com.example.orders.OrderService";

type Args = Pick<ClassesSurfaceProps, "canMutate" | "requireConsent" | "onTraceMethod" | "renderClassBadge"> & {
  status: JvmStatus;
  initial: ClassesSurfaceState;
  patched: boolean;
};

// Vite bundles a worker named by `new Worker(new URL(...))`; the editor worker is enough here.
function getEditorWorker(): Worker {
  return new Worker(new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url), { type: "module" });
}

function Demo({ status, initial, patched, ...props }: Args) {
  const [client] = useState(() => fakeJvmClient({ status, patched }));
  const [queryClient] = useState(() => new QueryClient({ defaultOptions: { queries: { retry: false } } }));
  const [state, setState] = useState(initial);
  return (
    <QueryClientProvider client={queryClient}>
      <JvmProvider client={client} scope="story">
        <MonacoProvider getWorker={getEditorWorker}>
          <div className="h-[680px]">
            <ClassesSurface state={state} onStateChange={setState} {...props} />
          </div>
        </MonacoProvider>
      </JvmProvider>
    </QueryClientProvider>
  );
}

const meta = {
  title: "JVM/ClassesSurface",
  component: Demo,
  parameters: { layout: "fullscreen" },
  args: { status: { allowMutation: true }, initial: {}, patched: true },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Browsing: Story = {
  args: { initial: { q: "OrderService" } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(within(await canvas.findByRole("treeitem", { name: CLASS })).getByText("OrderService"));
    await expect(await canvas.findByText(/CFR 0\.152/)).toBeInTheDocument();
  },
};

export const FoldedToMethod: Story = {
  args: { initial: { class: CLASS, loader: APP_LOADER, method: "checkout(Ljava/lang/String;)D" } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByRole("button", { name: "Show 13 hidden lines above" })).toBeInTheDocument();
  },
};

export const DeepLinkedLine: Story = {
  args: { initial: { class: CLASS, loader: APP_LOADER, line: "19" } },
  play: async ({ canvasElement }) => {
    await within(canvasElement).findByText(/CFR 0\.152/);
    await expect(canvasElement.querySelector('[data-row="16"]')).toHaveAttribute("data-highlighted", "true");
  },
};

export const WithHostSlots: Story = {
  args: {
    initial: { class: CLASS, loader: APP_LOADER, method: "checkout(Ljava/lang/String;)D" },
    onTraceMethod: fn(),
    renderClassBadge: (ref) => <span className="rounded bg-sky-500/15 px-1 text-[10px] text-sky-700">{ref.loader.slice(0, 4)}</span>,
  },
  play: async ({ args, canvasElement }) => {
    const trace = await within(canvasElement).findByRole("button", { name: "Trace method" });
    await waitFor(() => expect(trace).toBeEnabled());
    await userEvent.click(trace);
    await expect(args.onTraceMethod).toHaveBeenCalledWith({ class: CLASS, loader: APP_LOADER, method: "checkout(Ljava/lang/String;)D" });
  },
};

export const RestoringAPatch: Story = {
  args: { initial: { class: CLASS, loader: APP_LOADER } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const restore = await canvas.findByRole("button", { name: "Restore original" });
    await expect(restore).toBeDisabled();
    await userEvent.click(await canvas.findByRole("checkbox", { name: "Allow replacing class bytecode" }));
    await userEvent.click(restore);
    await waitFor(() => expect(canvas.queryByRole("button", { name: "Restore original" })).toBeNull());
  },
};

export const MutationsDisabled: Story = {
  args: { status: { allowMutation: false }, initial: { class: CLASS, loader: APP_LOADER } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText(/Runtime changes are disabled/)).toBeInTheDocument();
  },
};

export const ClassNotLoaded: Story = {
  args: { initial: { class: "com.example.Missing", loader: APP_LOADER } },
  play: async ({ canvasElement }) => {
    await expect(await within(canvasElement).findByText("Decompiling failed")).toBeInTheDocument();
  },
};

// Editing loads Monaco, which needs real layout and a worker: the browser project.
export const EditCompileAndApply: Story = {
  tags: ["browser"],
  args: { initial: { class: CLASS, loader: APP_LOADER }, patched: false },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const edit = await canvas.findByRole("button", { name: "Edit" });
    await waitFor(() => expect(edit).toBeEnabled());
    await userEvent.click(edit);
    // Focus the editor's input only once its lines have rendered: a textarea that appears earlier belongs to an editor still mounting, and the typing is lost.
    await waitFor(
      () => {
        if (!canvasElement.querySelector(".view-lines")) throw new Error("the editor has not rendered its lines yet");
        const input = canvasElement.querySelector<HTMLTextAreaElement>("textarea.inputarea");
        if (!input) throw new Error("the editor has no input area");
        input.focus();
        expect(document.activeElement).toBe(input);
      },
      { timeout: 10_000 },
    );
    await userEvent.keyboard("// patched{Enter}");
    // Compile stays disabled until the draft differs from the decompiled source.
    const compile = canvas.getByRole("button", { name: "Compile preview" });
    await waitFor(() => expect(compile).toBeEnabled());
    await userEvent.click(compile);
    await expect(await canvas.findByText(/Compiles with 1 warning|Compiles cleanly/)).toBeInTheDocument();
    await userEvent.click(await canvas.findByRole("checkbox", { name: "Allow replacing class bytecode" }));
    await userEvent.click(canvas.getByRole("button", { name: "Apply patch" }));
    await expect(await canvas.findByText(/Patch applied/)).toBeInTheDocument();
  },
};
