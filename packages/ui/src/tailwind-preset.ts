import type { Config } from "tailwindcss";

const preset: Partial<Config> = {
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      spacing: {
        "control-h": "var(--control-height)",
        "control-px": "var(--control-padding-x)",
        "density-1": "var(--spacing-unit)",
        "density-2": "calc(var(--spacing-unit) * 2)",
        "density-3": "calc(var(--spacing-unit) * 3)",
        "density-4": "calc(var(--spacing-unit) * 4)",
      },
      fontSize: {
        "density-base": "var(--font-size-base)",
      },
    },
  },
  plugins: [
    ({ addVariant }: { addVariant: (name: string, selector: string) => void }) => {
      addVariant("density-compact", '[data-density="compact"] &');
      addVariant("density-comfortable", '[data-density="comfortable"] &');
      addVariant("density-spacious", '[data-density="spacious"] &');
    },
  ],
};

export default preset;
