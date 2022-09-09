import fs from 'fs';
import readline from 'readline';
import { PassThrough, Readable, Writable } from 'stream';
import { FileType } from '../DataAccessor';
import { fsDataAccessor } from './FsDataAccessor';
import sinon from 'sinon';
import { AppendableDataAccessor } from './AppendableDataAccessor';
import { fromTask, fromTaskEither, fromTaskOption } from 'ruins-ts';

describe('DataAccessor', () => {
  const sandbox = sinon.createSandbox();
  let dataAccessor: AppendableDataAccessor;

  beforeAll(async () => {
    dataAccessor = await fromTask(fsDataAccessor());
  });

  describe('FsDataAccessor', () => {
    describe('ID', () => {
      it('should work as expected', () => {
        expect(dataAccessor.ID).toBe('FsDataAccessor');
      });
    });

    describe('listFiles', () => {
      let stub1: sinon.SinonStub;
      beforeEach(() => {
        stub1 = sandbox.stub(fs.promises, 'readdir').resolves(['test-file.txt'] as any);
      });
      afterEach(() => {
        stub1.restore();
      });

      it('should function correctly', async () => {
        const files = await fromTaskEither(dataAccessor.listFiles('./foo/bar'));
        expect(stub1.calledOnce).toBe(true);
        expect(files[0]).toBe('foo/bar/test-file.txt');
      });

      it('should function correctly', async () => {
        const files = await fromTaskEither(dataAccessor.listFiles('foo/bar'));
        expect(stub1.calledOnce).toBe(true);
        expect(files[0]).toBe('foo/bar/test-file.txt');
      });

      it('should function correctly', async () => {
        const files = await fromTaskEither(dataAccessor.listFiles('/foo/bar'));
        expect(stub1.calledOnce).toBe(true);
        expect(files[0]).toBe('/foo/bar/test-file.txt');
      });
    });

    describe('getFileType', () => {
      let stub1: sinon.SinonStub;
      afterEach(() => {
        stub1.restore();
      });

      it('should function correctly', async () => {
        stub1 = sandbox.stub(fs.promises, 'lstat').resolves({ isFile: () => true, isDirectory: () => false } as any);
        const data = await fromTask(dataAccessor.getFileType('./foo/bar.txt'));

        expect(stub1.calledOnce).toBe(true);
        expect(data).toBe(FileType.File);
      });

      it('should function correctly', async () => {
        stub1 = sandbox.stub(fs.promises, 'lstat').resolves({ isFile: () => false, isDirectory: () => true } as any);
        const data = await dataAccessor.getFileType('./foo');

        expect(stub1.calledOnce).toBe(true);
        expect(data).toBe(FileType.Directory);
      });

      it('should function correctly', async () => {
        stub1 = sandbox.stub(fs.promises, 'lstat').resolves({ isFile: () => false, isDirectory: () => false } as any);
        const data = await dataAccessor.getFileType('.');

        expect(stub1.calledOnce).toBe(true);
        expect(data).toBe(FileType.Other);
      });
    });

    describe('exists', () => {
      let stub1: sinon.SinonStub;
      afterEach(() => {
        stub1.restore();
      });

      it('should function correctly', async () => {
        stub1 = sandbox.stub(fs, 'existsSync').returns(true);
        const data = await fromTaskEither(dataAccessor.exists('./foo/bar.txt'));

        expect(stub1.calledOnce).toBe(true);
        expect(data).toBe(true);
      });

      it('should function correctly', async () => {
        stub1 = sandbox.stub(fs, 'existsSync').returns(false);
        const data = await fromTaskEither(dataAccessor.exists('./foo/bar.txt'));

        expect(stub1.calledOnce).toBe(true);
        expect(data).toBe(false);
      });
    });

    describe('readFile', () => {
      let stub1: sinon.SinonStub;
      beforeEach(() => {
        stub1 = sandbox.stub(fs.promises, 'readFile').resolves(Buffer.from('some test text'));
      });
      afterEach(() => {
        stub1.restore();
      });

      it('should function correctly', async () => {
        const data = await fromTaskEither(dataAccessor.readFile('/foo/bar.txt'));

        expect(stub1.calledOnce).toBe(true);
        expect(stub1.getCall(0).args[0]).toBe('/foo/bar.txt');
        expect(data.toString()).toBe('some test text');
      });
    });

    describe('writeFile', () => {
      let stub1: sinon.SinonStub;
      beforeEach(() => {
        stub1 = sandbox.stub(fs.promises, 'writeFile').resolves();
      });
      afterEach(() => {
        stub1.restore();
      });

      it('should function correctly', async () => {
        await fromTaskEither(dataAccessor.writeFile('/foo/bar.txt', 'some test text'));

        expect(stub1.callCount).toBe(1);
        expect(stub1.getCall(0).args[0]).toBe('/foo/bar.txt');
        expect(stub1.getCall(0).args[1]).toBe('some test text');
      });
    });

    describe('deleteFile', () => {
      let stub1: sinon.SinonStub;
      beforeEach(() => {
        stub1 = sandbox.stub(fs.promises, 'unlink').resolves();
      });
      afterEach(() => {
        stub1.restore();
      });

      it('should function correctly', async () => {
        await fromTaskEither(dataAccessor.deleteFile('/foo/bar.txt'));

        expect(stub1.callCount).toBe(1);
        expect(stub1.getCall(0).args[0]).toBe('/foo/bar.txt');
      });
    });

    describe('getFileReadStream', () => {
      let stub1: sinon.SinonStub;
      beforeEach(() => {
        stub1 = sandbox.stub(fs, 'createReadStream').resolves(new Readable());
      });
      afterEach(() => {
        stub1.restore();
      });

      it('should function correctly', async () => {
        const data = await fromTaskEither(dataAccessor.getFileReadStream('/foo/bar.txt'));

        expect(stub1.calledOnce).toBe(true);
        expect(stub1.getCall(0).args[0]).toBe('/foo/bar.txt');
        expect(data).toBeInstanceOf(Readable);
      });
    });

    describe('getFileLineReadStream', () => {
      let stub1: sinon.SinonStub;
      beforeEach(() => {
        stub1 = sandbox.stub(fs, 'createReadStream').resolves(new PassThrough());
      });
      afterEach(() => {
        stub1.restore();
      });

      it('should function correctly', async () => {
        const data = await fromTaskEither(dataAccessor.getFileLineReadStream('/foo/bar.txt'));

        expect(stub1.calledOnce).toBe(true);
        expect(stub1.getCall(0).args[0]).toBe('/foo/bar.txt');
        expect(data).toBeInstanceOf(readline.Interface);
      });
    });

    describe('getFileWriteStream', () => {
      let stub1: sinon.SinonStub;
      beforeEach(() => {
        stub1 = sandbox.stub(fs, 'createWriteStream').resolves(new PassThrough());
      });
      afterEach(() => {
        stub1.restore();
      });

      it('should function correctly', async () => {
        const data = await fromTaskEither(dataAccessor.getFileWriteStream('/foo/bar.txt'));

        expect(stub1.calledOnce).toBe(true);
        expect(stub1.getCall(0).args[0]).toBe('/foo/bar.txt');
        expect(stub1.getCall(0).args[1]).toStrictEqual({ flags: 'w', encoding: 'utf-8' });
        expect(data).toBeInstanceOf(Writable);
      });
    });

    describe('getFileAppendWriteStream', () => {
      let stub1: sinon.SinonStub;
      beforeEach(() => {
        stub1 = sandbox.stub(fs, 'createWriteStream').resolves(new PassThrough());
      });
      afterEach(() => {
        stub1.restore();
      });

      it('should function correctly', async () => {
        const data = await fromTaskEither(dataAccessor.getFileAppendWriteStream('/foo/bar.txt'));

        expect(stub1.calledOnce).toBe(true);
        expect(stub1.getCall(0).args[0]).toBe('/foo/bar.txt');
        expect(stub1.getCall(0).args[1]).toStrictEqual({ flags: 'a', encoding: 'utf-8' });
        expect(data).toBeInstanceOf(Writable);
      });
    });

    describe('createDirectory', () => {
      let stub1: sinon.SinonStub;
      let stub2: sinon.SinonStub;
      beforeEach(() => {
        stub2 = sandbox.stub(fs.promises, 'mkdir').resolves();
      });
      afterEach(() => {
        stub1.restore();
        stub2.restore();
      });

      it('should function correctly, directory does not exist', async () => {
        stub1 = sandbox.stub(fs, 'existsSync').returns(false);
        await fromTaskEither(dataAccessor.createDirectory('/foo/baz'));

        expect(stub1.callCount).toBe(1);
        expect(stub2.callCount).toBe(1);
        expect(stub2.getCall(0).args[0]).toBe('/foo/baz');
      });

      it('should function correctly, directory exists', async () => {
        stub1 = sandbox.stub(fs, 'existsSync').returns(true);
        await fromTaskEither(dataAccessor.createDirectory('/foo/baz'));

        expect(stub1.callCount).toBe(1);
        expect(stub2.callCount).toBe(0);
      });
    });

    describe('removeDirectory', () => {
      let stub1: sinon.SinonStub;
      let stub2: sinon.SinonStub;
      beforeEach(() => {
        stub2 = sandbox.stub(fs.promises, 'rmdir').resolves();
      });
      afterEach(() => {
        stub1.restore();
        stub2.restore();
      });

      it('should function correctly, directory does not exist', async () => {
        stub1 = sandbox.stub(fs, 'existsSync').returns(false);
        await fromTaskEither(dataAccessor.removeDirectory('/foo/baz'));

        expect(stub1.callCount).toBe(1);
        expect(stub2.callCount).toBe(0);
      });

      it('should function correctly, directory exists', async () => {
        stub1 = sandbox.stub(fs, 'existsSync').returns(true);
        await fromTaskEither(dataAccessor.removeDirectory('/foo/baz'));

        expect(stub1.callCount).toBe(1);
        expect(stub2.callCount).toBe(1);
        expect(stub2.getCall(0).args[0]).toBe('/foo/baz');
      });
    });

    describe('dirName', () => {
      let stub1: sinon.SinonStub;
      afterEach(() => {
        stub1.restore();
      });

      it('should function correctly', async () => {
        stub1 = sandbox.stub(fs.promises, 'lstat').resolves({ isFile: () => true, isDirectory: () => false } as any);
        await expect(fromTask(dataAccessor.dirName('foo/bar/baz.json'))).resolves.toBe('foo/bar');
      });

      it('should function correctly', async () => {
        stub1 = sandbox.stub(fs.promises, 'lstat').resolves({ isFile: () => false, isDirectory: () => true } as any);
        await expect(fromTask(dataAccessor.dirName('foo/bar'))).resolves.toBe('foo/bar');
      });
    });

    describe('fileName', () => {
      let stub1: sinon.SinonStub;
      afterEach(() => {
        stub1.restore();
      });

      it('should function correctly', async () => {
        stub1 = sandbox.stub(fs.promises, 'lstat').resolves({ isFile: () => true, isDirectory: () => false } as any);
        await expect(fromTaskOption(dataAccessor.fileName('foo/bar/baz.json'))).resolves.toBe('baz.json');
      });

      it('should function correctly', async () => {
        stub1 = sandbox.stub(fs.promises, 'lstat').resolves({ isFile: () => false, isDirectory: () => true } as any);
        await expect(fromTaskOption(dataAccessor.fileName('foo/bar'))).resolves.toBe(undefined);
      });
    });

    describe('joinPath', () => {
      it('should function correctly', async () => {
        expect(dataAccessor.joinPath('foo', 'bar', 'baz.json')).toBe('foo/bar/baz.json');
        expect(dataAccessor.joinPath('foo/bar', 'baz.json')).toBe('foo/bar/baz.json');
        expect(dataAccessor.joinPath('/foo', 'baz.json')).toBe('/foo/baz.json');
        expect(dataAccessor.joinPath('/', 'baz.json')).toBe('/baz.json');
      });
    });

    describe('relative', () => {
      it('should function correctly', async () => {
        expect(dataAccessor.relative('/foo/bar/', '/foo/bar/baz/qux.json')).toBe('baz/qux.json');
      });
    });

    describe('extname', () => {
      it('should function correctly', async () => {
        expect(dataAccessor.extname('/foo/bar/baz/qux.json')).toBe('.json');
      });
    });
  });
});
