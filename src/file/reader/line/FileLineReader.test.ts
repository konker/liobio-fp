import { fromTask } from 'ruins-ts';

import * as unit from './FileLineReader';

describe('FileReader', () => {
  describe('FileLineReader', () => {
    it('close should function correctly', async () => {
      const mockHandle = {
        fp: {
          close: jest.fn(),
        },
      } as unknown as unit.FileLineReaderHandle<number>;
      fromTask(unit.close(mockHandle));
      expect(mockHandle.fp.close).toHaveBeenCalledTimes(1);
    });
  });
});
