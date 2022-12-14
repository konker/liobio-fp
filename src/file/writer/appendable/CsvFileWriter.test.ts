import { fromTask, fromTaskEither } from 'ruins-ts';
import { PassThrough } from 'stream';

import { fsDataAccessor } from '../../../accessor/appendable/FsDataAccessor';
import * as P from '../../../prelude';
import { csvFileWriter } from './CsvFileWriter';
import SpyInstance = jest.SpyInstance;

describe('FileReader', () => {
  let dataAccessor: any;
  let writeStream: any;
  let fileData: Array<string>;
  let stub1: SpyInstance;
  let stub2: SpyInstance;

  describe('CsvFileWriter', () => {
    const TEST_S = 'foo,bar\nA,123\n';
    const TEST_O1 = ['foo', 'bar'];
    const TEST_O2 = ['A', 123];

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
      const fileWriter = csvFileWriter({ delimiter: ',', quoted: false });
      const fp = await fromTaskEither(fileWriter.open(dataAccessor, '/foo/bar.csv'));
      await fromTaskEither(fileWriter.write(fp, TEST_O1));
      await fromTaskEither(fileWriter.write(fp, TEST_O2));
      await fromTask(fileWriter.close(fp));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.csv');
      expect(fileData.join('')).toStrictEqual(TEST_S);
    });

    it('should function correctly for append', async () => {
      fileData = ['Z,987\n'];
      const fileWriter = csvFileWriter({ delimiter: ',', quoted: false });
      const fp = await fromTaskEither(fileWriter.openForAppend(dataAccessor, '/foo/bar.csv'));
      await fromTaskEither(fileWriter.write(fp, TEST_O1));
      await fromTaskEither(fileWriter.write(fp, TEST_O2));
      await fromTask(fileWriter.close(fp));

      expect(stub2).toHaveBeenCalledTimes(1);
      expect(stub2.mock.calls[0][0]).toBe('/foo/bar.csv');
      expect(fileData.join('')).toStrictEqual(`Z,987\n${TEST_S}`);
    });
  });
});
