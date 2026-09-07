import { json } from '@sveltejs/kit'; import { emptySnapshot,loadSampleDataset,snapshot } from '@/lib/app/actions';
export async function POST(){try{await loadSampleDataset();return json(await snapshot())}catch(e){return json(emptySnapshot(e instanceof Error?e.message:'Sample load failed'),{status:503})}}
