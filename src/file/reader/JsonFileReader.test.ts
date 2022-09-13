import { fromTask, fromTaskEither } from 'ruins-ts';
import sinon from 'sinon';

import { fsDataAccessor } from '../../accessor/appendable/FsDataAccessor';
import * as P from '../../prelude';
import { jsonFileReader } from './JsonFileReader';

describe('FileReader', () => {
  const sandbox = sinon.createSandbox();
  let dataAccessor: any;
  let stub1: sinon.SinonStub;

  describe('JsonFileReader', () => {
    const TEST_S = '{"foo":"A","bar":123}';
    const TEST_O = { foo: 'A', bar: 123 };

    beforeEach(async () => {
      dataAccessor = await fromTask(fsDataAccessor());

      stub1 = sandbox.stub(dataAccessor, 'readFile').returns(P.TaskEither_.of(Buffer.from(TEST_S)));
    });
    afterEach(() => {
      sandbox.restore();
    });

    it('should function correctly', async () => {
      const fileReader = jsonFileReader();
      const data = await fromTaskEither(fileReader.read(dataAccessor, '/foo/bar.json'));
      expect(stub1.calledOnce).toBe(true);
      expect(stub1.getCall(0).args[0]).toBe('/foo/bar.json');
      expect(data).toStrictEqual(TEST_O);
    });
  });
});
