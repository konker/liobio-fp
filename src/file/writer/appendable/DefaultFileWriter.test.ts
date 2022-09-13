import { fromTask, fromTaskEither } from 'ruins-ts';
import sinon from 'sinon';
import { PassThrough } from 'stream';

import { fsDataAccessor } from '../../../accessor/appendable/FsDataAccessor';
import * as P from '../../../prelude';
import { defaultFileWriter } from './DefaultFileWriter';

describe('FileReader', () => {
  const sandbox = sinon.createSandbox();
  let dataAccessor: any;
  let writeStream: any;
  let fileData: Array<string>;
  let stub1: sinon.SinonStub;
  let stub2: sinon.SinonStub;

  describe('DefaultAppendableFileWriter', () => {
    const TEST_S = 'All Day I Dream About Sausages\nAfter Dinner I Did A Smelly';
    const TEST_O1 = 'All Day I Dream About Sausages\n';
    const TEST_O2 = Buffer.from('After Dinner I Did A Smelly');

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
      const fileWriter = defaultFileWriter();
      const fp = await fromTaskEither(fileWriter.open(dataAccessor, '/foo/bar.txt'));
      await fromTaskEither(fileWriter.write(fp, TEST_O1));
      await fromTaskEither(fileWriter.write(fp, TEST_O2));
      await fromTask(fileWriter.close(fp));

      expect(stub1.calledOnce).toBe(true);
      expect(stub1.getCall(0).args[0]).toBe('/foo/bar.txt');
      expect(fileData.join('')).toStrictEqual(TEST_S);
    });

    it('should function correctly for append', async () => {
      fileData = ['My append log\n'];
      const fileWriter = defaultFileWriter();
      const fp = await fromTaskEither(fileWriter.openForAppend(dataAccessor, '/foo/bar.txt'));
      await fromTaskEither(fileWriter.write(fp, TEST_O1));
      await fromTaskEither(fileWriter.write(fp, TEST_O2));
      await fromTask(fileWriter.close(fp));

      expect(stub2.calledOnce).toBe(true);
      expect(stub2.getCall(0).args[0]).toBe('/foo/bar.txt');
      expect(fileData.join('')).toStrictEqual(`My append log\n${TEST_S}`);
    });
  });
});
