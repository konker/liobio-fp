import * as S3 from '@aws-sdk/client-s3';
import path from 'path';
import type _readline from 'readline';
import type { Readable, Writable } from 'stream';

import * as P from '../../prelude';
import type { Err, FileName, Path } from '../../types';
import { FileType, toErr } from '../../types';
import type { S3IoUrl, S3UrlData } from '../../utils/s3-uri-utils';
import * as s3Utils from '../../utils/s3-uri-utils';
import { createS3Url, s3UrlDataIsDirectory, s3UrlDataIsFile } from '../../utils/s3-uri-utils';
import type { DataAccessor } from '../DataAccessor';
import type { Model } from './lib';
import {
  readlineInterfaceFromReadStream,
  s3DeleteObject,
  s3GetObject,
  s3GetObjectReadStream,
  s3GetObjectWriteStream,
  s3HeadObject,
  s3ListObjects,
  s3PutObject,
} from './lib';

function listFiles(s3url: string): P.ReaderTaskEither<Model, Err, Array<S3IoUrl>> {
  function _processListing(parsed: S3UrlData, list: Array<any> | undefined, key: string): Array<S3IoUrl> {
    if (!list) return [];
    return (
      list
        // Drop any bad keys
        .filter((item) => item[key])
        .map(
          // Extract the last part of the path relative to the prefix
          (item) => relative(parsed.Path, item[key]).split(path.posix.sep).shift() as string
        )
        .filter((item) => item !== '')
        .map(
          // Convert each item to full S3 url
          (item: string) => s3Utils.createS3Url(parsed.Bucket, parsed.Path, item)
        )
    );
  }

  return (model) =>
    P.pipe(
      s3Utils.parseS3Url(s3url),
      P.Either_.chain(
        P.Either_.fromPredicate(s3UrlDataIsDirectory, () =>
          toErr('[S3DataAccessor] Cannot list files with a non-directory url')
        )
      ),
      P.Task_.of,
      P.TaskEither_.chain((parsed) =>
        P.pipe(
          model,
          s3ListObjects(parsed),
          P.TaskEither_.chain((allFiles) =>
            P.pipe(
              P.TaskEither_.tryCatch(async () => {
                if (allFiles.IsTruncated) {
                  throw new Error(`[S3DataAccessor] Error: listing is truncated: ${s3url}`);
                }

                return _processListing(parsed, allFiles.CommonPrefixes, 'Prefix').concat(
                  _processListing(parsed, allFiles.Contents, 'Key')
                );
              }, toErr)
            )
          )
        )
      )
    );
}

function getFileType(s3url: string): P.TaskEither<Err, FileType> {
  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.Either_.map((parsed) => parsed.Type),
    P.Task_.of
  );
}

function exists(s3url: string): P.ReaderTaskEither<Model, Err, boolean> {
  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.ReaderTask_.of,
    P.ReaderTaskEither_.chain(s3HeadObject),
    P.ReaderTaskEither_.orElse((ex: unknown) =>
      (ex as any).code === 'NotFound' ? P.ReaderTaskEither_.right(false) : P.ReaderTaskEither_.left(toErr(ex))
    )
  );
}

function readFile(s3url: string): P.ReaderTaskEither<Model, Err, Buffer> {
  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.Either_.chain(
      P.Either_.fromPredicate(s3UrlDataIsFile, () => toErr('[S3DataAccessor] Cannot read a file with a directory url'))
    ),
    P.ReaderTask_.of,
    P.ReaderTaskEither_.chain(s3GetObject)
  );
}

function writeFile(s3url: string, data: Buffer | string): P.ReaderTaskEither<Model, Err, void> {
  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.Either_.chain(
      P.Either_.fromPredicate(s3UrlDataIsFile, () => toErr('[S3DataAccessor] Cannot write a file with a directory url'))
    ),
    P.ReaderTask_.of,
    P.ReaderTaskEither_.chain((parsed) => s3PutObject(parsed, data))
  );
}

function deleteFile(s3url: string): P.ReaderTaskEither<Model, Err, void> {
  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.Either_.chain(
      P.Either_.fromPredicate(s3UrlDataIsFile, () =>
        toErr('[S3DataAccessor] Cannot delete a file with a directory url')
      )
    ),
    P.ReaderTask_.of,
    P.ReaderTaskEither_.chain(s3DeleteObject)
  );
}

function createDirectory(s3url: string): P.ReaderTaskEither<Model, Err, void> {
  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.Either_.chain(
      P.Either_.fromPredicate(s3UrlDataIsDirectory, () =>
        toErr('[S3DataAccessor] Cannot create a directory with a non-directory url')
      )
    ),
    P.ReaderTask_.of,
    P.ReaderTaskEither_.chain(s3PutObject)
  );
}

