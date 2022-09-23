import * as unit from './error';

describe('utils/error', () => {
  describe('toLibError', () => {
    it('should function as expected', () => {
      const s = 'STR_ERROR';
      const e = new Error(s);

      expect(unit.toLibError(s)).toStrictEqual({
        message: s,
        cause: s,
      });
      expect(unit.toLibError(e)).toStrictEqual({
        message: s,
        cause: e,
      });
    });
  });
});
