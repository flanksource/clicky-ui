// @vitest-environment jsdom
import { expect, it } from 'vitest';
import { inspectStyles } from './styles.ts';

it('reports resolved document tokens, typography and first-page geometry', () => {
  const sample = document.createElement('iframe');
  document.body.append(sample);
  try {
    const frame = sample.contentDocument!;
    frame.documentElement.style.setProperty('--facet-brand-blue', '#254879');
    frame.documentElement.style.setProperty('--text-xl', '18pt');
    frame.body.innerHTML = '<div data-facet-theme="sample" style="font: 16px/24px Georgia; background: white; --facet-brand-blue: #4f2965"><div data-page-size="letter" data-margin-left="15"><h2>Report</h2></div></div>';
    expect(inspectStyles(frame)).toMatchObject({
      '--facet-brand-blue': '#4f2965', '--text-xl': '18pt', theme: 'sample',
      'document font family': 'Georgia', 'document line height': '24px',
      'document background': 'rgb(255, 255, 255)', 'page size': 'letter', 'page margin left': '15',
    });
  } finally { sample.remove(); }
});
