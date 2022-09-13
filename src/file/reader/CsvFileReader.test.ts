import { fromTask, fromTaskEither } from 'ruins-ts';
import sinon from 'sinon';
import { Readable } from 'stream';

import { fsDataAccessor } from '../../accessor/appendable/FsDataAccessor';
import * as P from '../../prelude';
import { csvFileReader } from './CsvFileReader';

describe('FileReader', () => {
  const sandbox = sinon.createSandbox();
  let dataAccessor: any;
  let stub1: sinon.SinonStub;

  describe('CsvFileReader', () => {
    const TEST_S = '"foo","bar"\n"A","123"\n"B","456"';
    const TEST_O = [
      ['foo', 'bar'],
      ['A', '123'],
      ['B', '456'],
    ];

    beforeEach(async () => {
      dataAccessor = await fromTask(fsDataAccessor());

      //[XXX:remove] sandbox.stub(dataAccessor, 'readFile').returns(P.TaskEither_.of(Buffer.from(TEST_S)));
      stub1 = sandbox.stub(dataAccessor, 'getFileReadStream').returns(P.TaskEither_.of(Readable.from(TEST_S)));
    });
    afterEach(() => {
      sandbox.restore();
    });

    it('should function correctly', async () => {
      const fileReader = csvFileReader({ delimiter: ',' });
      const data = await fromTaskEither(fileReader.read(dataAccessor, '/foo/bar.csv'));

      expect(stub1.calledOnce).toBe(true);
      expect(stub1.getCall(0).args[0]).toBe('/foo/bar.csv');
      expect(data).toStrictEqual(TEST_O);
    });
  });
});
