import type { DataAccessor } from '../accessor/DataAccessor';
import * as P from '../prelude';
import { PromiseDependentWritableStream } from '../stream/PromiseDependentWritableStream';
import { waitForPromiseDependentStreamPipe, waitForStreamPipe } from '../utils/stream';

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
): P.TaskEither<string, number> {
  return P.pipe(
    P.TaskEither_.Do,
    P.TaskEither_.bind('readStream', () => fromDataAccessor.getFileReadStream(fromFile)),
    P.TaskEither_.bind('writeStream', () => toDataAccessor.getFileWriteStream(toFile)),
    P.TaskEither_.chainW(({ readStream, writeStream }) =>
      P.TaskEither_.tryCatch(async () => {
        console.log('KONK93', readStream);
        console.log('KONK94', writeStream);
        if (writeStream instanceof PromiseDependentWritableStream) {
          return waitForPromiseDependentStreamPipe(readStream, writeStream as PromiseDependentWritableStream);
        }
        return waitForStreamPipe(readStream, writeStream);
      }, String)
    ),
    (x) => x
  );
}
