/** Normal declarations: dependencies first, derived libraries next, utilities last. */
export function cascadeOrder(layers: string[] = ['components', 'facet']): string {
  const ordered = [...new Set(layers)];
  for (const layer of ordered) if (!/^[a-zA-Z_][\w-]*$/.test(layer) || ['theme', 'base', 'utilities'].includes(layer)) throw new Error(`Invalid library cascade layer: ${layer}`);
  return `@layer theme, base, ${ordered.join(', ')}, utilities;`;
}

export const layerOrder = cascadeOrder();

export function inspectStyles(document: Document): Record<string, string> {
  const view = document.defaultView;
  if (!view) throw new Error('Style inspection requires a live document');
  const root = view.getComputedStyle(document.documentElement);
  const heading = document.querySelector('h2');
  return {
    order: [...document.querySelectorAll('style')].map(style => style.textContent?.match(/@layer\s+[^{};]+;/)?.[0]).find(Boolean) ?? 'No explicit layer order',
    theme: document.querySelector('[data-facet-theme]')?.getAttribute('data-facet-theme') ?? 'facet',
    '--text-xl': root.getPropertyValue('--text-xl').trim(),
    '--text-sm': root.getPropertyValue('--text-sm').trim(),
    'body font size': view.getComputedStyle(document.body).fontSize,
    'document font size': view.getComputedStyle(document.querySelector('[data-facet-theme]') ?? document.body).fontSize,
    'heading font size': heading ? view.getComputedStyle(heading).fontSize : 'No h2',
    stylesheets: [...document.querySelectorAll('[data-page-runtime-base]')].map(style => style.getAttribute('data-page-runtime-base')).join('\n'),
  };
}
