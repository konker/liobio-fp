import { fromTask, fromTaskEither } from 'ruins-ts';
import sinon from 'sinon';
import { PassThrough } from 'stream';

import { fsDataAccessor } from '../../accessor/appendable/FsDataAccessor';
import * as P from '../../prelude';
import { jsonFileWriter } from './JsonFileWriter';

describe('FileWriter', () => {
  const sandbox = sinon.createSandbox();
  let dataAccessor: any;
  let writeStream: any;
  let fileData: Array<string>;
  let stub1: sinon.SinonStub;

  describe('JsonFileWriter', () => {
    const TEST_S = '{"foo":"A","bar":123}';
    const TEST_O = { foo: 'A', bar: 123 };

    beforeEach(async () => {
      writeStream = new PassThrough();
      writeStream.on('data', (chunk: any) => {
        fileData.push(String(chunk));
      });

      dataAccessor = await fromTask(fsDataAccessor());
      stub1 = sandbox.stub(dataAccessor, 'getFileWriteStream').returns(P.TaskEither_.of(writeStream));
    });
    afterEach(() => {
      sandbox.restore();
    });

    it('should function correctly', async () => {
      fileData = [];
      const fileWriter = jsonFileWriter();
      const fp = await fromTaskEither(fileWriter.open(dataAccessor, '/foo/bar.json'));
      await fromTaskEither(fileWriter.write(fp, TEST_O));
      await fromTask(fileWriter.close(fp));

      expect(stub1.calledOnce).toBe(true);
      expect(stub1.getCall(0).args[0]).toBe('/foo/bar.json');
      expect(fileData).toStrictEqual([TEST_S]);
    });
  });
});
