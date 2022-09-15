import csvParse from 'csv-parse';
import type { Readable } from 'stream';

import type { DataAccessor } from '../../accessor/DataAccessor';
import * as P from '../../prelude';
import type { CsvData, Err } from '../../types';
import { toErr } from '../../types';
import type { FileReader } from './FileReader';

type Model = {
  csvOptions: csvParse.Options;
};
export type Data = Array<CsvData>;

export function __read<T>(dataAccessor: DataAccessor, filePath: string): P.ReaderTaskEither<Model, Err, T> {
  return ({ csvOptions }) =>
    P.pipe(
      dataAccessor.getFileReadStream(filePath),
      (x) => x,
      P.TaskEither_.chain((readable: Readable) =>
        P.TaskEither_.tryCatch(
          async () =>
            new Promise<T>((resolve, reject) => {
              readable.pipe(
                csvParse(csvOptions, (err, csvData) => {
                  if (err) reject(err);
                  resolve(csvData);
                })
              );
            }),
          toErr
        )
      )
    );
}

function _read(dataAccessor: DataAccessor, filePath: string): P.ReaderTaskEither<Model, Err, Data> {
  return __read(dataAccessor, filePath);
}

/**
 * CSV file implementation of IFileReader
 *
 * Reads in an entire CSV file via a read stream,
 * and returns an array of records, each record being an array of strings
 */
export function csvFileReader(csvOptions: csvParse.Options): FileReader<Data> {
  const model: Model = {
    csvOptions,
  };

  return {
    read: P.flow(_read, (r) => r(model)),
  };
}
