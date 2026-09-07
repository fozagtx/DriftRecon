import { emptySnapshot, loadSampleDataset, reconcile } from '../../../../lib/app/actions';
export async function POST(){try{await loadSampleDataset();return Response.json(await reconcile())}catch(e){return Response.json(emptySnapshot(e instanceof Error?e.message:'Sample load failed'),{status:503})}}
