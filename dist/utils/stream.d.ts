/// <reference types="node" />
/// <reference types="node" />
/// <reference types="node" />
import type { Readable, Writable } from 'stream';
import type { ReadableStream } from 'stream/web';
import * as P from '../prelude';
import type { PromiseDependentWritableStream } from '../stream/PromiseDependentWritableStream';
import type { Err } from '../types';
/**
 * Consume a readStream
 * @param readStream
 */
export declare function readStreamToBuffer(readStream: Readable | ReadableStream): Promise<Buffer>;
/**
 * Wait for a readable stream to fully pipe to a write-stream
 */
export declare function waitForStreamPipe(readStream: Readable, writeStream: Writable): P.TaskEither<Err, number>;
/**
 * Wait for a readable stream to fully pipe to a S3UploadStream
 */
export declare function waitForPromiseDependentStreamPipe(readStream: Readable, writeStream: PromiseDependentWritableStream): P.TaskEither<Err, number>;
