import { describe, expect, it } from "vitest";
// @ts-expect-error -- plain JS oxlint plugin, no type declarations
import { clickyReplacementFor } from "./clicky-ui-prefer-components.js";
// @ts-expect-error -- plain JS oxlint plugin, no type declarations
import { isArbitraryZIndexClass, isDialogRole } from "./clicky-ui-no-adhoc-overlay.js";
// @ts-expect-error -- plain JS oxlint plugin, no type declarations
import { isHandrolledStyleValue } from "./clicky-ui-prefer-tailwind.js";
import {
  isArbitraryColorClass,
  isClickyStorageKey,
  isHardcodedColorValue,
  // @ts-expect-error -- plain JS oxlint plugin, no type declarations
} from "./clicky-ui-prefer-theme.js";
import {
  isEmojiOnly,
  isUnapprovedIconImport,
  // @ts-expect-error -- plain JS oxlint plugin, no type declarations
} from "./clicky-ui-prefer-icons.js";
// @ts-expect-error -- plain JS oxlint plugin, no type declarations
import { isIconifyName } from "./clicky-ui-shared.js";
// @ts-expect-error -- plain JS oxlint plugin, no type declarations
import plugin from "./clicky-ui.js";

describe("clickyReplacementFor", () => {
  it.each([
    ["button", "Button"],
    ["select", "Select"],
    ["table", "DataTable"],
    ["dialog", "Modal"],
  ])("maps <%s> to a clicky-ui replacement", (element, expected) => {
    expect(clickyReplacementFor(element)).toContain(expected);
  });

  it.each(["div", "span", "Button", "input", "section", "textarea", "p", ""])(
    "does not map %s",
    (element) => {
      expect(clickyReplacementFor(element)).toBeUndefined();
    },
  );

  it("ignores non-string input", () => {
    expect(clickyReplacementFor(undefined)).toBeUndefined();
    expect(clickyReplacementFor(42)).toBeUndefined();
  });
});

describe("isArbitraryZIndexClass", () => {
  it.each(["z-[999]", "hover:z-[999]", "md:z-[var(--x)]", "z-[9999]"])(
    "flags arbitrary z-index class %s",
    (token) => {
      expect(isArbitraryZIndexClass(token)).toBe(true);
    },
  );

  it.each(["z-50", "z-10", "zebra", "z-[999]extra", "text-[#fff]", ""])(
    "does not flag %s",
    (token) => {
      expect(isArbitraryZIndexClass(token)).toBe(false);
    },
  );
});

describe("isDialogRole", () => {
  it.each(["dialog", "alertdialog"])("flags role=%s", (role) => {
    expect(isDialogRole(role)).toBe(true);
  });

  it.each(["button", "menu", "tooltip", "", undefined])("does not flag %s", (role) => {
    expect(isDialogRole(role)).toBe(false);
  });
});

describe("isHandrolledStyleValue", () => {
  it.each([
    ["padding", 8],
    ["padding", "8px"],
    ["marginTop", "1rem"],
    ["gap", 4],
    ["display", "flex"],
    ["fontWeight", "600"],
    ["borderRadius", "4px"],
  ])("flags static %s: %s", (prop, value) => {
    expect(isHandrolledStyleValue(prop, value)).toBe(true);
  });

  it.each([
    ["padding", "var(--p)"],
    ["fontSize", "clamp(1rem, 2vw, 2rem)"],
    ["gap", "calc(100% - 8px)"],
    ["color", "#fff"], // color is a theme concern, not this rule
    ["zIndex", 10], // not a mappable property
    ["width", 200], // positioning often needs computed values; not in the set
  ])("does not flag %s: %s", (prop, value) => {
    expect(isHandrolledStyleValue(prop, value)).toBe(false);
  });
});

