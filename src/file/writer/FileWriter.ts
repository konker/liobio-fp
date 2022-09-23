import type { Writable } from 'stream';

import type { DataAccessor } from '../../accessor/DataAccessor';
import * as P from '../../prelude';
import type { Err } from '../../types';
import { toErr } from '../../types';

/**
 * File writer interface
 *
 * @template T - The type of thing that can be written
 */
export type FileWriter<T> = {
  /**
   * Open a file for writing and return a writable stream
   *
   * @param dataAccessor
   * @param filePath - The full path of the file to write
   */
  open: (dataAccessor: DataAccessor, filePath: string) => P.TaskEither<Err, Writable>;

  /**
   * Write the given data to the file
   *
   * @param fp - The stream to write to
   * @param data - The data to write
   */
  write: (fp: Writable, data: T) => P.TaskEither<Err, void>;

  /**
   * Close the file and clean up resources as needed
   *
   * @param fp - The stream to close
   */
  close: (fp: Writable) => P.Task<void>;
};

/**
 * Default implementation of open
 *
 * @param dataAccessor
 * @param filePath
 */
export function open(dataAccessor: DataAccessor, filePath: string): P.TaskEither<Err, Writable> {
  return dataAccessor.getFileWriteStream(filePath);
}

/**
 * Default implementation of write
 *
 * @param fp
 * @param data
 */
export function write<T>(fp: Writable, data: T): P.TaskEither<Err, void> {
  return P.TaskEither_.tryCatch(
    () =>
      new Promise((resolve, reject) => {
        fp.write(data, (error) => (error ? reject(error) : resolve()));
      }),
    toErr
  );
}

/**
 * Default implementation of close
 *
 * @param fp
 */
export function close(fp: Writable): P.Task<void> {
  return () =>
    new Promise((resolve, _) => {
      fp.on('close', resolve);
      fp.end();
    });
}
