import { fromTask, fromTaskEither } from 'ruins-ts';
import { Readable } from 'stream';

import { fsDataAccessor } from '../../accessor/appendable/FsDataAccessor';
import * as P from '../../prelude';
import { csvFileReader } from './CsvFileReader';
import SpyInstance = jest.SpyInstance;

describe('FileReader', () => {
  let dataAccessor: any;
  let stub1: SpyInstance;

  describe('CsvFileReader', () => {
    const TEST_S = '"foo","bar"\n"A","123"\n"B","456"';
    const TEST_O = [
      ['foo', 'bar'],
      ['A', '123'],
      ['B', '456'],
    ];

    beforeEach(async () => {
      dataAccessor = await fromTask(fsDataAccessor());

      stub1 = jest.spyOn(dataAccessor, 'getFileReadStream').mockReturnValue(P.TaskEither_.of(Readable.from(TEST_S)));
    });
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      const fileReader = csvFileReader({ delimiter: ',' });
      const data = await fromTaskEither(fileReader.read(dataAccessor, '/foo/bar.csv'));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.csv');
      expect(data).toStrictEqual(TEST_O);
    });
  });
});
