import {
  CreateMultipartUploadCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
  UploadPartCommand,
} from '@aws-sdk/client-s3';
import type { AwsStub } from 'aws-sdk-client-mock';
import { mockClient } from 'aws-sdk-client-mock';
import { Blob } from 'buffer';
import readline from 'readline';
import { PassThrough, Readable, Writable } from 'stream';

import { fromReaderTaskEither } from '../../../../ruins-ts/lib/modules/reader-task-either';
import { PromiseDependentWritableStream } from '../../stream/PromiseDependentWritableStream';
import type { DirectoryPath, FileName } from '../../types';
import { FileType } from '../../types';
import type { Model } from './lib';
import * as unit from './lib';

describe('S3DataAccessor/lib', () => {
  let s3Mock: AwsStub<any, any>;
  let getObjectStub: AwsStub<any, any>;
  let model: Model;

  beforeAll(async () => {
    s3Mock = mockClient(S3Client);
    model = {
      s3: new S3Client({}),
    };

    getObjectStub = s3Mock.on(GetObjectCommand).callsFake((params) => {
      if (params.Key.includes('exists')) {
        return Promise.resolve({ Body: Readable.from('test-file-data') });
      }
      if (params.Key.includes('not-readable')) {
        return Promise.resolve({ Body: 'test-file-data' });
      }
      if (params.Key.includes('blob')) {
        return Promise.resolve({ Body: new Blob(['test-file-data']) });
      }
      if (params.Key.includes('invalid')) {
        return Promise.resolve({ Body: 'test-file-data-cannot-just-be-a-string' });
      }
      if (params.Key.includes('no-body')) {
        return Promise.resolve({});
      }
      return Promise.reject({ code: 'NotFound' });
    });
  });
  afterAll(() => {
    s3Mock.restore();
  });

  describe('s3ListObjects', () => {
    let listObjectsStub: AwsStub<any, any>;
    beforeAll(() => {
      listObjectsStub = s3Mock.on(ListObjectsV2Command).callsFake((params) => {
        if (params.Bucket.includes('foobucket')) {
          return Promise.resolve({ Contents: [{ Key: 'bar/test-file.txt' }] });
        }
        return Promise.reject('GeneralError');
      });
    });
    beforeEach(() => {
      listObjectsStub.resetHistory();
    });

    it('should function correctly', async () => {
      const result = await fromReaderTaskEither(
        model,
        unit.s3ListObjects({
          Type: FileType.Directory,
          Bucket: 'foobucket',
          Path: 'bar/' as DirectoryPath,
          FullPath: 'bar/',
        })
      );

      expect(listObjectsStub.calls().length).toBe(1);
      expect(result).toStrictEqual({ Contents: [{ Key: 'bar/test-file.txt' }] });
    });

    it('should fail correctly', async () => {
      await expect(
        fromReaderTaskEither(
          model,
          unit.s3ListObjects({
            Type: FileType.Directory,
            Bucket: 'nosuchbucket',
            Path: 'bar/' as DirectoryPath,
            FullPath: 'bar/',
          })
        )
      ).rejects.toThrow('GeneralError');
    });
  });

  describe('s3HeadObject', () => {
    beforeAll(() => {
      s3Mock.on(HeadObjectCommand).callsFake((params) => {
        if (params.Key.includes('exists')) {
          return Promise.resolve({});
        }
        if (params.Key.includes('does-not-exist')) {
          return Promise.reject({ code: 'NotFound' });
        }
        return Promise.reject(new Error('GeneralError'));
      });
    });

    it('should function correctly when file exists', async () => {
      await expect(
        fromReaderTaskEither(
          model,
          //'s3://foobucket/foo/exists.txt'
          unit.s3HeadObject({
            Type: FileType.File,
            Bucket: 'foobucket',
            Path: 'foo/' as DirectoryPath,
            FullPath: 'foo/exists.txt',
          })
        )
      ).resolves.toBe(true);
    });

    it('should function correctly when files does not exist', async () => {
      await expect(
        fromReaderTaskEither(
          model,
          //'s3://foobucket/foo/does-not-exist.txt'
          unit.s3HeadObject({
            Type: FileType.File,
            Bucket: 'foobucket',
            Path: 'foo/' as DirectoryPath,
            FullPath: 'foo/does-not-exist.txt',
          })
        )
      ).rejects.toThrow('NotFound');
    });

    //[FIXME: crash error message]
    xit('should function correctly when a general error is thrown', async () => {
      await expect(
        fromReaderTaskEither(
          model,
          //'s3://foobucket/foo/error.txt'
          unit.s3HeadObject({
            Type: FileType.File,
            Bucket: 'foobucket',
            Path: 'foo/' as DirectoryPath,
            FullPath: 'foo/error.txt',
          })
        )
      ).rejects.toThrow('GeneralError');
    });
  });

  describe('s3GetObject', () => {
    beforeEach(() => {
      getObjectStub.resetHistory();
    });

    it('should function correctly when object exists', async () => {
      const result = await fromReaderTaskEither(
        model,
        unit.s3GetObject({
          Type: FileType.File,
          Bucket: 'foobucket',
          Path: 'bar/' as DirectoryPath,
          File: 'exists.txt' as FileName,
          FullPath: 'bar/exists.txt',
        })
      );

      expect(getObjectStub.calls().length).toBe(1);
      expect(getObjectStub.call(0).args[0].input).toStrictEqual({ Bucket: 'foobucket', Key: 'bar/exists.txt' });
      expect(result.toString()).toBe('test-file-data');
    });

    it('should fail correctly when object exists as a blob', async () => {
      await expect(
        fromReaderTaskEither(
          model,
          unit.s3GetObject({
            Type: FileType.File,
            Bucket: 'foobucket',
            Path: 'bar/' as DirectoryPath,
            File: 'blob.txt' as FileName,
            FullPath: 'bar/blob.txt',
          })
        )
      ).rejects.toThrow('S3 object Body is a Blob');
    });

    it('should function correctly when object has missing body', async () => {
      const result = await fromReaderTaskEither(
        model,
        unit.s3GetObject({
          Type: FileType.File,
          Bucket: 'foobucket',
          Path: 'bar/' as DirectoryPath,
          File: 'no-body.txt' as FileName,
          FullPath: 'bar/no-body.txt',
        })
      );

      expect(getObjectStub.calls().length).toBe(1);
      expect(getObjectStub.call(0).args[0].input).toStrictEqual({ Bucket: 'foobucket', Key: 'bar/no-body.txt' });
      expect(result.toString()).toBe('');
    });

    it('should fail correctly when object has invalid body', async () => {
      await expect(
        fromReaderTaskEither(
          model,
          unit.s3GetObject({
            Type: FileType.File,
            Bucket: 'foobucket',
            Path: 'bar/' as DirectoryPath,
            File: 'invalid.txt' as FileName,
            FullPath: 'bar/invalid.txt',
          })
        )
      ).rejects.toThrow('Unknown S3 object Body type');
    });

    it('should fail correctly when object does not exist', async () => {
      await expect(
        fromReaderTaskEither(
          model,
          unit.s3GetObject({
            Type: FileType.File,
            Bucket: 'foobucket',
            Path: 'bar/' as DirectoryPath,
            File: 'missing.txt' as FileName,
            FullPath: 'bar/missing.txt',
          })
        )
      ).rejects.toThrow('NotFound');
    });
  });

  describe('s3GetObjectReadStream', () => {
    beforeEach(() => {
      getObjectStub.resetHistory();
    });

    it('should function correctly when object exists', async () => {
      const result = await fromReaderTaskEither(
        model,
        unit.s3GetObjectReadStream({
          Type: FileType.File,
          Bucket: 'foobucket',
          Path: 'bar/' as DirectoryPath,
          File: 'exists.txt' as FileName,
          FullPath: 'bar/exists.txt',
        })
      );

      expect(getObjectStub.calls().length).toBe(1);
      expect(getObjectStub.call(0).args[0].input).toStrictEqual({ Bucket: 'foobucket', Key: 'bar/exists.txt' });
      expect(result).toBeInstanceOf(Readable);
    });

    it('should fail correctly when object has invalid body', async () => {
      await expect(
        fromReaderTaskEither(
          model,
          unit.s3GetObjectReadStream({
            Type: FileType.File,
            Bucket: 'foobucket',
            Path: 'bar/' as DirectoryPath,
            File: 'invalid.txt' as FileName,
            FullPath: 'bar/invalid.txt',
          })
        )
      ).rejects.toThrow('Body is not a Readable');
    });

    it('should fail correctly when object does not exist', async () => {
      await expect(
        fromReaderTaskEither(
          model,
          unit.s3GetObjectReadStream({
            Type: FileType.File,
            Bucket: 'foobucket',
            Path: 'bar/' as DirectoryPath,
            File: 'missing.txt' as FileName,
            FullPath: 'bar/missing.txt',
          })
        )
      ).rejects.toThrow('NotFound');
    });
  });

  describe('s3GetObjectWriteStream', () => {
    let uploadStub: AwsStub<any, any>;
    beforeAll(() => {
      jest.mock('@aws-sdk/lib-storage', () => {
        return {
          Upload: jest.fn().mockImplementation((params) => {
            console.log('KONK900', params);
            return {
              done: async () => ({}),
            };
          }),
        };
      });

      s3Mock.on(PutObjectCommand).callsFake((params) => {
        console.log('KONK90', params);
        return Promise.resolve({});
      });
      s3Mock.on(CreateMultipartUploadCommand).callsFake((params) => {
        console.log('KONK91', params);
        return Promise.resolve({ UploadId: '1' });
      });
      uploadStub = s3Mock.on(UploadPartCommand).callsFake((params) => {
        console.log('KONK92', params);
        return Promise.resolve({ ETag: '1' });
      });
    });
    beforeEach(() => {
      uploadStub.resetHistory();
    });

    it('should function correctly', async () => {
      const result = await fromReaderTaskEither(
        model,
        unit.s3GetObjectWriteStream({
          Type: FileType.File,
          Bucket: 'foobucket',
          Path: 'bar/' as DirectoryPath,
          File: 'exists.txt' as FileName,
          FullPath: 'bar/exists.txt',
        })
      );
      //[FIXME: seems impossible to mock the Upload?]
      // await result.promise;

      expect(result).toBeInstanceOf(Writable);
      expect(result).toBeInstanceOf(PromiseDependentWritableStream);
      expect((result as PromiseDependentWritableStream).promise).toBeDefined();
    });
  });

  describe('s3PutObject', () => {
    let putObjectStub: AwsStub<any, any>;
    beforeAll(() => {
      putObjectStub = s3Mock.on(PutObjectCommand).callsFake((params) => {
        if (params.Bucket.includes('foobucket')) {
          return Promise.resolve({});
        }
        return Promise.reject('GeneralError');
      });
    });
    beforeEach(() => {
      putObjectStub.resetHistory();
    });

    it('should function correctly with data', async () => {
      await fromReaderTaskEither(
        model,
        unit.s3PutObject(
          {
            Type: FileType.File,
            Bucket: 'foobucket',
            Path: 'bar/' as DirectoryPath,
            File: 'exists.txt' as FileName,
            FullPath: 'bar/exists.txt',
          },
          'some-data'
        )
      );

      expect(putObjectStub.calls().length).toBe(1);
      expect(putObjectStub.call(0).args[0].input).toStrictEqual({
        Bucket: 'foobucket',
        Key: 'bar/exists.txt',
        Data: 'some-data',
      });
    });

    it('should function correctly without data', async () => {
      await fromReaderTaskEither(
        model,
        unit.s3PutObject({
          Type: FileType.File,
          Bucket: 'foobucket',
          Path: 'bar/' as DirectoryPath,
          File: 'exists.txt' as FileName,
          FullPath: 'bar/exists.txt',
        })
      );

      expect(putObjectStub.calls().length).toBe(1);
      expect(putObjectStub.call(0).args[0].input).toStrictEqual({
        Bucket: 'foobucket',
        Key: 'bar/exists.txt',
      });
    });

    it('should fail correctly', async () => {
      await expect(
        fromReaderTaskEither(
          model,
          unit.s3PutObject(
            {
              Type: FileType.File,
              Bucket: 'barbucket',
              Path: 'bar/' as DirectoryPath,
              File: 'exists.txt' as FileName,
              FullPath: 'bar/exists.txt',
            },
            'some-data'
          )
        )
      ).rejects.toThrow('GeneralError');
    });
  });

  describe('s3DeleteObject', () => {
    let deleteObjectStub: AwsStub<any, any>;
    beforeAll(() => {
      deleteObjectStub = s3Mock.on(DeleteObjectCommand).callsFake((params) => {
        if (params.Bucket.includes('foobucket')) {
          return Promise.resolve({});
        }
        return Promise.reject('GeneralError');
      });
    });
    beforeEach(() => {
      deleteObjectStub.resetHistory();
    });

    it('should function correctly with data', async () => {
      await fromReaderTaskEither(
        model,
        unit.s3DeleteObject({
          Type: FileType.File,
          Bucket: 'foobucket',
          Path: 'bar/' as DirectoryPath,
          File: 'exists.txt' as FileName,
          FullPath: 'bar/exists.txt',
        })
      );

      expect(deleteObjectStub.calls().length).toBe(1);
      expect(deleteObjectStub.call(0).args[0].input).toStrictEqual({
        Bucket: 'foobucket',
        Key: 'bar/exists.txt',
      });
    });

    it('should fail correctly', async () => {
      await expect(
        fromReaderTaskEither(
          model,
          unit.s3DeleteObject({
            Type: FileType.File,
            Bucket: 'barbucket',
            Path: 'bar/' as DirectoryPath,
            File: 'exists.txt' as FileName,
            FullPath: 'bar/exists.txt',
          })
        )
      ).rejects.toThrow('GeneralError');
    });
  });

  describe('readlineInterfaceFromReadStream', () => {
    it('should work as expected', async () => {
      const readStream = new PassThrough();
      const result = await fromReaderTaskEither(model, unit.readlineInterfaceFromReadStream(readStream));
      expect(result).toBeInstanceOf(readline.Interface);
    });
  });
});