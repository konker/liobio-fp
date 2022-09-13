import { fromTask, fromTaskEither } from 'ruins-ts';
import sinon from 'sinon';

import { fsDataAccessor } from '../../accessor/appendable/FsDataAccessor';
import * as P from '../../prelude';
import { defaultFileReader } from './DefaultFileReader';

describe('FileReader', () => {
  const sandbox = sinon.createSandbox();
  let dataAccessor: any;
  let stub1: sinon.SinonStub;

  describe('DefaultFileReader', () => {
    const TEST_S = 'The quick brown fox';

    beforeEach(async () => {
      dataAccessor = await fromTask(fsDataAccessor());

      stub1 = sandbox.stub(dataAccessor, 'readFile').returns(P.TaskEither_.of(Buffer.from(TEST_S)));
    });
    afterEach(() => {
      sandbox.restore();
    });

    it('should function correctly', async () => {
      const fileReader = defaultFileReader();
      const data = await fromTaskEither(fileReader.read(dataAccessor, '/foo/bar.txt'));
      expect(stub1.getCall(0).args[0]).toBe('/foo/bar.txt');
      expect(stub1.calledOnce).toBe(true);
      expect(data.toString()).toStrictEqual(TEST_S);
    });
  });
});
