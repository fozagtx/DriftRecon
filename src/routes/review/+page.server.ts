import { snapshot } from '../../../lib/app/actions';
export const load = async () => ({ snapshot: await snapshot() });
