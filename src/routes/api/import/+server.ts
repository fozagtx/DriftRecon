import { json } from '@sveltejs/kit';
import { emptySnapshot, importUploads, snapshot } from '@/lib/app/actions';
import { isJudgePack, judgePackToUploads } from '@/lib/ingestion/judge-pack';
import type { Source } from '@/lib/types';

type Kind = Source | 'groundTruth';

function truth(text: string) {
  try {
    const parsed: unknown = JSON.parse(text);
    return Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === 'object' && parsed[0] !== null && 'fromEventId' in parsed[0];
  } catch {
    return false;
  }
}

function classify(name: string, text: string): Kind {
  const n = name.toLowerCase();
  const t = text.trim();
  const h = (t.split(/\r?\n/, 1)[0] ?? '').toLowerCase();
  if (n.includes('truth') || h.includes('fromeventid') || truth(t)) return 'groundTruth';
  if (n.includes('dodo')) return 'dodo';
  if (n.endsWith('.json') || t.startsWith('{') || t.startsWith('[')) return 'dodo';
  if (n.includes('gumroad') || h.includes('sale_id') || h.includes('email')) return 'gumroad';
  if (n.includes('bank') || n.includes('chase') || (h.includes('reference') && !h.includes('type'))) return 'bank';
  return 'stripe';
}

function parseJson(text: string): unknown {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function POST({ request }) {
  try {
    const form = await request.formData();
    const uploads: Partial<Record<Kind, string>> = {};
    for (const value of form.getAll('files')) {
      if (!(value instanceof File) || !value.size) continue;
      const text = await value.text();
      const parsed = parseJson(text);
      if (isJudgePack(parsed)) {
        for (const item of judgePackToUploads(parsed)) {
          uploads[classify(item.filename, item.content)] = item.content;
        }
        continue;
      }
      uploads[classify(value.name, text)] = text;
    }
    await importUploads(uploads);
    return json(await snapshot());
  } catch (e) {
    return json(emptySnapshot(e instanceof Error ? e.message : 'Import failed'), { status: 400 });
  }
}
