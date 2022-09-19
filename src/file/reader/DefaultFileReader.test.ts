import { fromTask, fromTaskEither } from 'ruins-ts';

import { fsDataAccessor } from '../../accessor/appendable/FsDataAccessor';
import * as P from '../../prelude';
import { defaultFileReader } from './DefaultFileReader';
import SpyInstance = jest.SpyInstance;

describe('FileReader', () => {
  let dataAccessor: any;
  let stub1: SpyInstance;

  describe('DefaultFileReader', () => {
    const TEST_S = 'The quick brown fox';

    beforeEach(async () => {
      dataAccessor = await fromTask(fsDataAccessor());

      stub1 = jest.spyOn(dataAccessor, 'readFile').mockReturnValue(P.TaskEither_.of(Buffer.from(TEST_S)));
    });
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      const fileReader = defaultFileReader();
      const data = await fromTaskEither(fileReader.read(dataAccessor, '/foo/bar.txt'));
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.txt');
      expect(stub1).toHaveBeenCalledTimes(1);
      expect(data.toString()).toStrictEqual(TEST_S);
    });
  });
});
