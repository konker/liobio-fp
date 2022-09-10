// tslint:disable-next-line:no-var-requires
import _path from 'path';
import _readline from 'readline';
import type { Readable, Writable } from 'stream';

import * as P from '../prelude';
import { PromiseDependentWritableStream } from '../stream/PromiseDependentWritableStream';
import type { S3Url } from '../utils/s3-uri-utils';
import * as s3Utils from '../utils/s3-uri-utils';
import type { DataAccessor } from './DataAccessor';
import { FileType } from './DataAccessor';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require('aws-sdk');

type Model = {
  s3: AWS.S3;
  path: typeof _path;
  readline: typeof _readline;
};

function listFiles(s3url: S3Url): P.ReaderTaskEither<Model, string, Array<string>> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      const parsed = s3Utils.parseS3Url(s3url);
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

      function _processList(list: Array<any> | undefined, key: string): Array<string> {
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
    }, String);
}

function getFileType(s3url: S3Url): P.ReaderTask<Model, FileType> {
  return (_) => async () => {
    const parsed = s3Utils.parseS3Url(s3url);
    if (parsed.File) return FileType.File;
    return FileType.Directory;
  };
}

function exists(s3url: S3Url): P.ReaderTaskEither<Model, string, boolean> {
  return ({ s3 }) =>
    P.TaskEither_.tryCatch(async () => {
      const parsed = s3Utils.parseS3Url(s3url);
      try {
        await s3
          .headObject({
            Bucket: parsed.Bucket,
            Key: parsed.FullPath,
          })
          .promise();
        return true;
      } catch (headErr) {
        if ((headErr as any).code === 'NotFound') {
          return false;
        }

        // Re-throw if some other kind of error
        throw headErr;
      }
    }, String);
}

function readFile(s3url: S3Url): P.ReaderTaskEither<Model, string, Buffer> {
  return ({ s3 }) =>
    P.TaskEither_.tryCatch(async () => {
      const parsed = s3Utils.parseS3Url(s3url);

      const s3File = await s3.getObject({ Bucket: parsed.Bucket, Key: parsed.FullPath }).promise();

      if (s3File.Body instanceof Buffer) return s3File.Body;
      if (!s3File.Body) return Buffer.from([]);
      return Buffer.from(s3File.Body as any);
    }, String);
}

function writeFile(s3url: S3Url, data: Buffer | string): P.ReaderTaskEither<Model, string, void> {
  return ({ s3 }) =>
    P.TaskEither_.tryCatch(async () => {
      const parsed = s3Utils.parseS3Url(s3url);
      if (!parsed.File) {
        throw new TypeError('[S3DataAccessor] Cannot write a file with a directory url');
      }

      await s3
        .putObject({
          Bucket: parsed.Bucket,
          Key: parsed.FullPath,
          Body: data,
        })
        .promise();
    }, String);
}

function deleteFile(s3url: S3Url): P.ReaderTaskEither<Model, string, void> {
  return ({ s3 }) =>
    P.TaskEither_.tryCatch(async () => {
      const parsed = s3Utils.parseS3Url(s3url);
      if (!parsed.File) {
        throw new TypeError('[S3DataAccessor] Cannot delete a file with a directory url');
      }

      await s3
        .deleteObject({
          Bucket: parsed.Bucket,
          Key: parsed.FullPath,
        })
        .promise();
    }, String);
}

function createDirectory(s3url: S3Url): P.ReaderTaskEither<Model, string, void> {
  return (model) =>
    P.TaskEither_.tryCatch(
      async () =>
        P.pipe(
          getFileType(s3url)(model),
          P.Task_.chain((fileType) => async () => {
            //[FIXME:fp naive]
            if (fileType !== FileType.Directory) {
              throw new TypeError('[S3DataAccessor] Cannot create a directory with a non-directory url');
            }
            const parsed = s3Utils.parseS3Url(s3url);
            await model.s3
              .putObject({
                Bucket: parsed.Bucket,
                Key: parsed.FullPath,
              })
              .promise();
          })
        )(), //[FIXME:fp naive]
      String
    );
}

