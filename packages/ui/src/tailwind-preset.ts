import type { Config } from "tailwindcss";

const preset: Partial<Config> = {
  darkMode: ["selector", '[data-theme="dark"]'],
  theme: {
    extend: {
      // Tokens are full-color aliases of the Flanksource fs-tokens (see
      // styles/tokens.css), so they are referenced directly with var(--token)
      // — no hsl() wrapper. Tailwind v4 applies opacity modifiers via color-mix.
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          border: "var(--sidebar-border)",
          ring: "var(--sidebar-ring)",
          accent: {
            DEFAULT: "var(--sidebar-accent)",
            foreground: "var(--sidebar-accent-foreground)",
          },
          primary: {
            DEFAULT: "var(--sidebar-primary)",
            foreground: "var(--sidebar-primary-foreground)",
          },
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
