import * as unit from './index';

describe('utils/error', () => {
  describe('sleepTask', () => {
    it('should work as expected', async () => {
      const t0 = 1500;
      const d0 = Date.now();
      await unit.sleepTask(t0)();
      const t1 = Date.now() - d0;

      // Result is accurate to +/- 10ms
      expect(Math.abs(t1 - t0)).toBeLessThan(10);
    });
  });
});
