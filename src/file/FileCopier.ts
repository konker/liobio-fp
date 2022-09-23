import type { DataAccessor } from '../accessor/DataAccessor';
import * as P from '../prelude';
import { PromiseDependentWritableStream } from '../stream/PromiseDependentWritableStream';
import type { Err } from '../types';
import { waitForPromiseDependentWritableStreamPipe, waitForStreamPipe } from '../utils/stream';

/**
 * High level read stream -> write stream logic
 *
 * @param fromDataAccessor
 * @param fromFile
 * @param toDataAccessor
 * @param toFile
 */
export function fileCopier(
  fromDataAccessor: DataAccessor,
  fromFile: string,
  toDataAccessor: DataAccessor,
  toFile: string
): P.TaskEither<Err, number> {
  return P.pipe(
    P.TaskEither_.Do,
    P.TaskEither_.bind('readStream', () => fromDataAccessor.getFileReadStream(fromFile)),
    P.TaskEither_.bind('writeStream', () => toDataAccessor.getFileWriteStream(toFile)),
    P.TaskEither_.chain(({ readStream, writeStream }) => {
      if (writeStream instanceof PromiseDependentWritableStream) {
        return waitForPromiseDependentWritableStreamPipe(readStream, writeStream as PromiseDependentWritableStream);
      }
      return waitForStreamPipe(readStream, writeStream);
    })
  );
}
