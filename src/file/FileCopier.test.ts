import { fromTask, fromTaskEither } from 'ruins-ts';
import sinon from 'sinon';
import { PassThrough, Readable } from 'stream';

import { fsDataAccessor } from '../accessor/appendable/FsDataAccessor';
import type { DataAccessor } from '../accessor/DataAccessor';
import * as P from '../prelude';
import { PromiseDependentWritableStream } from '../stream/PromiseDependentWritableStream';
import { fileCopier } from './FileCopier';

describe('FileCopier', () => {
  const sandbox = sinon.createSandbox();
  let fromDataAccessor: DataAccessor;
  let toDataAccessor: DataAccessor;
  let stub1: sinon.SinonStub;
  let stub2: sinon.SinonStub;

  describe('FileCopier', () => {
    const TEST_S = '{"foo":"A","bar":123}';

    describe('With write stream', () => {
      beforeAll(async () => {
        fromDataAccessor = await fromTask(fsDataAccessor());
        toDataAccessor = await fromTask(fsDataAccessor());

        stub1 = sandbox.stub(fromDataAccessor, 'getFileReadStream').resolves(P.TaskEither_.of(Readable.from(TEST_S)));
        stub2 = sandbox.stub(toDataAccessor, 'getFileWriteStream').resolves(P.TaskEither_.of(new PassThrough()));
      });
      afterAll(() => {
        sandbox.restore();
      });

      it('should function correctly', async () => {
        const sizeWritten = await fromTaskEither(fileCopier(fromDataAccessor, 'foo.json', toDataAccessor, 'bar.json'));

        expect(stub1.calledOnce).toBe(true);
        expect(stub1.getCall(0).args[0]).toBe('foo.json');
        expect(stub2.calledOnce).toBe(true);
        expect(stub2.getCall(0).args[0]).toBe('bar.json');
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
        stub1 = sandbox.stub(fromDataAccessor, 'getFileReadStream').resolves(P.TaskEither_.of(Readable.from(TEST_S)));
        stub2 = sandbox.stub(toDataAccessor, 'getFileWriteStream').resolves(P.TaskEither_.of(writeStream));
      });
      afterAll(() => {
        sandbox.restore();
      });

      it('should function correctly', async () => {
        const sizeWritten = await fromTaskEither(fileCopier(fromDataAccessor, 'foo.json', toDataAccessor, 'bar.json'));

        expect(stub1.calledOnce).toBe(true);
        expect(stub1.getCall(0).args[0]).toBe('foo.json');
        expect(stub2.calledOnce).toBe(true);
        expect(stub2.getCall(0).args[0]).toBe('bar.json');
        expect(sizeWritten).toBe(21);
      });
    });
  });
});
