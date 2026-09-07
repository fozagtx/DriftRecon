import { json } from '@sveltejs/kit'; import { snapshot } from '@/lib/app/actions';
export async function GET(){ return json(await snapshot()); }
