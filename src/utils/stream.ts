import type { Readable, Writable } from 'stream';

import * as P from '../prelude';
import type { PromiseDependentWritableStream } from '../stream/PromiseDependentWritableStream';
import type { Err } from '../types';
import { toErr } from '../types';

/**
 * Wait for a readable stream to fully pipe to a write-stream
 */
export function waitForStreamPipe(readStream: Readable, writeStream: Writable): P.TaskEither<Err, number> {
  return P.TaskEither_.tryCatch(
    () =>
      new Promise((resolve, reject) => {
        let size = 0;
        writeStream.on('data', (data) => (size += data.length));
        writeStream.on('finish', () => resolve(size));
        writeStream.on('error', (err) => reject(err));
        readStream.pipe(writeStream);
        readStream.resume();
      }),
    toErr
  );
}

/**
 * Wait for a readable stream to fully pipe to a S3UploadStream
 */
export function waitForPromiseDependentStreamPipe(
  readStream: Readable,
  writeStream: PromiseDependentWritableStream
): P.TaskEither<Err, number> {
  return P.TaskEither_.tryCatch(
    () =>
      new Promise((resolve, reject) => {
        let size = 0;
        writeStream.on('data', (data) => (size += data.length));
        readStream.pipe(writeStream);
        readStream.resume();
        if (writeStream.promise) writeStream.promise.then(() => resolve(size)).catch(reject);
        else reject(Error('waitForPromiseDependentStreamPipe called without a stream promise'));
      }),
    toErr
  );
}
