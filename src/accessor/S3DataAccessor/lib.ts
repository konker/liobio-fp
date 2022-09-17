import type { ListObjectsV2CommandOutput, S3Client } from '@aws-sdk/client-s3';
import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { Blob } from 'buffer';
import readline from 'readline';
import { Readable } from 'stream';
import { ReadableStream } from 'stream/web';

import * as P from '../../prelude';
import { PromiseDependentWritableStream } from '../../stream/PromiseDependentWritableStream';
import type { Err } from '../../types';
import { toErr } from '../../types';
import type { S3UrlData, S3UrlDataDirectory, S3UrlDataFile } from '../../utils/s3-uri-utils';
import { readStreamToBuffer } from '../../utils/stream';

export type Model = {
  s3: S3Client;
};

export function s3ListObjects(parsed: S3UrlDataDirectory): P.ReaderTaskEither<Model, Err, ListObjectsV2CommandOutput> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      const cmd = new ListObjectsV2Command({
        Bucket: parsed.Bucket,
        Delimiter: '/',
        Prefix: parsed.Path,
      });
      return model.s3.send(cmd);
    }, toErr);
}

export function s3HeadObject(parsed: S3UrlData): P.ReaderTaskEither<Model, unknown, boolean> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      const cmd = new HeadObjectCommand({
        Bucket: parsed.Bucket,
        Key: parsed.FullPath,
      });
      await model.s3.send(cmd);

      // If no exception has been thrown, the object exists
      return true;
    }, P.identity);
}

export function s3GetObject(parsed: S3UrlDataFile): P.ReaderTaskEither<Model, Err, Buffer> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      const cmd = new GetObjectCommand({
        Bucket: parsed.Bucket,
        Key: parsed.FullPath,
      });
      const s3File = await model.s3.send(cmd);

      if (!s3File.Body) return Buffer.from([]);
      if (s3File.Body instanceof Readable) {
        return readStreamToBuffer(s3File.Body);
      }
      if (s3File.Body instanceof ReadableStream) {
        // return readStreamToBuffer(s3File.Body);
        throw new Error('S3 object Body is a ReadableStream');
      }
      if (s3File.Body instanceof Blob) {
        // return s3File.Body.arrayBuffer().then(Buffer.from);
        throw new Error('S3 object Body is a Blob');
      }
      throw new Error('Unknown S3 object Body type');
    }, toErr);
}

export function s3GetObjectReadStream(parsed: S3UrlDataFile): P.ReaderTaskEither<Model, Err, Readable> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      const cmd = new GetObjectCommand({
        Bucket: parsed.Bucket,
        Key: parsed.FullPath,
      });
      const s3File = await model.s3.send(cmd);
      if (s3File.Body instanceof Readable) {
        return s3File.Body;
      }
      if (s3File.Body instanceof ReadableStream) {
        // return s3File.Body.getReader();
        throw new TypeError('s3GetObjectReadStream: Body is a ReadableStream');
      }
      if (s3File.Body instanceof Blob) {
        // return new Readable().wrap(s3File.Body.stream as any as ReadableStream);
        throw new TypeError('s3GetObjectReadStream: Body is a Blob');
      }
      throw new TypeError('s3GetObjectReadStream: Body is not a Readable');
    }, toErr);
}

export function s3GetObjectWriteStream(
  parsed: S3UrlDataFile
): P.ReaderTaskEither<Model, Err, PromiseDependentWritableStream> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      const promiseDependentWritableStream = new PromiseDependentWritableStream();
      const upload = new Upload({
        client: model.s3,
        leavePartsOnError: false,
        params: {
          Bucket: parsed.Bucket,
          Key: parsed.FullPath,
          Body: promiseDependentWritableStream,
        },
      });

      promiseDependentWritableStream.promise = upload.done();
      return promiseDependentWritableStream;
    }, toErr);
}

export function s3PutObject(parsed: S3UrlData, data?: Buffer | string): P.ReaderTaskEither<Model, Err, void> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      const input = Object.assign(
        {
          Bucket: parsed.Bucket,
          Key: parsed.FullPath,
        },
        data ? { Data: data } : {}
      );
      const cmd = new PutObjectCommand(input);
      await model.s3.send(cmd);
    }, toErr);
}

export function s3DeleteObject(parsed: S3UrlData): P.ReaderTaskEither<Model, Err, void> {
  return (model) =>
    P.TaskEither_.tryCatch(async () => {
      const cmd = new DeleteObjectCommand({
        Bucket: parsed.Bucket,
        Key: parsed.FullPath,
      });
      await model.s3.send(cmd);
    }, toErr);
}

export function readlineInterfaceFromReadStream(
  readStream: Readable
): P.ReaderTaskEither<Model, Err, readline.Interface> {
  return (model) =>
    P.TaskEither_.tryCatch(
      async () =>
        readline.createInterface({
          input: readStream,
          historySize: 0,
          terminal: false,
          crlfDelay: Infinity,
          escapeCodeTimeout: 10000,
        }),
      toErr
    );
}
