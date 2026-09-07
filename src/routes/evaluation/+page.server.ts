import { snapshot } from '@/lib/app/actions';
export async function load(){ return { snapshot: await snapshot() }; }
