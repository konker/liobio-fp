import type { Writable } from 'stream';

import type { AppendableDataAccessor } from '../../../accessor/appendable/AppendableDataAccessor';
import type * as P from '../../../prelude';
import type { FileWriter } from '../FileWriter';

/**
 * An extension to FileWriter which allows writing to a file in append mode
 *
 * @template T - The type of thing that can be written
 */
export type AppendableFileWriter<T> = Omit<FileWriter<T>, 'open'> & {
  /**
   * Open the given file for appending
   */
  openForAppend: (dataAccessor: AppendableDataAccessor, filePath: string) => P.TaskEither<string, Writable>;
};

/**
 * Default implementation of openForAppend
 *
 * @param dataAccessor
 * @param filePath
 */
export function openForAppend(dataAccessor: AppendableDataAccessor, filePath: string): P.TaskEither<string, Writable> {
  return dataAccessor.getFileAppendWriteStream(filePath);
}
