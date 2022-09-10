import type { DataAccessor } from '../../../accessor/DataAccessor';
import * as P from '../../../prelude';
import type { JsonData } from '../../../types';
import type { FileLineReader, FileLineReaderHandle } from './FileLineReader';
import { close, readLine } from './FileLineReader';

export type Data = JsonData;

/**
 * Open the given NDJSON file for reading
 *
 * The async generator can be used to consume the file content, line by line.
 * Each line is returned as an array or object.
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
          yield JSON.parse(line);
        }
      })(),
    }))
  );
}

/**
 * NDJSON file implementation of IFileLineReader
 *
 * Read an NDJSON file one line at a time via a read stream which creates an AsyncGenerator.
 * The generator yields one line at a time as either an object or an array, depending on the line content.
 * See: http://ndjson.org/
 */
export function ndJsonFileLineReader(): FileLineReader<Data> {
  return {
    open: _open,
    readLine,
    close,
  };
}
