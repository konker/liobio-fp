import type { Readable, Writable } from 'stream';
import type { ReadableStream } from 'stream/web';

import * as P from '../prelude';
import type { PromiseDependentWritableStream } from '../stream/PromiseDependentWritableStream';
import type { Err } from '../types';
import { toErr } from '../types';

/**
 * Consume a readStream
 * @param readStream
 */
export async function readStreamToBuffer(readStream: Readable | ReadableStream): Promise<Buffer> {
  const chunks: Array<Buffer> = [];
  for await (const chunk of readStream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

/**
 * Wait for a readable stream to fully pipe to a write-stream
 */
export function waitForStreamPipe(readStream: Readable, writeStream: Writable): P.TaskEither<Err, number> {
  return P.TaskEither_.tryCatch(
    () =>
      new Promise((resolve, reject) => {
        let size = 0;
        readStream.on('data', (data) => {
          size = size + data.length;
        });
        readStream.on('error', reject);
        writeStream.on('finish', () => resolve(size));
        writeStream.on('error', reject);
        readStream.pipe(writeStream);
        readStream.resume();
      }),
    toErr
  );
}

/**
 * Wait for a readable stream to fully pipe to a S3UploadStream
 */
export function waitForPromiseDependentWritableStreamPipe(
  readStream: Readable,
  writeStream: PromiseDependentWritableStream
): P.TaskEither<Err, number> {
  return P.TaskEither_.tryCatch(
    () =>
      new Promise((resolve, reject) => {
        let size = 0;
        readStream.on('data', (data) => {
          size = size + data.length;
        });
        readStream.on('error', reject);
        readStream.pipe(writeStream);
        readStream.resume();
        if (writeStream.promise) writeStream.promise.then(() => resolve(size)).catch(reject);
        else reject(Error('waitForPromiseDependentWritableStreamPipe called without a stream promise'));
      }),
    toErr
  );
}
