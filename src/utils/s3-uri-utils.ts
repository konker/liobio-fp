import * as AWS from 'aws-sdk';
import path from 'path';
import { URL } from 'url';

import type { DirectoryPath, FileName, IoUrl } from '../accessor/DataAccessor';
import { FileType } from '../accessor/DataAccessor';
import * as P from '../prelude';

export type S3IoUrl<S extends string = string> = IoUrl & `s3://${S}`;
export const S3_PROTOCOL = 's3:';
const FILE_EXT_RE = /\.[^.]+$/;
const SLASH = '';

export type S3UrlData = {
  Bucket: string;
  Path: DirectoryPath;
  File?: FileName | undefined;
  Type: FileType;
  FullPath: string;
};
export type S3UrlDataDirectory = S3UrlData & { Type: FileType.Directory };
export type S3UrlDataFile = S3UrlData & { Type: FileType.File };

export function s3UrlDataIsDirectory(parsed: S3UrlData): parsed is S3UrlDataDirectory {
  return parsed.Type === FileType.Directory;
}

export function s3UrlDataIsFile(parsed: S3UrlData): parsed is S3UrlDataFile {
  return parsed.Type === FileType.File;
}

type ParsedUrl = {
  protocol: string;
  host: string;
  pathname: string;
};

/**
 * Trim a trailing slash, if present
 *
 * @param s
 */
export function trimSlash(s: string): string {
  return s.endsWith(path.posix.sep) ? s.slice(0, -1) : s;
}

/**
 * Create an S3 URL from the given parts
 *
 * @param bucket
 * @param [dirPath]
 * @param [part]
 */
export function createS3Url(bucket: string, dirPath?: string, part?: string): S3IoUrl {
  return `${S3_PROTOCOL}//${path.posix.join(bucket, dirPath || '/', part || '')}` as S3IoUrl;
}

/**
 * Parse an S3 URL into its constituent parts
 * [FIXME:fp throws]
 *
 * @param {S3Url} s3url
 */
export function parseS3Url(s3url: string): P.Either<string, S3UrlData> {
  return P.Either_.tryCatch(() => {
    const parsed: ParsedUrl = { protocol: '', host: '', pathname: '' };
    try {
      const u = new URL(s3url);
      parsed.protocol = u.protocol;
      parsed.host = u.host;
      parsed.pathname = u.pathname;
    } catch (ex) {
      throw new TypeError(`[s3-uri-utils] Could not parse: ${s3url}`);
    }

    if (parsed.protocol !== S3_PROTOCOL) {
      throw new TypeError(`[s3-uri-utils] Incorrect protocol, expected ${S3_PROTOCOL}: ${s3url}`);
    }
    if (!parsed.host) {
      throw new TypeError(`[s3-uri-utils] Could not determine bucket name: ${s3url}`);
    }
    if (parsed.host !== parsed.host.toLowerCase()) {
      throw new TypeError(
        `[s3-uri-utils] S3 URLs must have a lower case bucket component (note that S3 itself is case sensitive): ${s3url}`
      );
    }

    parsed.pathname = parsed.pathname || '/';
    if (parsed.pathname.endsWith(path.posix.sep)) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }
    if (parsed.pathname.startsWith(path.posix.sep)) {
      parsed.pathname = parsed.pathname.slice(1);
    }

    const parts = parsed.pathname.split(path.posix.sep);
    const lastPart = parts.pop() || '';
    const fileComponent = isS3File(lastPart) ? lastPart : undefined;
    if (!fileComponent) {
      parts.push(lastPart);
    }

    if (parts.length > 0 && parts[0] !== SLASH) parts.push(SLASH);
    const pathComponent = parts.join(path.posix.sep);
    const fullPathComponent = fileComponent ? path.posix.join(pathComponent, fileComponent) : pathComponent;

    return {
      Bucket: parsed.host,
      Path: pathComponent as DirectoryPath,
      File: fileComponent as FileName,
      Type: fileComponent ? FileType.File : FileType.Directory,
      FullPath: fullPathComponent,
    };
  }, String);
}

/**
 * Test to detect if the given path is a valid S3 URL
 *
 * @param s3url
 */
export function isS3Url(s3url: string): boolean {
  let parsed;
  try {
    parsed = new URL(s3url);
  } catch (ex) {
    return false;
  }

  if (parsed.protocol !== S3_PROTOCOL) {
    return false;
  }
  if (!parsed.host) {
    return false;
  }
  if (parsed.host !== parsed.host.toLowerCase()) {
    return false;
  }
  return true;
}

/**
 * Test a string to detect if it is a file path
 *
 * @param part
 */
export function isS3File(part: string): boolean {
  return part.match(FILE_EXT_RE) !== null;
}

/**
 * Get a temporary signed access URL for the given S3 resource
 *
 * @param {S3Url} s3url
 */
export function createHttpsUrl(s3url: S3IoUrl): P.TaskEither<string, string> {
  return P.pipe(
    parseS3Url(s3url),
    P.TaskEither_.fromEither,
    P.TaskEither_.chain((parts) =>
      P.TaskEither_.tryCatch(async () => {
        const params = { Bucket: parts.Bucket, Key: parts.FullPath };
        const s3 = new AWS.S3({ region: process.env['AWS_REGION'] as string, apiVersion: '2006-03-01' });

        return s3.getSignedUrlPromise('getObject', params);
      }, String)
    )
  );
}
