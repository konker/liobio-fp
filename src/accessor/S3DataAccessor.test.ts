// [XXX: need to require AWS to be able to mock it in this way]
// tslint:disable-next-line:no-var-requires
const AWS = require('aws-sdk');
import { PassThrough, Readable, Writable } from 'stream';
import { fromTask, fromTaskEither, fromTaskOption } from 'ruins-ts';
import { DataAccessor, FileType } from './DataAccessor';
import sinon from 'sinon';
import readline from 'readline';
import { s3DataAccessor } from './S3DataAccessor';
import PromiseDependentWritableStream from '../stream/PromiseDependentWritableStream';

describe('DataAccessor', () => {
  const sandbox = sinon.createSandbox();
  let dataAccessor: DataAccessor;

  describe('S3DataAccessor', () => {
    const s3Mock = {
      listObjectsV2: sandbox.stub().returns({
        promise: () => Promise.resolve({ Contents: [{ Key: 'bar/test-file.txt' }] }),
      }),
      getObject: sandbox.stub().returns({
        promise: () => Promise.resolve({ Body: 'test-file-data' }),
        createReadStream: sandbox.stub().resolves(new PassThrough()),
      }),
      putObject: sandbox.stub().returns({
        promise: () => Promise.resolve(),
      }),
      headObject: sandbox.stub().callsFake((params) => {
        if (params.Key.includes('exists')) {
          return { promise: () => Promise.resolve() };
        }
        if (params.Key.includes('does-not-exist')) {
          return { promise: () => Promise.reject({ code: 'NotFound' }) };
        } else {
          return { promise: () => Promise.reject(new Error('GeneralError')) };
        }
      }),
      deleteObject: sandbox.stub().returns({
        promise: () => Promise.resolve(),
      }),
      upload: sandbox.stub().returns({
        promise: () => Promise.resolve(),
      }),
    };

    beforeAll(async () => {
      // tslint:disable-next-line:only-arrow-functions
      sandbox.stub(AWS, 'S3').returns(s3Mock);
      dataAccessor = await fromTask(s3DataAccessor());
    });
    afterEach(() => {
      sandbox.resetHistory();
    });
    afterAll(() => {
      sandbox.restore();
    });

    describe('ID', () => {
      it('should work as expected', () => {
        expect(dataAccessor.ID).toBe('S3DataAccessor');
      });
    });

    describe('listFiles', () => {
      it('should function correctly', async () => {
        const files = await fromTaskEither(dataAccessor.listFiles('s3://foobucket/bar'));
        expect(AWS.S3().listObjectsV2.callCount).toBe(1);
        expect(files[0]).toBe('s3://foobucket/bar/test-file.txt');
      });

      it('should fail correctly', async () => {
        await expect(fromTaskEither(dataAccessor.listFiles('s3://foobucket/bar/file.csv'))).rejects.toThrow(
          '[S3DataAccessor] Could not list files, non-directory path given',
        );
        expect(AWS.S3().listObjectsV2.callCount).toBe(0);
      });
    });

    describe('getFileType', () => {
      it('should function correctly', async () => {
        expect(await fromTask(dataAccessor.getFileType('s3://foobucket/foo/bar.txt'))).toBe(FileType.File);
        expect(await fromTask(dataAccessor.getFileType('s3://foobucket/foo/bar/baz'))).toBe(FileType.Directory);
      });
    });

    describe('exists', () => {
      it('should function correctly when file exists', async () => {
        await expect(fromTaskEither(dataAccessor.exists('s3://foobucket/foo/exists.txt'))).resolves.toBe(true);
      });

      it('should function correctly when files does not exist', async () => {
        await expect(fromTaskEither(dataAccessor.exists('s3://foobucket/foo/does-not-exist.txt'))).resolves.toBe(false);
      });

      it('should function correctly when a general error is thrown', async () => {
        await expect(fromTaskEither(dataAccessor.exists('s3://foobucket/foo/error.txt'))).rejects.toThrowError();
      });
    });

    describe('readFile', () => {
      it('should function correctly', async () => {
        const data = await fromTaskEither(dataAccessor.readFile('s3://foobucket/bar/qux.txt'));

        expect(AWS.S3().getObject.callCount).toBe(1);
        expect(AWS.S3().getObject.getCall(0).args[0]).toStrictEqual({ Bucket: 'foobucket', Key: 'bar/qux.txt' });
        expect(data.toString()).toBe('test-file-data');
      });
    });

    describe('getFileReadStream', () => {
      it('should function correctly', async () => {
        const data = await fromTaskEither(dataAccessor.getFileReadStream('s3://foobucket/bar/qux.txt'));

        expect(AWS.S3().getObject().createReadStream.callCount).toBe(1);
        expect(data).toBeInstanceOf(Readable);
      });
    });

    describe('getFileLineReadStream', () => {
      it('should function correctly', async () => {
        const data = await fromTaskEither(dataAccessor.getFileLineReadStream('s3://foobucket/bar/qux.txt'));

        expect(AWS.S3().getObject().createReadStream.callCount).toBe(1);
        expect(data).toBeInstanceOf(readline.Interface);
      });
    });

    describe('getFileWriteStream', () => {
      it('should function correctly', async () => {
        const data = await fromTaskEither(dataAccessor.getFileWriteStream('s3://foobucket/bar/qux.txt'));

        expect(AWS.S3().upload.callCount).toBe(1);
        expect(data).toBeInstanceOf(Writable);
        expect(data).toBeInstanceOf(PromiseDependentWritableStream);
        expect((data as PromiseDependentWritableStream).promise).toBeDefined();
      });
    });

    describe('writeFile', () => {
      it('should function correctly', async () => {
        await fromTaskEither(dataAccessor.writeFile('s3://foobucket/bar/baz.txt', 'wham-bam-thank-you-sam'));

        expect(AWS.S3().putObject.callCount).toBe(1);
        expect(AWS.S3().putObject.getCall(0).args[0]).toStrictEqual({
          Bucket: 'foobucket',
          Key: 'bar/baz.txt',
          Body: 'wham-bam-thank-you-sam',
        });
      });

      it('should fail correctly', async () => {
        await expect(
          fromTaskEither(dataAccessor.writeFile('s3://foobucket/bar/dir', 'wham-bam-thank-you-sam')),
        ).rejects.toThrow('[S3DataAccessor] Cannot write a file with a directory url');
        expect(AWS.S3().putObject.callCount).toBe(0);
      });
    });

    describe('deleteFile', () => {
      it('should function correctly', async () => {
        await fromTaskEither(dataAccessor.deleteFile('s3://foobucket/bar/baz.txt'));

        expect(AWS.S3().deleteObject.callCount).toBe(1);
        expect(AWS.S3().deleteObject.getCall(0).args[0]).toStrictEqual({
          Bucket: 'foobucket',
          Key: 'bar/baz.txt',
        });
      });

      it('should fail correctly', async () => {
        await expect(fromTaskEither(dataAccessor.deleteFile('s3://foobucket/bar/dir'))).rejects.toThrow(
          '[S3DataAccessor] Cannot delete a file with a directory url',
        );
        expect(AWS.S3().deleteObject.callCount).toBe(0);
      });
    });

    describe('createDirectory', () => {
      it('should function correctly', async () => {
        await fromTaskEither(dataAccessor.createDirectory('s3://foobucket/bar/'));

        expect(AWS.S3().putObject.callCount).toBe(1);
        expect(AWS.S3().putObject.getCall(0).args[0]).toStrictEqual({
          Bucket: 'foobucket',
          Key: 'bar/',
        });
      });

      it('should fail correctly', async () => {
        await expect(fromTaskEither(dataAccessor.createDirectory('s3://foobucket/bar/zazam.json'))).rejects.toThrow(
          '[S3DataAccessor] Cannot create a directory with a non-directory url',
        );
        expect(AWS.S3().putObject.callCount).toBe(0);
      });
    });

    describe('removeDirectory', () => {
      it('should function correctly', async () => {
        await fromTaskEither(dataAccessor.removeDirectory('s3://foobucket/bar/'));

        expect(AWS.S3().listObjectsV2.callCount).toBe(1);
        expect(AWS.S3().deleteObject.callCount).toBe(2);
        expect(AWS.S3().deleteObject.getCall(0).args[0]).toStrictEqual({
          Bucket: 'foobucket',
          Key: 'bar/test-file.txt',
        });
        expect(AWS.S3().deleteObject.getCall(1).args[0]).toStrictEqual({
          Bucket: 'foobucket',
          Key: 'bar/',
        });
      });

      it('should fail correctly', async () => {
        await expect(fromTaskEither(dataAccessor.removeDirectory('s3://foobucket/bar/zazam.json'))).rejects.toThrow(
          '[S3DataAccessor] Cannot remove a directory with a non-directory url',
        );
        expect(AWS.S3().deleteObject.callCount).toBe(0);
      });
    });

    describe('dirName', () => {
      it('should function correctly', async () => {
        await expect(fromTask(dataAccessor.dirName('s3://foobucket/wat/bar/baz.json'))).resolves.toBe('wat/bar/');
        await expect(fromTask(dataAccessor.dirName('s3://foobucket/wat/bar/'))).resolves.toBe('wat/bar/');
      });
    });

    describe('fileName', () => {
      it('should function correctly', async () => {
        await expect(fromTaskOption(dataAccessor.fileName('s3://foobucket/wat/bar/baz.json'))).resolves.toBe(
          'baz.json',
        );
        await expect(fromTaskOption(dataAccessor.fileName('s3://foobucket/wat/bar/'))).resolves.toBe(undefined);
      });
    });

    describe('joinPath', () => {
      it('should function correctly', async () => {
        expect(dataAccessor.joinPath('s3://foobucket/wat', 'bar', 'baz.json')).toBe('s3://foobucket/wat/bar/baz.json');
        expect(dataAccessor.joinPath('foo', 'bar', 'baz.json')).toBe('foo/bar/baz.json');
        expect(dataAccessor.joinPath('foo/bar', 'baz.json')).toBe('foo/bar/baz.json');
        expect(dataAccessor.joinPath('/foo', 'baz.json')).toBe('/foo/baz.json');
        expect(dataAccessor.joinPath('/', 'baz.json')).toBe('/baz.json');
      });
    });

    describe('relative', () => {
      it('should function correctly', async () => {
        expect(dataAccessor.relative('s3://foo/bar/', 's3://foo/bar/baz/qux.json')).toBe('baz/qux.json');
      });
    });

    describe('extname', () => {
      it('should function correctly', async () => {
        expect(dataAccessor.extname('s3://foo/bar/baz/qux.json')).toBe('.json');
      });
    });
  });
});
