import type { DataAccessor } from '../../accessor/DataAccessor';
import type * as P from '../../prelude';
import type { FileReader } from './FileReader';

export type Data = Buffer;

function read(dataAccessor: DataAccessor, filePath: string): P.TaskEither<string, Data> {
  return dataAccessor.readFile(filePath);
}

/**
 * Default implementation of FileReader
 *
 * Reads the entire contents of a file into a Buffer.
 */
export function defaultFileReader(): FileReader<Data> {
  return {
    read,
  };
}
