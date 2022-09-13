// tslint:disable-next-line:no-var-requires
import _path from 'path';
import _readline from 'readline';
import type { Readable, Writable } from 'stream';

import * as P from '../prelude';
import { PromiseDependentWritableStream } from '../stream/PromiseDependentWritableStream';
import type { S3IoUrl, S3UrlData, S3UrlDataDirectory, S3UrlDataFile } from '../utils/s3-uri-utils';
import * as s3Utils from '../utils/s3-uri-utils';
import { createS3Url, s3UrlDataIsDirectory, s3UrlDataIsFile } from '../utils/s3-uri-utils';
import type { DataAccessor, FileName, IoUrl, Path } from './DataAccessor';
import { FileType } from './DataAccessor';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require('aws-sdk');

type Model = {
  s3: AWS.S3;
  path: typeof _path;
  readline: typeof _readline;
};

//[FIXME:fp throws]
function listFiles(s3url: string): P.ReaderTaskEither<Model, string, Array<S3IoUrl>> {
  return (model) =>
    P.pipe(
      s3Utils.parseS3Url(s3url),
      P.TaskEither_.fromEither,
      P.TaskEither_.chain((parsed) =>
        P.TaskEither_.tryCatch(async () => {
          if (parsed.File) {
            throw new Error('[S3DataAccessor] Could not list files, non-directory path given');
          }

          const allFiles = await model.s3
            .listObjectsV2({
              Bucket: parsed.Bucket,
              Delimiter: '/',
              Prefix: parsed.Path,
            })
            .promise();

          if (allFiles.IsTruncated) {
            // tslint:disable-next-line:no-console
            console.warn(`[S3DataAccessor] WARNING: listing is truncated: ${s3url}`);
          }

          function _processList(list: Array<any> | undefined, key: string): Array<S3IoUrl> {
            if (!list) return [];
            return list
              .filter((item) => item[key]) // Drop any bad keys
              .map(
                //[FIXME:fp naive]
                (item) => relative(parsed.Path, item[key])(model).split(model.path.posix.sep).shift() as string // Extract the last part of the path relative to the prefix
              )
              .filter((item) => item !== '')
              .map((item: string) => s3Utils.createS3Url(parsed.Bucket, parsed.Path, item)); // Convert each item to full S3 url
          }

          return _processList(allFiles.CommonPrefixes, 'Prefix').concat(_processList(allFiles.Contents, 'Key'));
        }, String)
      )
    );
}

function getFileType(s3url: string): P.TaskEither<string, FileType> {
  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.Either_.map((parsed) => parsed.Type),
    P.Task_.of
  );
}

function exists(s3url: string): P.ReaderTaskEither<Model, string, boolean> {
  function _head(parsed: S3UrlData): P.ReaderTaskEither<Model, unknown, boolean> {
    return (model) =>
      P.TaskEither_.tryCatch(async () => {
        await model.s3
          .headObject({
            Bucket: parsed.Bucket,
            Key: parsed.FullPath,
          })
          .promise();
        return true;
      }, P.identity);
  }

  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.ReaderTask_.of,
    P.ReaderTaskEither_.chain(_head),
    P.ReaderTaskEither_.orElse((ex: unknown) =>
      (ex as any).code === 'NotFound' ? P.ReaderTaskEither_.right(false) : P.ReaderTaskEither_.left(String(ex))
    )
  );
}

function readFile(s3url: string): P.ReaderTaskEither<Model, string, Buffer> {
  function _get(parsed: S3UrlDataFile): P.ReaderTaskEither<Model, string, Buffer> {
    return (model) =>
      P.TaskEither_.tryCatch(async () => {
        const s3File = await model.s3.getObject({ Bucket: parsed.Bucket, Key: parsed.FullPath }).promise();

        if (s3File.Body instanceof Buffer) return s3File.Body;
        if (!s3File.Body) return Buffer.from([]);
        return Buffer.from(s3File.Body as any);
      }, String);
  }

  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.Either_.chain(
      P.Either_.fromPredicate(s3UrlDataIsFile, () => '[S3DataAccessor] Cannot read a file with a directory url')
    ),
    P.ReaderTask_.of,
    P.ReaderTaskEither_.chain(_get)
  );
}

