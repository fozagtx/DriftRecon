import { json } from '@sveltejs/kit';
import { activateRun } from '@/lib/app/actions';
import { activateRunSchema } from '@/lib/schemas';

export async function POST({ request }) {
  const parsed = activateRunSchema.safeParse(await request.json());
  if (!parsed.success) return json({ error: parsed.error.flatten() }, { status: 400 });
  try {
    return json(await activateRun(parsed.data.runId));
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : 'Could not open run' }, { status: 400 });
  }
}
