import type { DataAccessor } from '../../accessor/DataAccessor';
import type * as P from '../../prelude';

/**
 * File reader interface
 *
 * @interface
 * @template T - The type of the result of reading a file
 */
export type FileReader<T> = {
  /**
   * Read the content of the given file, and return the data of type T
   *
   * @param dataAccessor
   * @param filePath - The full path of the file to read
   */
  read: (dataAccessor: DataAccessor, filePath: string) => P.TaskEither<string, T>;
};
