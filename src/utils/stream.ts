import {Readable, Writable} from 'stream';
import PromiseDependentWritableStream from '../stream/PromiseDependentWritableStream';

/**
 * Wait for a readable stream to fully pipe to a write stream
 */
export async function waitForStreamPipe(readStream: Readable, writeStream: Writable): Promise<number> {
  return new Promise((resolve, reject) => {
    let size = 0;
    writeStream.on('data', data => (size += data.length));
    writeStream.on('finish', () => resolve(size));
    writeStream.on('error', err => reject(err));
    readStream.pipe(writeStream);
    readStream.resume();
  });
}

/**
 * Wait for a readable stream to fully pipe to a S3UploadStream
 */
export async function waitForPromiseDependentStreamPipe(
  readStream: Readable,
  writeStream: PromiseDependentWritableStream,
): Promise<number> {
  return new Promise((resolve, reject) => {
    let size = 0;
    writeStream.on('data', (data) => (size += data.length));
    readStream.pipe(writeStream);
    readStream.resume();
    if (writeStream.promise) writeStream.promise.then(() => resolve(size)).catch(reject);
    else reject(Error('waitForPromiseDependentStreamPipe called without a stream promise'));
  });
}
