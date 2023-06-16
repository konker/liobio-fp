import type csvParse from 'csv-parse';
import csvParserSync from 'csv-parse/lib/sync';
import zipObject from 'lodash.zipobject';

import type { DataAccessor } from '../../../accessor/DataAccessor';
import * as P from '../../../prelude';
import type { CsvData, CsvObjectData, Err } from '../../../types';
import { toLibError } from '../../../utils/error';
import type { FileLineReader, FileLineReaderHandle } from './FileLineReader';
import { close } from './FileLineReader';

type Model = {
  csvOptions: csvParse.Options;
};
export type Data = CsvObjectData;

/**
 * Open the given CSV file for reading
 *
 * The async generator can be used to consume the file content, line by line.
 * Each line is returned as an object keyed by the columns names.
 * This assumes that the first line holds the column names.
 *
 * @param dataAccessor
 * @param filePath - The full path of the file to read
 */
function _open(
  dataAccessor: DataAccessor,
  filePath: string
): P.ReaderTaskEither<Model, Err, FileLineReaderHandle<Data>> {
  return ({ csvOptions }) =>
    P.pipe(
      dataAccessor.getFileLineReadStream(filePath),
      P.TaskEither_.map((fp) => ({
        fp,
        gen: (async function* () {
          let headers: P.Either<Err, CsvData> | undefined;
          let first = true;

          for await (const line of fp) {
            if (first) {
              headers = P.Either_.tryCatch(() => csvParserSync(line, csvOptions).pop() as CsvData, toLibError);
              first = false;
            } else {
              const definedHeaders = headers as P.Either<Err, CsvData>;
              yield P.pipe(
                P.Either_.Do,
                P.Either_.bind('headerRecord', () => definedHeaders),
                P.Either_.bind('record', () =>
                  P.Either_.tryCatch(() => csvParserSync(line, csvOptions).pop(), toLibError)
                ),
                P.Either_.map(({ headerRecord, record }) => zipObject(headerRecord as Array<string>, record))
              );
            }
          }
        })(),
      }))
    );
}

/**
 * CSV-object file implementation of IFileLineReader
 *
 * Read a CSV file one line at a time via a read stream which creates an AsyncGenerator.
 * The generator yields one line at a time as an object keyed by the column names; the column names are taken from the first line.
 */
export function csvObjectFileLineReader(csvOptions: csvParse.Options): FileLineReader<Data> {
  const model: Model = {
    csvOptions,
  };

  return {
    open: P.flow(_open, (r) => r(model)),
    close,
  };
}