function writeFile(s3url: string, data: Buffer | string): P.ReaderTaskEither<Model, string, void> {
  function _put(parsed: S3UrlDataFile, data: Buffer | string): P.ReaderTaskEither<Model, string, void> {
    return (model) =>
      P.TaskEither_.tryCatch(async () => {
        await model.s3
          .putObject({
            Bucket: parsed.Bucket,
            Key: parsed.FullPath,
            Body: data,
          })
          .promise();
      }, String);
  }

  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.Either_.chain(
      P.Either_.fromPredicate(s3UrlDataIsFile, () => '[S3DataAccessor] Cannot write a file with a directory url')
    ),
    P.ReaderTask_.of,
    P.ReaderTaskEither_.chain((parsed) => _put(parsed, data))
  );
}

function deleteFile(s3url: string): P.ReaderTaskEither<Model, string, void> {
  function _purgeRoot(parsed: S3UrlDataFile): P.ReaderTaskEither<Model, string, void> {
    return (model) =>
      P.TaskEither_.tryCatch(async () => {
        await model.s3
          .deleteObject({
            Bucket: parsed.Bucket,
            Key: parsed.FullPath,
          })
          .promise();
      }, String);
  }

  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.Either_.chain(
      P.Either_.fromPredicate(s3UrlDataIsFile, () => '[S3DataAccessor] Cannot delete a file with a directory url')
    ),
    P.ReaderTask_.of,
    P.ReaderTaskEither_.chain(_purgeRoot)
  );
}

function createDirectory(s3url: string): P.ReaderTaskEither<Model, string, void> {
  function _create(parsed: S3UrlDataDirectory): P.ReaderTaskEither<Model, string, void> {
    return (model) =>
      P.TaskEither_.tryCatch(async () => {
        await model.s3
          .putObject({
            Bucket: parsed.Bucket,
            Key: parsed.FullPath,
          })
          .promise();
      }, String);
  }

  return P.pipe(
    s3Utils.parseS3Url(s3url),
    P.Either_.chain(
      P.Either_.fromPredicate(
        s3UrlDataIsDirectory,
        () => '[S3DataAccessor] Cannot create a directory with a non-directory url'
      )
    ),
    P.ReaderTask_.of,
    P.ReaderTaskEither_.chain(_create)
  );
}

function removeDirectory(s3url: string): P.ReaderTaskEither<Model, string, void> {
  function _purgeItem(s3ItemUrl: S3IoUrl): P.ReaderTaskEither<Model, string, void> {
    return P.pipe(
      getFileType(s3ItemUrl),
      P.Reader_.of,
      P.ReaderTaskEither_.chain((fileType) =>
        fileType === FileType.Directory ? removeDirectory(s3ItemUrl) : deleteFile(s3ItemUrl)
      )
    );
  }

  function _purgeRoot(parsed: S3UrlData): P.ReaderTaskEither<Model, string, void> {
    return (model) =>
      P.TaskEither_.tryCatch(async () => {
        await model.s3
          .deleteObject({
            Bucket: parsed.Bucket,
            Key: parsed.FullPath,
          })
          .promise();
      }, String);
  }

  return P.pipe(
    // Remove contents of the directory
    listFiles(s3url),
    P.ReaderTaskEither_.chain((dirContent) =>
      P.pipe(
        dirContent,
        P.Array_.map(_purgeItem),
        P.Array_.sequence(P.ReaderTaskEither_.ApplicativePar),
        P.ReaderTaskEither_.map(P.Array_.reduce(P.void_.Monoid.empty, P.void_.Monoid.concat))
      )
    ),

    // Remove the directory itself
    P.ReaderTaskEither_.chain((_void) =>
      P.pipe(s3Utils.parseS3Url(s3url), P.ReaderTask_.of, P.ReaderTaskEither_.chain(_purgeRoot))
    )
  );
}

