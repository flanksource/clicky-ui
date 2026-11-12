import { describe, expect, it } from 'vitest';
import { cascadeOrder } from './styles.ts';
describe('cascade order', () => {
  it('keeps child themes after their parents and before utilities', () => {
    expect(cascadeOrder(['components', 'facet', 'example', 'example'])).toBe('@layer theme, base, components, facet, example, utilities;');
  });
  it.each(['bad;layer', 'utilities', ''])('rejects invalid library layer %s', layer => {
    expect(() => cascadeOrder([layer])).toThrow('Invalid library cascade layer');
  });
});
