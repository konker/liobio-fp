import { fromTask, fromTaskEither } from 'ruins-ts';
import { PassThrough } from 'stream';

import { fsDataAccessor } from '../../../accessor/appendable/FsDataAccessor';
import * as P from '../../../prelude';
import { ndJsonFileWriter } from './NdJsonFileWriter';
import SpyInstance = jest.SpyInstance;

describe('FileReader', () => {
  let dataAccessor: any;
  let writeStream: any;
  let fileData: Array<string>;
  let stub1: SpyInstance;
  let stub2: SpyInstance;

  describe('NdJsonFileWriter', () => {
    const TEST_S = '{"foo":"A","bar":123}\n{"foo":"B","bar":456}\n';
    const TEST_O1 = { foo: 'A', bar: 123 };
    const TEST_O2 = { foo: 'B', bar: 456 };

    beforeEach(async () => {
      writeStream = new PassThrough();
      writeStream.on('data', (chunk: any) => fileData.push(chunk.toString()));

      dataAccessor = await fromTask(fsDataAccessor());
      stub1 = jest.spyOn(dataAccessor, 'getFileWriteStream').mockReturnValue(P.TaskEither_.of(writeStream));
      stub2 = jest.spyOn(dataAccessor, 'getFileAppendWriteStream').mockReturnValue(P.TaskEither_.of(writeStream));
    });
    afterEach(() => {
      stub1.mockClear();
      stub2.mockClear();
    });

    it('should function correctly', async () => {
      fileData = [];
      const fileWriter = ndJsonFileWriter();
      const fp = await fromTaskEither(fileWriter.open(dataAccessor, '/foo/bar.ndjson'));
      await fromTaskEither(fileWriter.write(fp, TEST_O1));
      await fromTaskEither(fileWriter.write(fp, TEST_O2));
      await fromTask(fileWriter.close(fp));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.ndjson');
      expect(fileData.join('')).toStrictEqual(TEST_S);
    });

    it('should function correctly for append', async () => {
      fileData = ['{"foo":"Z","bar":987}\n'];
      const fileWriter = ndJsonFileWriter();
      const fp = await fromTaskEither(fileWriter.openForAppend(dataAccessor, '/foo/bar.ndjson'));
      await fromTaskEither(fileWriter.write(fp, TEST_O1));
      await fromTaskEither(fileWriter.write(fp, TEST_O2));
      await fromTask(fileWriter.close(fp));

      expect(stub2).toHaveBeenCalledTimes(1);
      expect(stub2.mock.calls[0][0]).toBe('/foo/bar.ndjson');
      expect(fileData.join('')).toStrictEqual(`{"foo":"Z","bar":987}\n${TEST_S}`);
    });
  });
});
