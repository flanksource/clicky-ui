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
  const body = view.getComputedStyle(document.body);
  const documentRoot = document.querySelector('[data-facet-theme]') ?? document.body;
  const documentStyle = view.getComputedStyle(documentRoot);
  const heading = document.querySelector('h2');
  const page = documentRoot.querySelector('[data-page-size]');
  return {
    order: [...document.querySelectorAll('style')].map(style => style.textContent?.match(/@layer\s+[^{};]+;/)?.[0]).find(Boolean) ?? 'No explicit layer order',
    theme: documentRoot.getAttribute('data-facet-theme') ?? 'facet',
    '--text-xl': root.getPropertyValue('--text-xl').trim(),
    '--text-sm': root.getPropertyValue('--text-sm').trim(),
    ...Object.fromEntries([...new Set([...Array.from(root), ...Array.from(documentStyle)])]
      .filter(name => /^--(?:facet|text)-/.test(name))
      .map(name => [name, (documentStyle.getPropertyValue(name) || root.getPropertyValue(name)).trim()])),
    'body font size': body.fontSize,
    'document font size': documentStyle.fontSize,
    'document font family': documentStyle.fontFamily,
    'document line height': documentStyle.lineHeight,
    'document text color': documentStyle.color,
    'document background': documentStyle.backgroundColor === 'rgba(0, 0, 0, 0)' ? body.backgroundColor : documentStyle.backgroundColor,
    'heading font size': heading ? view.getComputedStyle(heading).fontSize : 'No h2',
    ...(page ? {
      'page size': page.getAttribute('data-page-size') ?? '',
      ...Object.fromEntries(['top', 'right', 'bottom', 'left'].map(side => [`page margin ${side}`, page.getAttribute(`data-margin-${side}`) ?? ''])),
    } : {}),
    stylesheets: [...document.querySelectorAll('[data-page-runtime-base]')].map(style => style.getAttribute('data-page-runtime-base')).join('\n'),
  };
}
