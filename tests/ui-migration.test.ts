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
    expect(overview).toContain('{#if d.run}');
    expect(overview).toContain('<a href="/review"');
    expect(overview).toContain('{:else}');
    expect(overview).toContain('Open review queue');
  });

  it('provides accessible controls for the interactive money map', () => {
    const graph = readFileSync('src/routes/graph/+page.svelte', 'utf8');
    expect(graph).toContain('aria-label="Zoom in"');
    expect(graph).toContain('aria-label="Zoom out"');
    expect(graph).toContain('aria-label="Reset zoom"');
  });

  it('does not expose load-sample or a fake landing reconcile control', () => {
    const importPanel = readFileSync('src/lib/components/ImportPanel.svelte', 'utf8');
    const landing = readFileSync('src/routes/+page.svelte', 'utf8');
    expect(importPanel).not.toMatch(/\/api\/sample/);
    expect(importPanel).not.toMatch(/Reset to Acme|Load sample|Acme example/i);
    expect(importPanel).toContain('Run reconciliation');
    expect(importPanel).toContain('recon-overlay');
    expect(landing).not.toContain('product-shot');
    expect(landing).not.toMatch(/<button[^>]*>\s*Run reconciliation/);
  });
});
