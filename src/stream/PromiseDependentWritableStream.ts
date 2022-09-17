import type { Writable } from 'stream';
import { PassThrough } from 'stream';

/**
 * A Writable stream which can have an external promise injected into it.
 * The purpose of this is so that the stream can be kept alive until the promise resolves.
 */
export class PromiseDependentWritableStream extends PassThrough implements Writable {
  promise: Promise<unknown> | undefined;
}