function removeDirectory(s3url: string): P.ReaderTaskEither<Model, Err, void> {
  function _purgeItem(s3ItemUrl: S3IoUrl): P.ReaderTaskEither<Model, Err, void> {
    return P.pipe(
      getFileType(s3ItemUrl),
      P.Reader_.of,
      P.ReaderTaskEither_.chain((fileType) =>
        fileType === FileType.Directory ? removeDirectory(s3ItemUrl) : deleteFile(s3ItemUrl)
      )
    );
  }

  return P.pipe(
    // Remove contents of the directory
    listFiles(s3url),
    P.ReaderTaskEither_.chain((dirContent) =>
      P.pipe(
        dirContent,
        P.Array_.map(_purgeItem),
        P.Array_.sequence(P.ReaderTaskEither_.ApplicativePar),
        P.ReaderTaskEither_.map(P.Monoid_.concatAll(P.void_.Monoid))
      )
    ),

    // Remove the directory itself.
    // No need to check if is a Directory url, as listFiles will have already failed
    P.ReaderTaskEither_.chain((_void) =>
      P.pipe(s3Utils.parseS3Url(s3url), P.ReaderTask_.of, P.ReaderTaskEither_.chain(s3DeleteObject))
    )
  );
}

function getFileReadStream(s3url: string): P.ReaderTaskEither<Model, Err, Readable> {
  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.Either_.chain(
      P.Either_.fromPredicate(s3UrlDataIsFile, () => toErr('[S3DataAccessor] Cannot read a file with a non-file url'))
    ),
    P.ReaderTask_.of,
    P.ReaderTaskEither_.chain(s3GetObjectReadStream)
  );
}

function getFileLineReadStream(s3url: string): P.ReaderTaskEither<Model, Err, _readline.Interface> {
  return P.pipe(
    getFileReadStream(s3url),
    P.Reader_.map(
      P.TaskEither_.chain((x) => {
        return readlineInterfaceFromReadStream(x);
      })
    )
  );
}

function getFileWriteStream(s3url: string): P.ReaderTaskEither<Model, Err, Writable> {
  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.Either_.chain(
      P.Either_.fromPredicate(s3UrlDataIsFile, () =>
        toErr('[S3DataAccessor] Cannot write to a file with a non-file url')
      )
    ),
    P.ReaderTask_.of,
    P.ReaderTaskEither_.chain(s3GetObjectWriteStream)
  );
}

function dirName(filePath: string): P.TaskEither<Err, S3IoUrl> {
  return P.pipe(
    s3Utils.parseS3Url(filePath),
    P.Either_.map((parsed) => createS3Url(parsed.Bucket, parsed.Path)),
    P.Task_.of
  );
}

function fileName(filePath: string): P.TaskEither<Err, P.Option<FileName>> {
  return P.pipe(
    s3Utils.parseS3Url(filePath),
    P.Either_.map((parsed) => P.pipe(parsed.File, P.Option_.fromNullable)),
    P.Task_.of
  );
}

function joinPath(...parts: Array<string>): P.Either<Err, S3IoUrl | Path> {
  if (!parts[0]) return P.Either_.right('' as Path);
  return parts[0].startsWith(s3Utils.S3_PROTOCOL)
    ? P.pipe(
        s3Utils.parseS3Url(parts[0]),
        P.Either_.map((parsed) =>
          s3Utils.createS3Url(parsed.Bucket, path.posix.join(parsed.FullPath, ...parts.slice(1)))
        )
      )
    : P.Either_.of(path.posix.join(...parts) as Path);
}

function relative(from: string, to: string): S3IoUrl {
  return path.posix.relative(from, to) as S3IoUrl;
}

function extname(filePath: string): string {
  return path.posix.extname(filePath);
}

export function s3DataAccessor(): P.Task<DataAccessor> {
  return async () => {
    const model: Model = {
      s3: new S3.S3Client(Object.assign({}, process.env.AWS_REGION ? { region: process.env.AWS_REGION } : {})),
    };

    return {
      PATH_SEP: path.posix.sep,
      ID: 'S3DataAccessor',

      // Eliminate the Readers by using the created model
      listFiles: P.flow(listFiles, (r) => r(model)),
      getFileType,
      exists: P.flow(exists, (r) => r(model)),
      readFile: P.flow(readFile, (r) => r(model)),
      writeFile: P.flow(writeFile, (r) => r(model)),
      deleteFile: P.flow(deleteFile, (r) => r(model)),
      createDirectory: P.flow(createDirectory, (r) => r(model)),
      removeDirectory: P.flow(removeDirectory, (r) => r(model)),
      getFileReadStream: P.flow(getFileReadStream, (r) => r(model)),
      getFileLineReadStream: P.flow(getFileLineReadStream, (r) => r(model)),
      getFileWriteStream: P.flow(getFileWriteStream, (r) => r(model)),
      dirName,
      fileName,
      joinPath,
      relative,
      extname,
    };
  };
}
