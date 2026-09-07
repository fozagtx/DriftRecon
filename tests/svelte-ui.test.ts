import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const read = (path: string) => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');

describe('Svelte product UI', () => {
  it('keeps the GitHub action with the landing actions rather than floating over the demo', () => {
    const landing = read('src/routes/+page.svelte');
    expect(landing).toContain('View source');
    expect(landing).toContain('One clear workflow');
    expect(landing).not.toContain('absolute left-1/2');
  });

  it('puts import first and exposes one-click sample reconciliation', () => {
    const dashboard = read('src/routes/dashboard/+page.svelte');
    const panel = read('src/lib/components/ImportPanel.svelte');
    expect(dashboard.indexOf('<ImportPanel')).toBeLessThan(dashboard.indexOf('metrics'));
    expect(panel).toContain("request('/api/sample')");
    expect(panel).toContain('Loading and reconciling…');
  });

  it('renders the actual reconciliation edges instead of a sliced event preview', () => {
    const page = read('src/routes/graph/+page.svelte');
    const graph = read('src/lib/components/TransactionGraph.svelte');
    expect(page).toContain('edges={snapshot.edges}');
    expect(graph).toContain('edges.filter');
    expect(graph).toContain('edge.fromEventId');
    expect(graph).toContain('edge.toEventId');
    expect(graph).not.toContain('.slice(0,5)');
  });
});
