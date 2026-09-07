import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

describe('SvelteKit interface', () => {
  it('declares SvelteKit as the application runtime', () => {
    const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
    expect(pkg.scripts.dev).toBe('vite dev');
    expect(pkg.dependencies.svelte).toBeTruthy();
    expect(pkg.dependencies.next).toBeUndefined();
    expect(pkg.dependencies.react).toBeUndefined();
  });

  it('keeps a non-navigable review action before reconciliation', () => {
    const overview = readFileSync('src/routes/dashboard/+page.svelte', 'utf8');
    expect(overview).toContain('{#if d.run}<a href="/review"');
    expect(overview).toContain('{:else}<div>Open review');
  });

  it('provides accessible controls for the interactive money map', () => {
    const graph = readFileSync('src/routes/graph/+page.svelte', 'utf8');
    expect(graph).toContain('aria-label="Zoom in"');
    expect(graph).toContain('aria-label="Zoom out"');
    expect(graph).toContain('aria-label="Reset zoom"');
  });
});
