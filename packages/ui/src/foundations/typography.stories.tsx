import type { Meta, StoryObj } from "@storybook/react-vite";
import { ThemeSwitcher } from "../components/theme-switcher";
import { DensitySwitcher } from "../components/density-switcher";

type TypographyDemoProps = {
  sampleText: string;
  showThemeSwitcher: boolean;
  showDensitySwitcher: boolean;
  section: "scale" | "weights" | "content" | "all";
};

function TypographyDemo({
  sampleText,
  showThemeSwitcher,
  showDensitySwitcher,
  section,
}: TypographyDemoProps) {
  const showScale = section === "scale" || section === "all";
  const showWeights = section === "weights" || section === "all";
  const showContent = section === "content" || section === "all";

  return (
    <div className="flex flex-col gap-density-5">
      {(showThemeSwitcher || showDensitySwitcher) && (
        <div className="flex flex-wrap gap-density-2">
          {showThemeSwitcher && <ThemeSwitcher />}
          {showDensitySwitcher && <DensitySwitcher />}
        </div>
      )}
      {showScale && <ScaleTable sampleText={sampleText} />}
      {showWeights && <WeightsList sampleText={sampleText} />}
      {showContent && <ContentBlock sampleText={sampleText} />}
    </div>
  );
}

const meta: Meta<typeof TypographyDemo> = {
  title: "Foundations/Typography",
  component: TypographyDemo,
  args: {
    sampleText: "The quick brown fox jumps over the lazy dog",
    showThemeSwitcher: true,
    showDensitySwitcher: true,
    section: "scale",
  },
  argTypes: {
    section: {
      control: "inline-radio",
      options: ["scale", "weights", "content", "all"],
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Type scale, weights, and content styles. `text-density-base` follows the active density token; all other sizes are the Tailwind defaults layered on the theme's `--foreground` color.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof TypographyDemo>;

type Sample = { label: string; className: string; pt: string };

const SCALE: Sample[] = [
  { label: "text-xs", className: "text-xs", pt: "12px" },
  { label: "text-sm", className: "text-sm", pt: "14px" },
  { label: "text-density-base", className: "text-density-base", pt: "density token" },
  { label: "text-base", className: "text-base", pt: "16px" },
  { label: "text-lg", className: "text-lg", pt: "18px" },
  { label: "text-xl", className: "text-xl", pt: "20px" },
  { label: "text-2xl", className: "text-2xl", pt: "24px" },
  { label: "text-3xl", className: "text-3xl", pt: "30px" },
  { label: "text-4xl", className: "text-4xl", pt: "36px" },
];

const WEIGHTS: Sample[] = [
  { label: "font-normal", className: "font-normal", pt: "400" },
  { label: "font-medium", className: "font-medium", pt: "500" },
  { label: "font-semibold", className: "font-semibold", pt: "600" },
  { label: "font-bold", className: "font-bold", pt: "700" },
];

function ScaleTable({ sampleText }: { sampleText: string }) {
  return (
    <table className="w-full border-separate border-spacing-y-density-2">
      <thead>
        <tr className="text-left text-xs uppercase tracking-wide text-muted-foreground">
          <th className="w-48">Token</th>
          <th className="w-24">Size</th>
          <th>Sample</th>
        </tr>
      </thead>
      <tbody>
        {SCALE.map(({ label, className, pt }) => (
          <tr key={label} className="align-baseline">
            <td className="font-mono text-xs text-muted-foreground">{label}</td>
            <td className="font-mono text-xs text-muted-foreground">{pt}</td>
            <td className={className}>{sampleText}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function WeightsList({ sampleText }: { sampleText: string }) {
  return (
    <div className="flex flex-col gap-density-3">
      {WEIGHTS.map(({ label, className, pt }) => (
        <div key={label} className="flex items-baseline gap-density-3">
          <code className="w-36 text-xs text-muted-foreground">{label}</code>
          <code className="w-12 text-xs text-muted-foreground">{pt}</code>
          <span className={`text-xl ${className}`}>{sampleText}</span>
        </div>
      ))}
    </div>
  );
}

function ContentBlock({ sampleText }: { sampleText: string }) {
  return (
    <article className="max-w-2xl space-y-density-3">
      <h1 className="text-3xl font-bold tracking-tight">Heading 1</h1>
      <h2 className="text-2xl font-semibold tracking-tight">Heading 2</h2>
      <h3 className="text-xl font-semibold">Heading 3</h3>
      <p className="text-density-base leading-7">
        {sampleText}. Body copy uses{" "}
        <code className="rounded bg-muted px-1 py-0.5 font-mono text-xs">text-density-base</code>,
        which scales with the density switcher above. Inline{" "}
        <a className="text-primary underline-offset-4 hover:underline" href="#">
          links
        </a>{" "}
        use the primary color, and <strong>emphasized text</strong> uses a heavier weight.
      </p>
      <blockquote className="border-l-2 border-border pl-density-3 italic text-muted-foreground">
        "Consistency is the foundation of virtue." — the theming system
      </blockquote>
      <p className="text-sm text-muted-foreground">
        Muted supporting text sits on <code className="font-mono">--muted-foreground</code>.
      </p>
    </article>
  );
}

export const Scale: Story = {
  args: {
    section: "scale",
  },
};

export const Weights: Story = {
  args: {
    section: "weights",
    showDensitySwitcher: false,
  },
};

export const Content: Story = {
  args: {
    section: "content",
    showDensitySwitcher: false,
  },
};
