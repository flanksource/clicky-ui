import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { APP_LOADER, CLASS_LOADERS, CLASSES, PLATFORM_CLASSES } from "../fixtures/classes";
import type { JvmClassRef } from "../protocol/types";
import { ClassBrowser, type ClassBrowserProps } from "./ClassBrowser";

type Args = Pick<ClassBrowserProps, "classes" | "total" | "loading" | "error" | "onLoadMore" | "renderClassBadge"> & {
  initialQuery: string;
  initialLoader: string;
  initialPlatform: boolean;
  initialSelected?: JvmClassRef | undefined;
};

function Demo({ initialQuery, initialLoader, initialPlatform, initialSelected, ...rest }: Args) {
  const [query, setQuery] = useState(initialQuery);
  const [loader, setLoader] = useState(initialLoader);
  const [includePlatform, setIncludePlatform] = useState(initialPlatform);
  const [selected, setSelected] = useState(initialSelected);
  return (
    <div className="flex h-[480px] w-80 flex-col border border-border p-2">
      <ClassBrowser
        className="min-h-0 flex-1"
        loaders={CLASS_LOADERS}
        loader={loader}
        onLoaderChange={setLoader}
        query={query}
        onQueryChange={setQuery}
        includePlatform={includePlatform}
        onIncludePlatformChange={setIncludePlatform}
        selected={selected}
        onSelectClass={setSelected}
        {...rest}
      />
    </div>
  );
}

const meta = {
  title: "JVM/ClassBrowser",
  component: Demo,
  args: { classes: CLASSES, total: CLASSES.length, initialQuery: "", initialLoader: "", initialPlatform: false },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const All: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("treeitem", { name: "com" })).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("treeitem", { name: "com.example" })).toHaveAttribute("aria-expanded", "false");
  },
};

export const Filtered: Story = { args: { initialQuery: "orders", classes: CLASSES.filter((ref) => ref.name.includes("orders")) } };

export const RevealsSelection: Story = {
  args: { initialSelected: { name: "com.example.payments.PaymentClient$Retry", loader: APP_LOADER } },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("treeitem", { name: "com.example.payments.PaymentClient$Retry" })).toHaveAttribute("aria-selected", "true");
  },
};

export const PlatformClasses: Story = { args: { initialPlatform: true, classes: [...CLASSES, ...PLATFORM_CLASSES], total: CLASSES.length + PLATFORM_CLASSES.length } };

export const MoreAvailable: Story = {
  args: { total: 2841, onLoadMore: fn() },
  play: async ({ args, canvasElement }) => {
    await userEvent.click(within(canvasElement).getByRole("button", { name: "Load more" }));
    await expect(args.onLoadMore).toHaveBeenCalled();
  },
};

export const WithClassBadge: Story = {
  args: {
    initialQuery: "Order",
    classes: CLASSES.slice(0, 2),
    total: 2,
    renderClassBadge: (ref) => <span className="rounded bg-amber-500/15 px-1 text-[10px] text-amber-700">{ref.name.endsWith("Service") ? "service" : "web"}</span>,
  },
};

export const Loading: Story = { args: { loading: true, classes: [], total: 0 } };

export const NoMatches: Story = { args: { initialQuery: "Nope", classes: [], total: 0 } };

export const Failed: Story = { args: { error: <p role="alert" className="p-2 text-xs text-destructive">Class listing failed: agent unreachable</p>, classes: [], total: 0 } };
