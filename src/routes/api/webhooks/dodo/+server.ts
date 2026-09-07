import { json } from '@sveltejs/kit';import {ingestDodoEvent} from '@/lib/app/actions';
export async function POST({request}){try{const result=await ingestDodoEvent(await request.json());return json({ok:true,events:result.events.length,invalidRows:result.invalidRows.length})}catch(e){return json({ok:false,error:e instanceof Error?e.message:'Invalid webhook'},{status:400})}}
