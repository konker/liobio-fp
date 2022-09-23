import type * as P from '../prelude';

export function sleepTask(ms: number): P.Task<void> {
  return () => new Promise((resolve) => setTimeout(resolve, ms));
}
