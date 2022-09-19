import { fromTask, fromTaskEither } from 'ruins-ts';

import { fsDataAccessor } from '../../accessor/appendable/FsDataAccessor';
import * as P from '../../prelude';
import { jsonFileReader } from './JsonFileReader';
import SpyInstance = jest.SpyInstance;

describe('FileReader', () => {
  let dataAccessor: any;
  let stub1: SpyInstance;

  describe('JsonFileReader', () => {
    const TEST_S = '{"foo":"A","bar":123}';
    const TEST_O = { foo: 'A', bar: 123 };

    beforeEach(async () => {
      dataAccessor = await fromTask(fsDataAccessor());

      stub1 = jest.spyOn(dataAccessor, 'readFile').mockReturnValue(P.TaskEither_.of(Buffer.from(TEST_S)));
    });
    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      const fileReader = jsonFileReader();
      const data = await fromTaskEither(fileReader.read(dataAccessor, '/foo/bar.json'));
      expect(stub1).toHaveBeenCalledTimes(1);
      expect(stub1.mock.calls[0][0]).toBe('/foo/bar.json');
      expect(data).toStrictEqual(TEST_O);
    });
  });
});
