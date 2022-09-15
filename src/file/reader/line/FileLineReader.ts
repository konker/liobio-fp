import type readline from 'readline';

import type { DataAccessor } from '../../../accessor/DataAccessor';
import * as P from '../../../prelude';
import type { Err } from '../../../types';
import { toErr } from '../../../types';

export type FileLineReaderHandle<T> = {
  readonly fp: readline.Interface;
  readonly gen: AsyncGenerator<T>;
};

/**
 * Interface for file reader which streams content line by line
 *
 * This is used to implement memory-efficient file readers which can
 * read very large files without exhausting memory constraints.
 *
 * @template T - The type of the result of reading a file
 */
export type FileLineReader<T> = {
  /**
   * Open the given file for reading
   *
   * The async generator can be used to consume the file content, line by line.
   *
   * @param dataAccessor
   * @param filePath - The full path of the file to read
   */
  open: (dataAccessor: DataAccessor, filePath: string) => P.TaskEither<Err, FileLineReaderHandle<T>>;

  /**
   * Read a single line from the given handle
   *
   * @param handle
   */
  readLine: (handle: FileLineReaderHandle<T>) => P.TaskEither<Err, T>;

  /**
   * Close the file and clean up resources as needed
   */
  close: (handle: FileLineReaderHandle<T>) => P.Task<void>;
};

/**
 * Default implementation of close
 *
 * @param handle
 */
export function close<T>(handle: FileLineReaderHandle<T>): P.Task<void> {
  return async () => {
    handle.fp.close();
  };
}

/**
 * Default implementation of readLine
 *
 * @param handle
 */
export function readLine<T>(handle: FileLineReaderHandle<T>): P.TaskEither<Err, T> {
  return P.TaskEither_.tryCatch(async () => {
    return await handle.gen.next().then((r) => r.value);
  }, toErr);
}
