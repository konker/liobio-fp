import type { DataAccessor } from '../../../accessor/DataAccessor';
import * as P from '../../../prelude';
import type { FileLineReader, FileLineReaderHandle } from './FileLineReader';
import { close, readLine } from './FileLineReader';

export type Data = string;

/**
 * Open the given file for reading
 *
 * The async generator can be used to consume the file content, line by line.
 * Each line is returned as a string.
 *
 * @param dataAccessor
 * @param filePath - The full path of the file to read
 */
function _open(dataAccessor: DataAccessor, filePath: string): P.TaskEither<string, FileLineReaderHandle<Data>> {
  return P.pipe(
    dataAccessor.getFileLineReadStream(filePath),
    P.TaskEither_.map((fp) => ({
      fp,
      gen: (async function* () {
        for await (const line of fp) {
          yield line;
        }
      })(),
    }))
  );
}

/**
 * Default implementation of IFileLineReader
 *
 * Read a file one line at a time via a read stream which creates an AsyncGenerator.
 * The generator yields one line at a time as a string.
 */
export function defaultFileLineReader(): FileLineReader<string> {
  return {
    open: _open,
    readLine,
    close,
  };
}
