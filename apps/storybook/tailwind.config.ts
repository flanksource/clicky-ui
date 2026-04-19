import type { Config } from 'tailwindcss';
import preset from '@flanksource/clicky-ui/tailwind-preset';

const config: Config = {
  presets: [preset as Config],
  content: [
    './.storybook/**/*.{ts,tsx,mdx}',
    './src/**/*.{ts,tsx,mdx}',
    '../../packages/ui/src/**/*.{ts,tsx,mdx}',
  ],
};

export default config;
