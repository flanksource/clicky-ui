import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import { CLASS_LOADERS } from "../fixtures/classes";
import { BUILT_IN_EXPRESSION_PRESETS, type ExpressionLanguage } from "../model/expressions";
import { ExpressionConsole, type ExpressionConsoleProps } from "./ExpressionConsole";

function Demo(props: ExpressionConsoleProps) {
  const [language, setLanguage] = useState<ExpressionLanguage>(props.language);
  const [expression, setExpression] = useState(props.expression);
  const [history, setHistory] = useState(props.history);
  const [loader, setLoader] = useState("");
  return (
    <div className="h-80 p-3">
      <ExpressionConsole
        {...props}
        language={language}
        onLanguageChange={(next) => {
          setLanguage(next);
          setExpression("");
        }}
        expression={expression}
        onExpressionChange={setExpression}
        history={history}
        onHistoryChange={setHistory}
        {...(props.loaders ? { loaders: { ...props.loaders, value: loader, onChange: setLoader } } : {})}
      />
    </div>
  );
}

const meta = {
  title: "JVM/ExpressionConsole",
  component: Demo,
  parameters: { layout: "fullscreen" },
  args: {
    language: "ognl",
    onLanguageChange: fn(),
    expression: "",
    onExpressionChange: fn(),
    presets: [...BUILT_IN_EXPRESSION_PRESETS, { label: "Hello", expression: "println 'hello from Groovy'", language: "groovy" }],
    history: ["#root.size()", "@java.lang.Runtime@getRuntime().availableProcessors()"],
    onHistoryChange: fn(),
    canRun: true,
    running: false,
    onRun: fn(),
  },
} satisfies Meta<typeof Demo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Ognl: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: "Run" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: /^Runtime/ }));
    await expect(canvas.getByRole("textbox", { name: "OGNL expression" })).toHaveValue("@java.lang.Runtime@getRuntime()");
    await userEvent.click(canvas.getByRole("button", { name: "Run" }));
    await expect(args.onRun).toHaveBeenCalledOnce();
  },
};

export const Groovy: Story = {
  args: { language: "groovy", history: [] },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("button", { name: /^Hello/ })).toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: /Load file/ })).toBeInTheDocument();
  },
};

export const WithClassLoaders: Story = {
  args: { expression: "@java.lang.System@getProperties()", loaders: { options: CLASS_LOADERS, value: "", onChange: fn() } },
};

export const RunningNotPermitted: Story = {
  args: { expression: "@java.lang.System@getProperties()", canRun: false, toolbar: <span className="text-xs text-muted-foreground">Runtime changes are disabled for this JVM.</span> },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).getByRole("button", { name: "Run" })).toBeDisabled();
  },
};

export const Running: Story = {
  args: { expression: "@java.lang.System@getProperties()", running: true },
};
