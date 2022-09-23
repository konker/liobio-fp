import { S3Client } from '@aws-sdk/client-s3';
import { mockClient } from 'aws-sdk-client-mock';
import readline from 'readline';
import { fromEither, fromOption, fromTask, fromTaskEither } from 'ruins-ts';
import { PassThrough, Readable, Writable } from 'stream';

import * as P from '../../prelude';
import { PromiseDependentWritableStream } from '../../stream/PromiseDependentWritableStream';
import { FileType } from '../../types';
import type { DataAccessor } from '../DataAccessor';
import { s3DataAccessor } from './index';
import * as lib from './lib';
import SpyInstance = jest.SpyInstance;

describe('S3DataAccessor', () => {
  let dataAccessor: DataAccessor;
  let s3ListObjectsMock: SpyInstance;

  beforeAll(async () => {
    mockClient(S3Client);

    s3ListObjectsMock = jest.spyOn(lib, 's3ListObjects');
    s3ListObjectsMock.mockImplementation((parsed) => (_: any) => {
      if (parsed.FullPath === 'bar/baz/') {
        return P.TaskEither_.of({
          $metadata: {},
          IsTruncated: false,
          Contents: [{ Key: 'bar/baz/test-file0.txt' }],
        });
      }
      if (parsed.FullPath === 'bar/') {
        return P.TaskEither_.of({
          $metadata: {},
          IsTruncated: false,
          Contents: [{ Key: 'bar/test-file1.txt' }],
          CommonPrefixes: [{ Prefix: 'bar/baz/' }],
        });
      }
      if (parsed.FullPath === 'bartruncated/') {
        return P.TaskEither_.of({
          $metadata: {},
          IsTruncated: true,
          Contents: [{ Key: 'bartruncated/test-file2.txt' }],
          CommonPrefixes: [{ Prefix: 'bartruncated/' }],
        });
      }
      return P.TaskEither_.of({
        $metadata: {},
        IsTruncated: false,
        Contents: [],
        CommonPrefixes: [],
      });
    });

    dataAccessor = await fromTask(s3DataAccessor());
  });

  describe('s3DataAccessor', () => {
    it('should construct as expected', async () => {
      delete process.env.AWS_REGION;
      dataAccessor = await fromTask(s3DataAccessor());
    });
    it('should construct as expected with AWS_REGION', async () => {
      process.env.AWS_REGION = 'eu-north-1';
      dataAccessor = await fromTask(s3DataAccessor());
    });
  });

  describe('ID', () => {
    it('should work as expected', () => {
      expect(dataAccessor.ID).toBe('S3DataAccessor');
    });
  });

  describe('listFiles', () => {
    beforeEach(() => {
      s3ListObjectsMock.mockClear();
    });

    it('should function correctly', async () => {
      const files = await fromTaskEither(dataAccessor.listFiles('s3://foobucket/bar'));
      expect(s3ListObjectsMock).toHaveBeenCalledTimes(1);
      expect(files).toStrictEqual(['s3://foobucket/bar/baz', 's3://foobucket/bar/test-file1.txt']);
    });

    it('should fail correctly', async () => {
      await expect(fromTaskEither(dataAccessor.listFiles('s3://foobucket/bar/file.csv'))).rejects.toThrow(
        '[S3DataAccessor] Cannot list files with a non-directory url'
      );
      expect(s3ListObjectsMock).toHaveBeenCalledTimes(0);
    });

    it('should fail correctly when result is truncated', async () => {
      await expect(fromTaskEither(dataAccessor.listFiles('s3://foobucket/bartruncated'))).rejects.toThrow(
        '[S3DataAccessor] Error: listing is truncated'
      );
      expect(s3ListObjectsMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('getFileType', () => {
    it('should function correctly', async () => {
      expect(await fromTaskEither(dataAccessor.getFileType('s3://foobucket/foo/bar.txt'))).toBe(FileType.File);
      expect(await fromTaskEither(dataAccessor.getFileType('s3://foobucket/foo/bar/baz'))).toBe(FileType.Directory);
    });
  });

  describe('exists', () => {
    let s3HeadObjectMock: SpyInstance;
    beforeAll(async () => {
      s3HeadObjectMock = jest.spyOn(lib, 's3HeadObject');
      s3HeadObjectMock.mockImplementation((parsed) => (_: any) => {
        if (parsed.FullPath.includes('exists')) {
          return P.TaskEither_.of(true);
        }
        if (parsed.FullPath.includes('does-not-exist')) {
          return P.TaskEither_.left({ $metadata: { httpStatusCode: 404 }, code: 'NotFound' });
        }
        if (parsed.FullPath.includes('no-metadata')) {
          return P.TaskEither_.left({ code: 'Boom' });
        }
        return P.TaskEither_.left({ $metadata: { httpStatusCode: 500 }, code: 'GeneralError' });
      });
    });
    beforeEach(() => {
      s3HeadObjectMock.mockClear();
    });

    it('should function correctly when file exists', async () => {
      await expect(fromTaskEither(dataAccessor.exists('s3://foobucket/foo/exists.txt'))).resolves.toBe(true);
      expect(s3HeadObjectMock).toHaveBeenCalledTimes(1);
    });

    it('should function correctly when files does not exist', async () => {
      await expect(fromTaskEither(dataAccessor.exists('s3://foobucket/foo/does-not-exist.txt'))).resolves.toBe(false);
      expect(s3HeadObjectMock).toHaveBeenCalledTimes(1);
    });

    it('should function correctly when metadata is missing', async () => {
      await expect(fromTaskEither(dataAccessor.exists('s3://foobucket/foo/no-metadata.txt'))).rejects.toThrow();
      expect(s3HeadObjectMock).toHaveBeenCalledTimes(1);
    });

    it('should function correctly when a general error is thrown', async () => {
      await expect(fromTaskEither(dataAccessor.exists('s3://foobucket/foo/error.txt'))).rejects.toThrow();
      expect(s3HeadObjectMock).toHaveBeenCalledTimes(1);
    });
  });

  describe('readFile', () => {
    let s3GetObjectMock: SpyInstance;
    beforeAll(async () => {
      s3GetObjectMock = jest.spyOn(lib, 's3GetObject');
      s3GetObjectMock.mockImplementation((parsed) => (_: any) => {
        if (parsed.FullPath.includes('exists')) {
          return P.TaskEither_.of(Buffer.from('test-file-data'));
        }
        throw new Error('GeneralError');
      });
    });
    beforeEach(() => {
      s3GetObjectMock.mockClear();
    });

    it('should function correctly', async () => {
      const result = await fromTaskEither(dataAccessor.readFile('s3://foobucket/bar/exists.txt'));
      expect(s3GetObjectMock).toHaveBeenCalledTimes(1);
      expect(result.toString()).toBe('test-file-data');
    });

    it('should fail correctly', async () => {
      await expect(fromTaskEither(dataAccessor.readFile('s3://foobucket/bar/bad.txt'))).rejects.toThrow();
      expect(s3GetObjectMock).toHaveBeenCalledTimes(1);
    });

    it('should fail correctly', async () => {
      await expect(fromTaskEither(dataAccessor.readFile('s3://foobucket/bar'))).rejects.toThrow();
      expect(s3GetObjectMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('read streams', () => {
    let s3GetObjectReadStreamMock: SpyInstance;
    beforeAll(async () => {
      s3GetObjectReadStreamMock = jest.spyOn(lib, 's3GetObjectReadStream');
      s3GetObjectReadStreamMock.mockImplementation((parsed) => (_: any) => {
        if (parsed.FullPath.includes('exists')) {
          return P.TaskEither_.of(new PassThrough());
        }
        throw new Error('GeneralError');
      });
    });

    describe('getFileReadStream', () => {
      beforeEach(() => {
        s3GetObjectReadStreamMock.mockClear();
      });

      it('should function correctly', async () => {
        const result = await fromTaskEither(dataAccessor.getFileReadStream('s3://foobucket/bar/exists.txt'));
        expect(s3GetObjectReadStreamMock).toHaveBeenCalledTimes(1);
        expect(result).toBeInstanceOf(Readable);
      });

      it('should fail correctly', async () => {
        await expect(fromTaskEither(dataAccessor.getFileReadStream('s3://foobucket/bar/bad.txt'))).rejects.toThrow();
        expect(s3GetObjectReadStreamMock).toHaveBeenCalledTimes(1);
      });

      it('should fail correctly', async () => {
        await expect(fromTaskEither(dataAccessor.getFileReadStream('s3://foobucket/bar'))).rejects.toThrow();
        expect(s3GetObjectReadStreamMock).toHaveBeenCalledTimes(0);
      });
    });

    describe('getFileLineReadStream', () => {
      beforeEach(() => {
        s3GetObjectReadStreamMock.mockClear();
      });

      it('should function correctly', async () => {
        const result = await fromTaskEither(dataAccessor.getFileLineReadStream('s3://foobucket/bar/exists.txt'));
        expect(s3GetObjectReadStreamMock).toHaveBeenCalledTimes(1);
        expect(result).toBeInstanceOf(readline.Interface);
      });

      it('should fail correctly', async () => {
        await expect(
          fromTaskEither(dataAccessor.getFileLineReadStream('s3://foobucket/bar/bad.txt'))
        ).rejects.toThrow();
        expect(s3GetObjectReadStreamMock).toHaveBeenCalledTimes(1);
      });

      it('should fail correctly', async () => {
        await expect(fromTaskEither(dataAccessor.getFileLineReadStream('s3://foobucket/bar'))).rejects.toThrow();
        expect(s3GetObjectReadStreamMock).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('getFileWriteStream', () => {
    let s3GetObjectWriteStreamMock: SpyInstance;
    beforeAll(async () => {
      s3GetObjectWriteStreamMock = jest.spyOn(lib, 's3GetObjectWriteStream');
      s3GetObjectWriteStreamMock.mockImplementation((parsed) => (_: any) => {
        if (parsed.FullPath.includes('exists')) {
          return P.TaskEither_.of(new PromiseDependentWritableStream());
        }
        throw new Error('GeneralError');
      });
    });
    beforeEach(() => {
      s3GetObjectWriteStreamMock.mockClear();
    });

    it('should function correctly', async () => {
      const result = await fromTaskEither(dataAccessor.getFileWriteStream('s3://foobucket/bar/exists.txt'));

      expect(s3GetObjectWriteStreamMock).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Writable);
      expect(result).toBeInstanceOf(PromiseDependentWritableStream);
    });

    it('should fail correctly', async () => {
      await expect(fromTaskEither(dataAccessor.getFileWriteStream('s3://foobucket/bar/bad.txt'))).rejects.toThrow();
      expect(s3GetObjectWriteStreamMock).toHaveBeenCalledTimes(1);
    });

    it('should fail correctly', async () => {
      await expect(fromTaskEither(dataAccessor.getFileWriteStream('s3://foobucket/bar'))).rejects.toThrow();
      expect(s3GetObjectWriteStreamMock).toHaveBeenCalledTimes(0);
    });
  });

  describe('write objects', () => {
    let s3PutObjectMock: SpyInstance;
    let s3UploadObjectMock: SpyInstance;
    beforeAll(async () => {
      s3PutObjectMock = jest.spyOn(lib, 's3PutObject');
      s3PutObjectMock.mockImplementation((parsed) => (_: any) => {
        if (parsed.FullPath.includes('error')) {
          throw new Error('GeneralError');
        }
        return P.TaskEither_.of(undefined);
      });
      s3UploadObjectMock = jest.spyOn(lib, 's3UploadObject');
      s3UploadObjectMock.mockImplementation((parsed) => (_: any) => {
        if (parsed.FullPath.includes('error')) {
          throw new Error('GeneralError');
        }
        return P.TaskEither_.of(undefined);
      });
    });

    describe('writeFile', () => {
      beforeEach(() => {
        s3PutObjectMock.mockClear();
        s3UploadObjectMock.mockClear();
      });

      it('should function correctly', async () => {
        await fromTaskEither(dataAccessor.writeFile('s3://foobucket/bar/qux.txt', 'wham-bam-thank-you-sam'));
        expect(s3UploadObjectMock).toHaveBeenCalledTimes(1);
        expect(s3UploadObjectMock?.mock?.calls?.[0]?.[0]).toStrictEqual({
          Bucket: 'foobucket',
          File: 'qux.txt',
          FullPath: 'bar/qux.txt',
          Path: 'bar/',
          Type: 'File',
        });
        expect(s3UploadObjectMock?.mock?.calls?.[0]?.[1]).toBe('wham-bam-thank-you-sam');
      });

      it('should fail correctly', async () => {
        await expect(
          fromTaskEither(dataAccessor.writeFile('s3://foobucket/bar/error.txt', 'wham-bam-thank-you-sam'))
        ).rejects.toThrow();
        expect(s3UploadObjectMock).toHaveBeenCalledTimes(1);
      });

      it('should fail correctly', async () => {
        await expect(
          fromTaskEither(dataAccessor.writeFile('s3://foobucket/bar', 'wham-bam-thank-you-sam'))
        ).rejects.toThrow();
        expect(s3UploadObjectMock).toHaveBeenCalledTimes(0);
      });
    });

    describe('createDirectory', () => {
      beforeEach(() => {
        s3PutObjectMock.mockClear();
      });

      it('should function correctly', async () => {
        await fromTaskEither(dataAccessor.createDirectory('s3://foobucket/bar/'));
        expect(s3PutObjectMock).toHaveBeenCalledTimes(1);
        expect(s3PutObjectMock?.mock?.calls?.[0]?.[0]).toStrictEqual({
          Bucket: 'foobucket',
          File: undefined,
          FullPath: 'bar/',
          Path: 'bar/',
          Type: 'Directory',
        });
        expect(s3PutObjectMock?.mock?.calls?.[0]?.[1]).toBeUndefined();
      });

      it('should fail correctly', async () => {
        await expect(fromTaskEither(dataAccessor.createDirectory('s3://foobucket/error'))).rejects.toThrow();
        expect(s3PutObjectMock).toHaveBeenCalledTimes(1);
      });

      it('should fail correctly', async () => {
        await expect(fromTaskEither(dataAccessor.createDirectory('s3://foobucket/bar/qux.txt'))).rejects.toThrow();
        expect(s3PutObjectMock).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('delete objects', () => {
    let s3DeleteObjectMock: SpyInstance;
    beforeAll(async () => {
      s3DeleteObjectMock = jest.spyOn(lib, 's3DeleteObject');
      s3DeleteObjectMock.mockImplementation((parsed) => (_: any) => {
        if (parsed.FullPath.includes('error')) {
          throw new Error('GeneralError');
        }
        return P.TaskEither_.of(undefined);
      });
    });

    describe('deleteFile', () => {
      beforeEach(() => {
        s3DeleteObjectMock.mockClear();
      });

      it('should function correctly', async () => {
        await fromTaskEither(dataAccessor.deleteFile('s3://foobucket/bar/baz.txt'));

        expect(s3DeleteObjectMock).toHaveBeenCalledTimes(1);
        expect(s3DeleteObjectMock?.mock?.calls?.[0]?.[0]).toStrictEqual({
          Bucket: 'foobucket',
          File: 'baz.txt',
          FullPath: 'bar/baz.txt',
          Path: 'bar/',
          Type: 'File',
        });
      });

      it('should fail correctly', async () => {
        await expect(fromTaskEither(dataAccessor.deleteFile('s3://foobucket/error.txt'))).rejects.toThrow();
        expect(s3DeleteObjectMock).toHaveBeenCalledTimes(1);
      });

      it('should fail correctly', async () => {
        await expect(fromTaskEither(dataAccessor.deleteFile('s3://foobucket/bar/'))).rejects.toThrow();
        expect(s3DeleteObjectMock).toHaveBeenCalledTimes(0);
      });
    });

    describe('removeDirectory', () => {
      beforeEach(() => {
        s3ListObjectsMock.mockClear();
        s3DeleteObjectMock.mockClear();
      });

      it('should function correctly', async () => {
        await fromTaskEither(dataAccessor.removeDirectory('s3://foobucket/bar'));

        expect(s3ListObjectsMock).toHaveBeenCalledTimes(2);
        expect(s3DeleteObjectMock).toHaveBeenCalledTimes(4);
        expect(s3DeleteObjectMock?.mock?.calls?.[0]?.[0]).toStrictEqual({
          Bucket: 'foobucket',
          File: 'test-file1.txt',
          FullPath: 'bar/test-file1.txt',
          Path: 'bar/',
          Type: 'File',
        });
        expect(s3DeleteObjectMock?.mock?.calls?.[1]?.[0]).toStrictEqual({
          Bucket: 'foobucket',
          File: 'test-file0.txt',
          FullPath: 'bar/baz/test-file0.txt',
          Path: 'bar/baz/',
          Type: 'File',
        });
        expect(s3DeleteObjectMock?.mock?.calls?.[2]?.[0]).toStrictEqual({
          Bucket: 'foobucket',
          File: undefined,
          FullPath: 'bar/baz/',
          Path: 'bar/baz/',
          Type: 'Directory',
        });
        expect(s3DeleteObjectMock?.mock?.calls?.[3]?.[0]).toStrictEqual({
          Bucket: 'foobucket',
          File: undefined,
          FullPath: 'bar/',
          Path: 'bar/',
          Type: 'Directory',
        });
      });

      it('should fail correctly', async () => {
        await expect(fromTaskEither(dataAccessor.removeDirectory('s3://foobucket/error'))).rejects.toThrow();
        expect(s3DeleteObjectMock).toHaveBeenCalledTimes(1);
      });

      it('should fail correctly', async () => {
        await expect(fromTaskEither(dataAccessor.removeDirectory('s3://foobucket/bar/qux.txt'))).rejects.toThrow();
        expect(s3DeleteObjectMock).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe('dirName', () => {
    it('should function correctly', async () => {
      await expect(fromTaskEither(dataAccessor.dirName('s3://foobucket/wat/bar/baz.json'))).resolves.toBe(
        's3://foobucket/wat/bar/'
      );
      await expect(fromTaskEither(dataAccessor.dirName('s3://foobucket/wat/bar/'))).resolves.toBe(
        's3://foobucket/wat/bar/'
      );
    });
  });

  describe('fileName', () => {
    it('should function correctly', async () => {
      expect(fromOption(await fromTaskEither(dataAccessor.fileName('s3://foobucket/wat/bar/baz.json')))).toBe(
        'baz.json'
      );
    });
    it('should function correctly', async () => {
      expect(fromOption(await fromTaskEither(dataAccessor.fileName('s3://foobucket/wat/bar/')))).toBe(null);
    });
  });

  describe('joinPath', () => {
    it('should function correctly', async () => {
      expect(fromEither(dataAccessor.joinPath('s3://foobucket/wat', 'bar', 'baz.json'))).toBe(
        's3://foobucket/wat/bar/baz.json'
      );
      expect(fromEither(dataAccessor.joinPath('foo', 'bar', 'baz.json'))).toBe('foo/bar/baz.json');
      expect(fromEither(dataAccessor.joinPath('foo/bar', 'baz.json'))).toBe('foo/bar/baz.json');
      expect(fromEither(dataAccessor.joinPath('/foo', 'baz.json'))).toBe('/foo/baz.json');
      expect(fromEither(dataAccessor.joinPath('/', 'baz.json'))).toBe('/baz.json');
      expect(fromEither(dataAccessor.joinPath())).toBe('');
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
