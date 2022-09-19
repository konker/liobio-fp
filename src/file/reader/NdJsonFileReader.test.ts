import readline from 'readline';
import { fromTask, fromTaskEither } from 'ruins-ts';
import { Readable } from 'stream';

import { fsDataAccessor } from '../../accessor/appendable/FsDataAccessor';
import * as P from '../../prelude';
import { ndJsonFileReader } from './NdJsonFileReader';
import SpyInstance = jest.SpyInstance;

describe('FileReader', () => {
  let dataAccessor: any;
  let stub1: SpyInstance;

  describe('NdJsonFileReader', () => {
    const TEST_S = '{"foo":"A","bar":123}\n{"foo":"B","bar":456}';
    const TEST_O = [
      { foo: 'A', bar: 123 },
      { foo: 'B', bar: 456 },
    ];

    beforeEach(async () => {
      dataAccessor = await fromTask(fsDataAccessor());

      stub1 = jest.spyOn(dataAccessor, 'getFileLineReadStream').mockReturnValue(
        P.TaskEither_.of(
          readline.createInterface({
            input: Readable.from(TEST_S),
            historySize: 0,
            terminal: false,
            crlfDelay: Infinity,
            escapeCodeTimeout: 10000,
          })
        )
      );
    });
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      const fileReader = ndJsonFileReader();
      const data = await fromTaskEither(fileReader.read(dataAccessor, '/foo/bar.json'));
      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.json');
      expect(data).toStrictEqual(TEST_O);
    });
  });
});
