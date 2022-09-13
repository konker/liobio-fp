import readline from 'readline';
import { fromTask, fromTaskEither } from 'ruins-ts';
import sinon from 'sinon';
import { Readable } from 'stream';

import { fsDataAccessor } from '../../../accessor/appendable/FsDataAccessor';
import * as P from '../../../prelude';
import { defaultFileLineReader } from './DefaultFileLineReader';

describe('FileReader', () => {
  const sandbox = sinon.createSandbox();
  let dataAccessor: any;
  let stub1: sinon.SinonStub;

  describe('DefaultFileLineReader', () => {
    const TEST_S = 'foo\nbar\nbaz';
    const TEST_O = ['foo', 'bar', 'baz'];

    beforeEach(async () => {
      dataAccessor = await fromTask(fsDataAccessor());
      stub1 = sandbox.stub(dataAccessor, 'getFileLineReadStream').returns(
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
      sandbox.restore();
    });

    it('should function correctly', async () => {
      const fileReader = defaultFileLineReader();
      const data = [];
      const fh = await fromTaskEither(fileReader.open(dataAccessor, '/foo/bar.ndjson'));
      for await (const rec of fh.gen) {
        data.push(rec);
      }
      await fileReader.close(fh);

      expect(stub1.calledOnce).toBe(true);
      expect(stub1.getCall(0).args[0]).toBe('/foo/bar.ndjson');
      expect(data).toStrictEqual(TEST_O);
    });
  });
});
