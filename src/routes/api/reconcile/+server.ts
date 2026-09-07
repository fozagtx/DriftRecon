import { emptySnapshot,reconcile } from '../../../../lib/app/actions';
export async function POST(){try{return Response.json(await reconcile())}catch(e){return Response.json(emptySnapshot(e instanceof Error?e.message:'Reconcile failed'),{status:503})}}
