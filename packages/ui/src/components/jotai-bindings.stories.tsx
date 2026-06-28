import type { Meta, StoryObj } from "@storybook/react-vite";
import { Provider, atom, createStore, useAtomValue } from "jotai";
import { useEffect, useMemo } from "react";
import type { FilterBarMultiFilterMode } from "./FilterBar";
import {
  JotaiFilterBar,
  type JotaiFilterBarFilter,
  type JotaiFilterBarRangeValue,
} from "../jotai";

const searchAtom = atom("");
const ownerAtom = atom("");
const statusAtom = atom<Record<string, FilterBarMultiFilterMode>>({});
const rangeAtom = atom<JotaiFilterBarRangeValue>({});

type UrlFilterState = {
  search: string;
  owner: string;
  status: Record<string, FilterBarMultiFilterMode>;
  range: JotaiFilterBarRangeValue;
};

function readUrlFilterState(): UrlFilterState {
  if (typeof window === "undefined") {
    return { search: "", owner: "", status: {}, range: {} };
  }
  const params = new URLSearchParams(window.location.search);
  const from = params.get("since") ?? undefined;
  const to = params.get("to") ?? undefined;
  return {
    search: params.get("q") ?? "",
    owner: params.get("owner") ?? "",
    status: parseStatusParams(params),
    range: {
      ...(from !== undefined ? { from } : {}),
      ...(to !== undefined ? { to } : {}),
    },
  };
}

function parseStatusParams(params: URLSearchParams): Record<string, FilterBarMultiFilterMode> {
  const status: Record<string, FilterBarMultiFilterMode> = {};
  params.getAll("status").forEach((raw) => {
    const value = raw.trim();
    if (!value) return;
    if (value.startsWith("-") && value.length > 1) {
      status[value.slice(1)] = "exclude";
      return;
    }
    status[value] = "include";
  });
  return status;
}

function setOptionalParam(params: URLSearchParams, key: string, value: string | undefined) {
  if (value) {
    params.set(key, value);
    return;
  }
  params.delete(key);
}

function applyUrlFilterState(params: URLSearchParams, state: UrlFilterState) {
  setOptionalParam(params, "q", state.search);
  setOptionalParam(params, "owner", state.owner);
  setOptionalParam(params, "since", state.range.from);
  setOptionalParam(params, "to", state.range.to);

  params.delete("status");
  Object.entries(state.status)
    .sort(([left], [right]) => left.localeCompare(right))
    .forEach(([value, mode]) => {
      params.append("status", mode === "exclude" ? `-${value}` : value);
    });
}

function buildUrlFilterHref(state: UrlFilterState) {
  if (typeof window === "undefined") return "";
  const url = new URL(window.location.href);
  const params = url.searchParams;
  applyUrlFilterState(params, state);
  return `${url.pathname}${url.search}${url.hash}`;
}

function writeUrlFilterState(state: UrlFilterState) {
  const next = buildUrlFilterHref(state);
  if (!next || typeof window === "undefined") return;
  window.history.replaceState(window.history.state, "", next);
}

function UrlQueryParamsStory() {
  const store = useMemo(() => {
    const nextStore = createStore();
    const initial = readUrlFilterState();
    nextStore.set(searchAtom, initial.search);
    nextStore.set(ownerAtom, initial.owner);
    nextStore.set(statusAtom, initial.status);
    nextStore.set(rangeAtom, initial.range);
    return nextStore;
  }, []);

  return (
    <Provider store={store}>
      <UrlQueryParamsFilterBar />
    </Provider>
  );
}

function UrlQueryParamsFilterBar() {
  const search = useAtomValue(searchAtom);
  const owner = useAtomValue(ownerAtom);
  const status = useAtomValue(statusAtom);
  const range = useAtomValue(rangeAtom);

  const filters = useMemo<JotaiFilterBarFilter[]>(
    () => [
      {
        key: "status",
        kind: "multi",
        label: "Status",
        atom: statusAtom,
        options: [
          { value: "healthy", label: "Healthy" },
          { value: "degraded", label: "Degraded" },
          { value: "pending", label: "Pending" },
        ],
      },
      {
        key: "owner",
        kind: "text",
        label: "Owner",
        atom: ownerAtom,
        placeholder: "platform",
      },
    ],
    [],
  );

  const href = useMemo(() => buildUrlFilterHref({ search, owner, status, range }), [
    owner,
    range,
    search,
    status,
  ]);

  useEffect(() => {
    writeUrlFilterState({ search, owner, status, range });
  }, [owner, range, search, status]);

  return (
    <div className="max-w-3xl space-y-4">
      <JotaiFilterBar
        search={{
          atom: searchAtom,
          ariaLabel: "Search workloads",
          placeholder: "Search workloads...",
        }}
        filters={filters}
        timeRange={{
          atom: rangeAtom,
          presets: [
            { label: "Last hour", from: "now-1h", to: "now" },
            { label: "Last day", from: "now-24h", to: "now" },
          ],
        }}
      />
      <div className="rounded-md border border-border bg-muted/30 px-3 py-2 font-mono text-xs">
        {href || "/"}
      </div>
    </div>
  );
}

const meta = {
  title: "Components/Jotai bindings",
  component: JotaiFilterBar,
  parameters: {
    docs: {
      description: {
        component: [
          "Jotai bindings wrap the controlled `FilterBar` and `JsonSchemaForm` APIs with writable atoms.",
          "Use the `@flanksource/clicky-ui/jotai` entrypoint when an app wants shared Clicky controls to read/write Jotai state directly.",
        ].join("\n\n"),
      },
    },
  },
} satisfies Meta<typeof JotaiFilterBar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const UrlQueryParams: Story = {
  render: () => <UrlQueryParamsStory />,
  parameters: {
    docs: {
      description: {
        story: [
          "Initializes atoms from `window.location.search` and writes every filter change back to the URL.",
          "The example preserves Storybook's own query params while adding app params like `q`, `owner`, repeated `status`, `since`, and `to`.",
          "",
          "```tsx",
          "import { atom, useAtomValue } from 'jotai';",
          "import { useEffect } from 'react';",
          "import { JotaiFilterBar } from '@flanksource/clicky-ui/jotai';",
          "",
          "const searchAtom = atom(new URLSearchParams(location.search).get('q') ?? '');",
          "const ownerAtom = atom(new URLSearchParams(location.search).get('owner') ?? '');",
          "",
          "function Filters() {",
          "  const search = useAtomValue(searchAtom);",
          "  const owner = useAtomValue(ownerAtom);",
          "",
          "  useEffect(() => {",
          "    const url = new URL(location.href);",
          "    search ? url.searchParams.set('q', search) : url.searchParams.delete('q');",
          "    owner ? url.searchParams.set('owner', owner) : url.searchParams.delete('owner');",
          "    history.replaceState(history.state, '', `${url.pathname}${url.search}${url.hash}`);",
          "  }, [search, owner]);",
          "",
          "  return (",
          "    <JotaiFilterBar",
          "      search={{ atom: searchAtom, placeholder: 'Search...' }}",
          "      filters={[{ key: 'owner', kind: 'text', label: 'Owner', atom: ownerAtom }]}",
          "    />",
          "  );",
          "}",
          "```",
        ].join("\n"),
      },
    },
  },
};