function removeDirectory(s3url: S3Url): P.ReaderTaskEither<Model, string, void> {
  return (model) =>
    P.TaskEither_.tryCatch(
      async () =>
        P.pipe(
          getFileType(s3url)(model), //[FIXME:fp naive]
          (x) => x,
          P.Task_.chain((fileType) => async () => {
            //[FIXME:fp naive]
            if (fileType !== FileType.Directory) {
              throw new TypeError('[S3DataAccessor] Cannot remove a directory with a non-directory url');
            }
            const parsed = s3Utils.parseS3Url(s3url);

            // // Try to delete the contents of this dir (recursive)
            // const dirContent = await listFiles(s3url);
            // for (const s3FileUrl of dirContent) {
            //   if ((await getFileType(s3FileUrl)) === FileType.Directory) {
            //     // Recurse for sub-folders
            //     await removeDirectory(s3FileUrl);
            //   } else {
            //     await deleteFile(s3FileUrl);
            //   }
            // }
            await P.pipe(
              listFiles(s3url)(model),
              (x) => x,
              P.TaskEither_.map(
                P.Array_.map((s3FileUrl: S3Url) =>
                  P.pipe(
                    getFileType(s3FileUrl)(model),
                    (x) => x,
                    P.Task_.chain((fileType) => async () => {
                      //[FIXME:fp naive]
                      if (fileType === FileType.Directory) {
                        return removeDirectory(s3FileUrl)(model);
                      } else {
                        return deleteFile(s3FileUrl)(model);
                      }
                    }),
                    (x) => x
                  )
                )
              ),
              (x) => x,
              // P.Task_.sequenceArray(P.Task_.ApplySeq),
              (x) => x
            )(); //[FIXME:fp naive]

            // Delete the directory object itself (is this needed?)
            await model.s3
              .deleteObject({
                Bucket: parsed.Bucket,
                Key: parsed.FullPath,
              })
              .promise();
          })
        )(), //[FIXME:fp naive]
      String
    );
}

function getFileReadStream(s3url: S3Url): P.ReaderTaskEither<Model, string, Readable> {
  return ({ s3 }) =>
    P.TaskEither_.tryCatch(async () => {
      const parsed = s3Utils.parseS3Url(s3url);
      return s3.getObject({ Bucket: parsed.Bucket, Key: parsed.FullPath }).createReadStream() as Readable;
    }, String);
}

//[FIXME:fp _readline?]
function getFileLineReadStream(s3url: S3Url): P.ReaderTaskEither<Model, string, _readline.Interface> {
  return (model) =>
    P.pipe(
      getFileReadStream(s3url)(model), //[FIXME:fp naive?]
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

function getFileWriteStream(s3url: S3Url): P.ReaderTaskEither<Model, string, Writable> {
  return ({ s3 }) =>
    P.TaskEither_.tryCatch(async () => {
      const parsed = s3Utils.parseS3Url(s3url);

      const promiseDependentWritableStream = new PromiseDependentWritableStream();
      promiseDependentWritableStream.promise = s3
        .upload({ Bucket: parsed.Bucket, Key: parsed.FullPath, Body: promiseDependentWritableStream })
        .promise();
      return promiseDependentWritableStream;
    }, String);
}

function dirName(filePath: S3Url): P.ReaderTask<Model, string> {
  return (_) => P.Task_.of(P.pipe(s3Utils.parseS3Url(filePath), (parsed) => parsed.Path));
}

function fileName(filePath: S3Url): P.ReaderTask<Model, P.Option<string>> {
  return (_) => P.Task_.of(P.pipe(s3Utils.parseS3Url(filePath), (parsed) => parsed.File, P.Option_.fromNullable));
}

function joinPath(...parts: Array<string>): P.Reader<Model, string> {
  return ({ path }) => {
    if (parts.length < 1) return '';
    if (parts[0]!.startsWith(s3Utils.S3_PROTOCOL)) {
      const parsed = s3Utils.parseS3Url(parts[0] as string);
      return s3Utils.createS3Url(parsed.Bucket, path.posix.join(parsed.FullPath, ...parts.slice(1)));
    }
    return path.posix.join(...parts);
  };
}

function relative(from: S3Url, to: S3Url): P.Reader<Model, string> {
  return ({ path }) => path.posix.relative(from, to);
}

function extname(filePath: S3Url): P.Reader<Model, string> {
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
      getFileType: P.flow(getFileType, (r) => r(model)),
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
