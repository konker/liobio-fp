import { fromTask, fromTaskEither } from 'ruins-ts';
import { PassThrough } from 'stream';

import { fsDataAccessor } from '../../accessor/appendable/FsDataAccessor';
import * as P from '../../prelude';
import { jsonFileWriter } from './JsonFileWriter';
import SpyInstance = jest.SpyInstance;

describe('FileWriter', () => {
  let dataAccessor: any;
  let writeStream: any;
  let fileData: Array<string>;
  let stub1: SpyInstance;

  describe('JsonFileWriter', () => {
    const TEST_S = '{"foo":"A","bar":123}';
    const TEST_O = { foo: 'A', bar: 123 };

    beforeEach(async () => {
      writeStream = new PassThrough();
      writeStream.on('data', (chunk: any) => {
        fileData.push(String(chunk));
      });

      dataAccessor = await fromTask(fsDataAccessor());
      stub1 = jest.spyOn(dataAccessor, 'getFileWriteStream').mockReturnValue(P.TaskEither_.of(writeStream));
    });
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      fileData = [];
      const fileWriter = jsonFileWriter();
      const fp = await fromTaskEither(fileWriter.open(dataAccessor, '/foo/bar.json'));
      await fromTaskEither(fileWriter.write(fp, TEST_O));
      await fromTask(fileWriter.close(fp));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.json');
      expect(fileData).toStrictEqual([TEST_S]);
    });
  });
});
