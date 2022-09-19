import { fromTask, fromTaskEither } from 'ruins-ts';
import { PassThrough } from 'stream';

import { fsDataAccessor } from '../../../accessor/appendable/FsDataAccessor';
import * as P from '../../../prelude';
import { defaultFileWriter } from './DefaultFileWriter';
import SpyInstance = jest.SpyInstance;

describe('FileReader', () => {
  let dataAccessor: any;
  let writeStream: any;
  let fileData: Array<string>;
  let stub1: SpyInstance;
  let stub2: SpyInstance;

  describe('DefaultAppendableFileWriter', () => {
    const TEST_S = 'All Day I Dream About Sausages\nAfter Dinner I Did A Smelly';
    const TEST_O1 = 'All Day I Dream About Sausages\n';
    const TEST_O2 = Buffer.from('After Dinner I Did A Smelly');

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
      const fileWriter = defaultFileWriter();
      const fp = await fromTaskEither(fileWriter.open(dataAccessor, '/foo/bar.txt'));
      await fromTaskEither(fileWriter.write(fp, TEST_O1));
      await fromTaskEither(fileWriter.write(fp, TEST_O2));
      await fromTask(fileWriter.close(fp));

      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.txt');
      expect(fileData.join('')).toStrictEqual(TEST_S);
    });

    it('should function correctly for append', async () => {
      fileData = ['My append log\n'];
      const fileWriter = defaultFileWriter();
      const fp = await fromTaskEither(fileWriter.openForAppend(dataAccessor, '/foo/bar.txt'));
      await fromTaskEither(fileWriter.write(fp, TEST_O1));
      await fromTaskEither(fileWriter.write(fp, TEST_O2));
      await fromTask(fileWriter.close(fp));

      expect(stub2).toHaveBeenCalledTimes(1);
      expect(stub2.mock.calls[0][0]).toBe('/foo/bar.txt');
      expect(fileData.join('')).toStrictEqual(`My append log\n${TEST_S}`);
    });
  });
});
