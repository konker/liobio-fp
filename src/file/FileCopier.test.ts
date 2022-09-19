import { fromTask, fromTaskEither } from 'ruins-ts';
import { PassThrough, Readable } from 'stream';

import { fsDataAccessor } from '../accessor/appendable/FsDataAccessor';
import type { DataAccessor } from '../accessor/DataAccessor';
import * as P from '../prelude';
import { PromiseDependentWritableStream } from '../stream/PromiseDependentWritableStream';
import { fileCopier } from './FileCopier';
import SpyInstance = jest.SpyInstance;

describe('FileCopier', () => {
  let fromDataAccessor: DataAccessor;
  let toDataAccessor: DataAccessor;
  let stub1: SpyInstance;
  let stub2: SpyInstance;

  describe('FileCopier', () => {
    const TEST_S = '{"foo":"A","bar":123}';

    describe('With write stream', () => {
      beforeAll(async () => {
        fromDataAccessor = await fromTask(fsDataAccessor());
        toDataAccessor = await fromTask(fsDataAccessor());

        stub1 = jest
          .spyOn(fromDataAccessor, 'getFileReadStream')
          .mockReturnValue(P.TaskEither_.of(Readable.from(TEST_S)));
        stub2 = jest.spyOn(toDataAccessor, 'getFileWriteStream').mockReturnValue(P.TaskEither_.of(new PassThrough()));
      });
      afterAll(() => {
        stub1.mockClear();
        stub2.mockClear();
      });

      it('should function correctly', async () => {
        const sizeWritten = await fromTaskEither(fileCopier(fromDataAccessor, 'foo.json', toDataAccessor, 'bar.json'));

        expect(stub1).toHaveBeenCalledTimes(1);
        expect(stub1.mock.calls[0][0]).toBe('foo.json');
        expect(stub2).toHaveBeenCalledTimes(1);
        expect(stub2.mock.calls[0][0]).toBe('bar.json');
        expect(sizeWritten).toBe(21);
      });
    });

    describe('With Promise dependent stream', () => {
      beforeAll(async () => {
        const writeStream = new PromiseDependentWritableStream();
        writeStream.promise = new Promise((resolve) => {
          writeStream.on('finish', resolve);
        });
        fromDataAccessor = await fromTask(fsDataAccessor());
        toDataAccessor = await fromTask(fsDataAccessor());

        stub1 = jest
          .spyOn(fromDataAccessor, 'getFileReadStream')
          .mockReturnValue(P.TaskEither_.of(Readable.from(TEST_S)));
        stub2 = jest.spyOn(toDataAccessor, 'getFileWriteStream').mockReturnValue(P.TaskEither_.of(writeStream));
      });
      afterAll(() => {
        stub1.mockClear();
        stub2.mockClear();
      });

      it('should function correctly', async () => {
        const sizeWritten = await fromTaskEither(fileCopier(fromDataAccessor, 'foo.json', toDataAccessor, 'bar.json'));

        expect(stub1).toHaveBeenCalledTimes(1);
        expect(stub1.mock.calls[0][0]).toBe('foo.json');
        expect(stub2).toHaveBeenCalledTimes(1);
        expect(stub2.mock.calls[0][0]).toBe('bar.json');
        expect(sizeWritten).toBe(21);
      });
    });
  });
});
