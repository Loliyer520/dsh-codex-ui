import { apply as applyPromptModes } from '../src/prompt-modes.js';
import { registerBalance } from '../src/api-balance.js';
export { inject } from '../src/prompt-modes.js';
export async function apply(ctx) {
  await applyPromptModes(ctx);
  registerBalance(ctx);
}
