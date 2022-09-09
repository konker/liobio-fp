// [XXX: need to require AWS to be able to mock it in this way]
// tslint:disable-next-line:no-var-requires
const AWS = require('aws-sdk');
import sinon from 'sinon';
import * as s3UriUtils from './s3-uri-utils';

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
      expect(s3UriUtils.parseS3Url('s3://foobucket/bar/baz/qux.csv')).toStrictEqual({
        Bucket: 'foobucket',
        Path: 'bar/baz/',
        File: 'qux.csv',
        FullPath: 'bar/baz/qux.csv',
      });
      expect(s3UriUtils.parseS3Url('s3://foobucket/bar/baz/')).toStrictEqual({
        Bucket: 'foobucket',
        Path: 'bar/baz/',
        File: undefined,
        FullPath: 'bar/baz/',
      });
      expect(s3UriUtils.parseS3Url('s3://foobucket/bar/baz')).toStrictEqual({
        Bucket: 'foobucket',
        Path: 'bar/baz/',
        File: undefined,
        FullPath: 'bar/baz/',
      });
      expect(s3UriUtils.parseS3Url('s3://foobucket/bar/')).toStrictEqual({
        Bucket: 'foobucket',
        Path: 'bar/',
        File: undefined,
        FullPath: 'bar/',
      });
      expect(s3UriUtils.parseS3Url('s3://foobucket/')).toStrictEqual({
        Bucket: 'foobucket',
        Path: '',
        File: undefined,
        FullPath: '',
      });
      expect(s3UriUtils.parseS3Url('s3://foobucket')).toStrictEqual({
        Bucket: 'foobucket',
        Path: '',
        File: undefined,
        FullPath: '',
      });
    });

    it('should fail correctly', () => {
      expect(() => s3UriUtils.parseS3Url('http://foobucket/bar/baz/qux.csv')).toThrow(
        '[s3-uri-utils] Incorrect protocol',
      );
      expect(() => s3UriUtils.parseS3Url('s3://FooBucket/bar/baz/qux.csv')).toThrow(
        's3-uri-utils] S3 URLs must have a lower case bucket component',
      );
      expect(() => s3UriUtils.parseS3Url('s3://')).toThrow('[s3-uri-utils] Could not determine bucket name');
    });
  });

  describe('createHttpsUrl', () => {
    const sandbox = sinon.createSandbox();
    beforeAll(() => {
      process.env['AWS_S3_US_EAST_1_REGIONAL_ENDPOINT'] = 'regional';
      // tslint:disable-next-line:only-arrow-functions
      sandbox.stub(AWS, 'S3').value(function () {
        return {
          getSignedUrlPromise: sandbox
            .stub()
            .callsFake((_, params) =>
              Promise.resolve(
                `https://${params.Bucket}.s3.eu-west-1.amazonaws.com/${params.Key}?AWSAccessKeyId=blahblah&signature=blahblah`,
              ),
            ),
        };
      });
    });
    afterAll(() => {
      delete process.env['AWS_S3_US_EAST_1_REGIONAL_ENDPOINT'];
      sandbox.restore();
    });

    it('should function correctly', async () => {
      const s3url = 's3://foo/bar/baz.txt';

      expect(await s3UriUtils.createHttpsUrl(s3url)).toMatch(/^https:\/\/foo.s3.eu-west-1.amazonaws.com\/bar\/baz.txt/);
    });
  });
});