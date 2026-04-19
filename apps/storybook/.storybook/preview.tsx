import type { Preview } from '@storybook/react-vite';
import { ThemeProvider, DensityProvider } from '@flanksource/clicky-ui';
import '@flanksource/clicky-ui/styles.css';
import './preview.css';

const preview: Preview = {
  parameters: {
    controls: { expanded: true },
    backgrounds: { disable: true },
  },
  globalTypes: {
    theme: {
      description: 'Theme',
      defaultValue: 'light',
      toolbar: {
        icon: 'paintbrush',
        items: ['light', 'dark', 'system'],
        dynamicTitle: true,
      },
    },
    density: {
      description: 'Density',
      defaultValue: 'comfortable',
      toolbar: {
        icon: 'component',
        items: ['compact', 'comfortable', 'spacious'],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (Story, ctx) => (
      <ThemeProvider defaultTheme={ctx.globals.theme ?? 'light'}>
        <DensityProvider defaultDensity={ctx.globals.density ?? 'comfortable'}>
          <div style={{ padding: '2rem' }}>
            <Story />
          </div>
        </DensityProvider>
      </ThemeProvider>
    ),
  ],
};

export default preview;
