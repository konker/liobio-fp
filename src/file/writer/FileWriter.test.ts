import { fromTaskEither } from 'ruins-ts';
import * as stream from 'stream';

import * as unit from './FileWriter';
import SpyInstance = jest.SpyInstance;

describe('FileWriter', () => {
  let stub1: SpyInstance;

  describe('write', () => {
    beforeEach(() => {
      stub1 = jest.spyOn(stream.PassThrough.prototype, 'write').mockImplementation((data: any, callback: any) => {
        if (data.includes('error')) {
          callback('ERROR');
          return false;
        } else {
          callback();
          return true;
        }
      });
    });

    afterEach(() => {
      stub1.mockClear();
    });

    it('should function correctly', async () => {
      const fp: stream.Writable = new stream.PassThrough();
      await fromTaskEither(unit.write(fp, 'ok'));

      expect(stub1).toHaveBeenCalledTimes(1);
    });

    it('should function correctly when an error occurs', async () => {
      const fp: stream.Writable = new stream.PassThrough();
      await expect(fromTaskEither(unit.write(fp, 'error'))).rejects.toThrow();
    });
  });
});