function getFileReadStream(s3url: string): P.ReaderTaskEither<Model, string, Readable> {
  return (model) =>
    P.pipe(
      s3Utils.parseS3Url(s3url),
      P.Task_.of,
      P.TaskEither_.chain((parsed) =>
        P.TaskEither_.tryCatch(async () => {
          return model.s3.getObject({ Bucket: parsed.Bucket, Key: parsed.FullPath }).createReadStream() as Readable;
        }, String)
      )
    );
}

//[FIXME:fp _readline?]
function getFileLineReadStream(s3url: string): P.ReaderTaskEither<Model, string, _readline.Interface> {
  return (model) =>
    P.pipe(
      model,
      getFileReadStream(s3url),
      P.TaskEither_.chain((readStream) =>
        P.TaskEither_.tryCatch(
          async () =>
            model.readline.createInterface({
              input: readStream,
              historySize: 0,
              terminal: false,
              crlfDelay: Infinity,
              escapeCodeTimeout: 10000,
            }),
          String
        )
      )
    );
}

function getFileWriteStream(s3url: string): P.ReaderTaskEither<Model, string, Writable> {
  return (model) =>
    P.pipe(
      s3Utils.parseS3Url(s3url),
      P.Task_.of,
      P.TaskEither_.chain((parsed) =>
        P.TaskEither_.tryCatch(async () => {
          const promiseDependentWritableStream = new PromiseDependentWritableStream();
          promiseDependentWritableStream.promise = model.s3
            .upload({ Bucket: parsed.Bucket, Key: parsed.FullPath, Body: promiseDependentWritableStream })
            .promise();
          return promiseDependentWritableStream;
        }, String)
      )
    );
}

function dirName(filePath: string): P.ReaderTaskEither<Model, string, S3IoUrl> {
  return P.pipe(
    s3Utils.parseS3Url(filePath),
    P.Either_.map((parsed) => createS3Url(parsed.Bucket, parsed.Path)),
    P.ReaderTask_.of
  );
}

function fileName(filePath: string): P.ReaderTaskEither<Model, string, P.Option<FileName>> {
  return P.pipe(
    s3Utils.parseS3Url(filePath),
    P.Either_.map((parsed) => P.pipe(parsed.File, P.Option_.fromNullable)),
    P.ReaderTask_.of
  );
}

function joinPath(...parts: Array<string>): P.ReaderEither<Model, string, S3IoUrl | Path> {
  return (model) => {
    if (!parts[0]) return P.Either_.right('' as Path);
    return parts[0].startsWith(s3Utils.S3_PROTOCOL)
      ? P.pipe(
          s3Utils.parseS3Url(parts[0]),
          P.Either_.map((parsed) =>
            s3Utils.createS3Url(parsed.Bucket, model.path.posix.join(parsed.FullPath, ...parts.slice(1)))
          )
        )
      : P.Either_.of(model.path.posix.join(...parts) as Path);
  };
}

function relative(from: string, to: string): P.Reader<Model, S3IoUrl> {
  return ({ path }) => path.posix.relative(from, to) as S3IoUrl;
}

function extname(filePath: string): P.Reader<Model, string> {
  return ({ path }) => path.posix.extname(filePath);
}

export function s3DataAccessor(): P.Task<DataAccessor> {
  return async () => {
    const model: Model = {
      s3: new AWS.S3({ region: process.env['AWS_REGION'], apiVersion: '2006-03-01' }),
      path: _path,
      readline: _readline,
    };

    return {
      PATH_SEP: _path.posix.sep,
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
      dirName: P.flow(dirName, (r) => r(model)),
      fileName: P.flow(fileName, (r) => r(model)),
      joinPath: P.flow(joinPath, (r) => r(model)),
      relative: P.flow(relative, (r) => r(model)),
      extname: P.flow(extname, (r) => r(model)),
    };
  };
}
