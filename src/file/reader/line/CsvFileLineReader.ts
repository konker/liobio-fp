import type csvParse from 'csv-parse';
import csvParserSync from 'csv-parse/lib/sync';

import type { DataAccessor } from '../../../accessor/DataAccessor';
import * as P from '../../../prelude';
import type { CsvData } from '../../../types';
import type { FileLineReader, FileLineReaderHandle } from './FileLineReader';
import { close, readLine } from './FileLineReader';

type Model = {
  csvOptions: csvParse.Options;
};
export type Data = CsvData;

/**
 * Open the given CSV file for reading
 *
 * The async generator can be used to consume the file content, line by line.
 * Each line is returned as an array of strings.
 *
 * @param dataAccessor
 * @param filePath - The full path of the file to read
 */
function _open(
  dataAccessor: DataAccessor,
  filePath: string
): P.ReaderTaskEither<Model, string, FileLineReaderHandle<Data>> {
  return ({ csvOptions }) =>
    P.pipe(
      dataAccessor.getFileLineReadStream(filePath),
      P.TaskEither_.map((fp) => ({
        fp,
        gen: (async function* () {
          for await (const line of fp) {
            yield csvParserSync(line, csvOptions).pop();
          }
        })(),
      }))
    );
}

/**
 * CSV file implementation of IFileLineReader
 *
 * Read a CSV file one line at a time via a read stream which creates an AsyncGenerator.
 * The generator yields one line at a time as an array of strings.
 */
export function csvFileLineReader(csvOptions: csvParse.Options): FileLineReader<Data> {
  const model: Model = {
    csvOptions,
  };

  return {
    open: P.flow(_open, (r) => r(model)),
    readLine,
    close,
  };
}
