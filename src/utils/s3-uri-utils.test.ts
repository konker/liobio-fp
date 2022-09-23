import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import * as s3RequestPresigner from '@aws-sdk/s3-request-presigner';
import type { AwsStub } from 'aws-sdk-client-mock';
import { mockClient } from 'aws-sdk-client-mock';
import { fromEither, fromTaskEither } from 'ruins-ts';

import { FileType } from '../types';
import type { S3IoUrl } from './s3-uri-utils';
import * as s3UriUtils from './s3-uri-utils';

jest.mock('@aws-sdk/s3-request-presigner');

describe('S3 URI Utils', () => {
  describe('helpers', () => {
    it('should trimSlash', () => {
      expect(s3UriUtils.trimSlash('/foo/bar')).toBe('/foo/bar');
      expect(s3UriUtils.trimSlash('/foo/bar/')).toBe('/foo/bar');
      expect(s3UriUtils.trimSlash('/')).toBe('');
    });
  });

  describe('isS3File', () => {
    it('should function correctly', () => {
      expect(s3UriUtils.isS3File('s3://foo/bar')).toBe(false);
      expect(s3UriUtils.isS3File('s3://foo/bar/')).toBe(false);
      expect(s3UriUtils.isS3File('s3://foo/bar/baz.txt')).toBe(true);
      expect(s3UriUtils.isS3File('s3://foo/bar/baz.csv.json.txt')).toBe(true);
    });
  });

  describe('createS3Url', () => {
    it('should function correctly', () => {
      expect(s3UriUtils.createS3Url('foobucket', '/bar/baz', 'qux.csv')).toBe('s3://foobucket/bar/baz/qux.csv');
      expect(s3UriUtils.createS3Url('foobucket', '/bar/baz/', 'qux.csv')).toBe('s3://foobucket/bar/baz/qux.csv');
      expect(s3UriUtils.createS3Url('foobucket', '/', 'qux.csv')).toBe('s3://foobucket/qux.csv');
      expect(s3UriUtils.createS3Url('foobucket')).toBe('s3://foobucket/');
      expect(s3UriUtils.createS3Url('foobucket', '/')).toBe('s3://foobucket/');
      expect(s3UriUtils.createS3Url('foobucket', '/bar/baz')).toBe('s3://foobucket/bar/baz');
      expect(s3UriUtils.createS3Url('foobucket', '', 'bar/baz/qux.csv')).toBe('s3://foobucket/bar/baz/qux.csv');
    });
  });

  describe('isS3Url', () => {
    it('should function correctly', () => {
      expect(s3UriUtils.isS3Url('s3://foobucket/bar/baz/qux.csv')).toBe(true);
      expect(s3UriUtils.isS3Url('s3://foobucket/bar/baz/')).toBe(true);
      expect(s3UriUtils.isS3Url('s3://foobucket/bar/baz')).toBe(true);
      expect(s3UriUtils.isS3Url('s3://foobucket/bar/')).toBe(true);
      expect(s3UriUtils.isS3Url('s3://foobucket/')).toBe(true);
      expect(s3UriUtils.isS3Url('s3://foobucket')).toBe(true);
    });

    it('should fail correctly', () => {
      expect(s3UriUtils.isS3Url('http://foobucket/bar/baz/qux.csv')).toBe(false);
      expect(s3UriUtils.isS3Url('bar/baz/qux.csv')).toBe(false);
      expect(s3UriUtils.isS3Url('s3://FooBucket/bar/baz/qux.csv')).toBe(false);
      expect(s3UriUtils.isS3Url('s3://')).toBe(false);
    });
  });

  describe('parseS3Url', () => {
    it('should function correctly', () => {
      expect(fromEither(s3UriUtils.parseS3Url('s3://foobucket/bar/baz/qux.csv'))).toStrictEqual({
        Bucket: 'foobucket',
        Path: 'bar/baz/',
        File: 'qux.csv',
        Type: FileType.File,
        FullPath: 'bar/baz/qux.csv',
      });
      expect(fromEither(s3UriUtils.parseS3Url('s3://foobucket/bar/baz/'))).toStrictEqual({
        Bucket: 'foobucket',
        Path: 'bar/baz/',
        File: undefined,
        Type: FileType.Directory,
        FullPath: 'bar/baz/',
      });
      expect(fromEither(s3UriUtils.parseS3Url('s3://foobucket/bar/baz'))).toStrictEqual({
        Bucket: 'foobucket',
        Path: 'bar/baz/',
        File: undefined,
        Type: FileType.Directory,
        FullPath: 'bar/baz/',
      });
      expect(fromEither(s3UriUtils.parseS3Url('s3://foobucket/bar/'))).toStrictEqual({
        Bucket: 'foobucket',
        Path: 'bar/',
        File: undefined,
        Type: FileType.Directory,
        FullPath: 'bar/',
      });
      expect(fromEither(s3UriUtils.parseS3Url('s3://foobucket/'))).toStrictEqual({
        Bucket: 'foobucket',
        Path: '',
        File: undefined,
        Type: FileType.Directory,
        FullPath: '',
      });
      expect(fromEither(s3UriUtils.parseS3Url('s3://foobucket'))).toStrictEqual({
        Bucket: 'foobucket',
        Path: '',
        File: undefined,
        Type: FileType.Directory,
        FullPath: '',
      });
    });

    it('should fail correctly', () => {
      expect(() => fromEither(s3UriUtils.parseS3Url('http://foobucket/bar/baz/qux.csv'))).toThrow(
        '[s3-uri-utils] Incorrect protocol'
      );
      expect(() => fromEither(s3UriUtils.parseS3Url('s3://FooBucket/bar/baz/qux.csv'))).toThrow(
        's3-uri-utils] S3 URLs must have a lower case bucket component'
      );
      expect(() => fromEither(s3UriUtils.parseS3Url('s3://'))).toThrow(
        '[s3-uri-utils] Could not determine bucket name'
      );
      expect(() => fromEither(s3UriUtils.parseS3Url(''))).toThrow('[s3-uri-utils] Could not parse');
    });
  });

  describe('createHttpsUrl', () => {
    let s3Mock: AwsStub<any, any>;

    beforeAll(() => {
      s3Mock = mockClient(S3Client);
      s3Mock.on(GetObjectCommand).resolves({});

      jest.mocked(s3RequestPresigner.getSignedUrl).mockImplementation((_, params: any) => {
        return Promise.resolve(
          `https://${params.input.Bucket}.s3.eu-west-1.amazonaws.com/${params.input.Key}?AWSAccessKeyId=blahblah&signature=blahblah`
        );
      });
    });
    afterAll(() => {
      s3Mock.restore();
    });

    it('should function correctly', async () => {
      const s3Client = new S3Client({});
      const s3url = 's3://foo/bar/baz.txt' as S3IoUrl;

      expect(await fromTaskEither(s3UriUtils.createHttpsUrl(s3Client, s3url))).toMatch(
        /^https:\/\/foo.s3.eu-west-1.amazonaws.com\/bar\/baz.txt/
      );
    });
  });
});
