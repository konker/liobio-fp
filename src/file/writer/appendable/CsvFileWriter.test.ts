import { fromTask, fromTaskEither } from 'ruins-ts';
import sinon from 'sinon';
import { PassThrough } from 'stream';

import { fsDataAccessor } from '../../../accessor/appendable/FsDataAccessor';
import * as P from '../../../prelude';
import { csvFileWriter } from './CsvFileWriter';

describe('FileReader', () => {
  const sandbox = sinon.createSandbox();
  let dataAccessor: any;
  let writeStream: any;
  let fileData: Array<string>;
  let stub1: sinon.SinonStub;
  let stub2: sinon.SinonStub;

  describe('CsvFileWriter', () => {
    const TEST_S = 'foo,bar\nA,123\n';
    const TEST_O1 = ['foo', 'bar'];
    const TEST_O2 = ['A', 123];

    beforeEach(async () => {
      writeStream = new PassThrough();
      writeStream.on('data', (chunk: any) => fileData.push(chunk.toString()));

      dataAccessor = await fromTask(fsDataAccessor());
      stub1 = sandbox.stub(dataAccessor, 'getFileWriteStream').returns(P.TaskEither_.of(writeStream));
      stub2 = sandbox.stub(dataAccessor, 'getFileAppendWriteStream').returns(P.TaskEither_.of(writeStream));
    });
    afterEach(() => {
      sandbox.restore();
    });

    it('should function correctly', async () => {
      fileData = [];
      const fileWriter = csvFileWriter({ delimiter: ',', quoted: false });
      const fp = await fromTaskEither(fileWriter.open(dataAccessor, '/foo/bar.csv'));
      await fromTaskEither(fileWriter.write(fp, TEST_O1));
      await fromTaskEither(fileWriter.write(fp, TEST_O2));
      await fromTask(fileWriter.close(fp));

      expect(stub1.calledOnce).toBe(true);
      expect(stub1.getCall(0).args[0]).toBe('/foo/bar.csv');
      expect(fileData.join('')).toStrictEqual(TEST_S);
    });

    it('should function correctly for append', async () => {
      fileData = ['Z,987\n'];
      const fileWriter = csvFileWriter({ delimiter: ',', quoted: false });
      const fp = await fromTaskEither(fileWriter.openForAppend(dataAccessor, '/foo/bar.csv'));
      await fromTaskEither(fileWriter.write(fp, TEST_O1));
      await fromTaskEither(fileWriter.write(fp, TEST_O2));
      await fromTask(fileWriter.close(fp));

      expect(stub2.calledOnce).toBe(true);
      expect(stub2.getCall(0).args[0]).toBe('/foo/bar.csv');
      expect(fileData.join('')).toStrictEqual(`Z,987\n${TEST_S}`);
    });
  });
});
