import { json } from '@sveltejs/kit';
export function GET(){ return json({ok:true,service:'driftrecon',framework:'sveltekit'}); }
