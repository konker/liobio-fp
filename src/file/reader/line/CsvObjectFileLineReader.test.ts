import readline from 'readline';
import { fromTask, fromTaskEither } from 'ruins-ts';
import sinon from 'sinon';
import { Readable } from 'stream';

import { fsDataAccessor } from '../../../accessor/appendable/FsDataAccessor';
import * as P from '../../../prelude';
import { csvObjectFileLineReader } from './CsvObjectFileLineReader';

describe('FileReader', () => {
  const sandbox = sinon.createSandbox();
  let dataAccessor: any;
  let stub1: sinon.SinonStub;

  describe('CsvObjectFileLineReader', () => {
    const TEST_S = '"foo","bar"\n"A","123"\n"B","456"';
    const TEST_O = [
      { foo: 'A', bar: '123' },
      { foo: 'B', bar: '456' },
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
      const fileReader = csvObjectFileLineReader({ delimiter: ',' });
      const data = [];
      const fh = await fromTaskEither(fileReader.open(dataAccessor, '/foo/bar.csv'));
      for await (const rec of fh.gen) {
        data.push(rec);
      }
      await fileReader.close(fh);

      expect(stub1.calledOnce).toBe(true);
      expect(stub1.getCall(0).args[0]).toBe('/foo/bar.csv');
      expect(data).toStrictEqual(TEST_O);
    });
  });
});
