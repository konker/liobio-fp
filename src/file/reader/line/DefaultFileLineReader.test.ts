import readline from 'readline';
import { fromEither, fromTask, fromTaskEither } from 'ruins-ts';
import { Readable } from 'stream';

import { fsDataAccessor } from '../../../accessor/appendable/FsDataAccessor';
import * as P from '../../../prelude';
import { defaultFileLineReader } from './DefaultFileLineReader';
import SpyInstance = jest.SpyInstance;

describe('FileReader', () => {
  let dataAccessor: any;
  let stub1: SpyInstance;

  describe('DefaultFileLineReader', () => {
    const TEST_S = 'foo\nbar\nbaz';
    const TEST_O = ['foo', 'bar', 'baz'];

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
      const fileReader = defaultFileLineReader();
      const buf = [];
      const fh = await fromTaskEither(fileReader.open(dataAccessor, '/foo/bar.ndjson'));
      for await (const rec of fh.gen) {
        buf.push(rec);
      }
      await fileReader.close(fh);
      const data = fromEither(P.pipe(buf, P.Array_.sequence(P.Either_.Applicative)));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.ndjson');
      expect(data).toStrictEqual(TEST_O);
    });
  });
});
