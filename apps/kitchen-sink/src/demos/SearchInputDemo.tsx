import { useState } from "react";
import { SearchInput } from "@flanksource/clicky-ui";
import { DemoRow, DemoSection } from "./Section";

export function SearchInputDemo() {
  const [query, setQuery] = useState("");
  const [plain, setPlain] = useState("");

  return (
    <DemoSection
      id="search-input"
      title="SearchInput"
      description="Search field with a leading magnifier and a trailing ⌘K hint (the Gavel app-bar search). Press ⌘K / Ctrl+K to focus the first field."
    >
      <DemoRow label="With ⌘K">
        <div className="w-[440px]">
          <SearchInput
            value={query}
            onChange={setQuery}
            placeholder="Search pull requests, branches, #id…"
            onShortcut={() => undefined}
          />
        </div>
      </DemoRow>
      <DemoRow label="No shortcut">
        <div className="w-[440px]">
          <SearchInput value={plain} onChange={setPlain} placeholder="Filter…" shortcut={null} />
        </div>
      </DemoRow>
    </DemoSection>
  );
}
