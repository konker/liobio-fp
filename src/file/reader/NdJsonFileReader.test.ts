import readline from 'readline';
import { fromTask, fromTaskEither } from 'ruins-ts';
import sinon from 'sinon';
import { Readable } from 'stream';

import { fsDataAccessor } from '../../accessor/appendable/FsDataAccessor';
import * as P from '../../prelude';
import { ndJsonFileReader } from './NdJsonFileReader';

describe('FileReader', () => {
  const sandbox = sinon.createSandbox();
  let dataAccessor: any;
  let stub1: sinon.SinonStub;

  describe('NdJsonFileReader', () => {
    const TEST_S = '{"foo":"A","bar":123}\n{"foo":"B","bar":456}';
    const TEST_O = [
      { foo: 'A', bar: 123 },
      { foo: 'B', bar: 456 },
    ];

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
      const fileReader = ndJsonFileReader();
      const data = await fromTaskEither(fileReader.read(dataAccessor, '/foo/bar.json'));
      expect(stub1.calledOnce).toBe(true);
      expect(stub1.getCall(0).args[0]).toBe('/foo/bar.json');
      expect(data).toStrictEqual(TEST_O);
    });
  });
});