describe("isArbitraryColorClass", () => {
  it.each([
    "text-[#fff]",
    "bg-[#000000]",
    "hover:border-[#abc]",
    "bg-[rgb(0,0,0)]",
    "text-[hsl(0,0%,0%)]",
  ])("flags hardcoded color class %s", (token) => {
    expect(isArbitraryColorClass(token)).toBe(true);
  });

  it.each([
    "text-foreground",
    "bg-background",
    "text-[14px]", // arbitrary size, not a color
    "border-border",
    "w-[200px]",
    "",
  ])("does not flag %s", (token) => {
    expect(isArbitraryColorClass(token)).toBe(false);
  });
});

describe("isHardcodedColorValue", () => {
  it.each(["#fff", "#ffffff", "#ffffff00", "rgb(0,0,0)", "rgba(0,0,0,0.5)", "hsl(0,0%,0%)"])(
    "flags literal color %s",
    (value) => {
      expect(isHardcodedColorValue(value)).toBe(true);
    },
  );

  it.each(["var(--foreground)", "currentColor", "inherit", "transparent", ""])(
    "does not flag %s",
    (value) => {
      expect(isHardcodedColorValue(value)).toBe(false);
    },
  );
});

describe("isClickyStorageKey", () => {
  it.each(["clicky-ui-theme", "clicky-ui-density"])("flags %s", (key) => {
    expect(isClickyStorageKey(key)).toBe(true);
  });

  it.each(["theme", "my-app-theme", "clicky-ui", "", undefined])("does not flag %s", (key) => {
    expect(isClickyStorageKey(key)).toBe(false);
  });
});

describe("isUnapprovedIconImport", () => {
  it.each([
    "lucide-react",
    "react-icons/fa",
    "@heroicons/react/24/solid",
    "@mui/icons-material",
    "@phosphor-icons/react",
    "@tabler/icons-react",
    "@fortawesome/free-solid-svg-icons",
    "@ant-design/icons",
  ])("flags icon library import %s", (source) => {
    expect(isUnapprovedIconImport(source)).toBe(true);
  });

  it.each([
    "@flanksource/clicky-ui/icons",
    "@flanksource/icons/mi",
    "@iconify/react",
    "@flanksource/clicky-ui/components",
    "react",
    "./local-icon",
    "",
  ])("does not flag approved/unrelated source %s", (source) => {
    expect(isUnapprovedIconImport(source)).toBe(false);
  });
});

describe("isEmojiOnly", () => {
  it.each(["🔍", "  ✅ ", "⚙️", "🚀🚀", "🎉"])("flags emoji-only %s", (text) => {
    expect(isEmojiOnly(text)).toBe(true);
  });

  it.each(["Search", "🔍 Search", "v2", "", "  ", "a"])(
    "does not flag %s",
    (text) => {
      expect(isEmojiOnly(text)).toBe(false);
    },
  );
});

describe("isIconifyName", () => {
  it.each([
    "codicon:clock",
    "lucide:activity",
    "svg-spinners:ring-resize",
    "jb-expui-nodes:class",
    "mdi:earth",
    "ph:robot",
    "tabler:x",
  ])("flags icon-set name %s", (value) => {
    expect(isIconifyName(value)).toBe(true);
  });

  it.each([
    "foo:bar", // unknown prefix
    "ph:robot, ph:robot-fill", // not a single name
    '[title="mdi:earth"]', // css selector, not a bare name
    "mdi:", // missing name
    "Lucide:Maximize", // uppercase
    "12:30", // not an icon-set prefix
    "",
  ])("does not flag %s", (value) => {
    expect(isIconifyName(value)).toBe(false);
  });

  it("ignores non-string input", () => {
    expect(isIconifyName(undefined)).toBe(false);
    expect(isIconifyName(42)).toBe(false);
  });
});

describe("plugin", () => {
  it("exposes the consumer rules under the clicky-ui namespace", () => {
    expect(plugin.meta.name).toBe("clicky-ui");
    expect(Object.keys(plugin.rules).sort()).toEqual([
      "no-adhoc-overlay",
      "prefer-clicky-components",
      "prefer-clicky-icons",
      "prefer-tailwind-classes",
      "prefer-theme-tokens",
    ]);
    for (const rule of Object.values(plugin.rules)) {
      expect(typeof (rule as { create: unknown }).create).toBe("function");
    }
  });
});
