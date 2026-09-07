import { json } from '@sveltejs/kit'; import { emptySnapshot,reconcile } from '@/lib/app/actions';
export async function POST(){try{return json(await reconcile())}catch(e){return json(emptySnapshot(e instanceof Error?e.message:'Reconcile failed'),{status:503})}}
