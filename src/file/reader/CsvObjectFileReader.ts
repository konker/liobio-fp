import type csvParse from 'csv-parse';

import type { DataAccessor } from '../../accessor/DataAccessor';
import * as P from '../../prelude';
import type { CsvObjectData, Err } from '../../types';
import { __read } from './CsvFileReader';
import type { FileReader } from './FileReader';

type Model = {
  csvOptions: csvParse.Options;
};
export type Data = Array<CsvObjectData>;

function _read(dataAccessor: DataAccessor, filePath: string): P.ReaderTaskEither<Model, Err, Data> {
  return __read(dataAccessor, filePath);
}

/**
 * CSV-object file reader implementation of IFileReader
 *
 * Reads in an entire CSV file via a read stream,
 * and returns an array of records, each record being an object keyed by the column names.
 * This assumes that the first record holds the column names.
 */
export function csvObjectFileReader(csvOptions: csvParse.Options): FileReader<Data> {
  const model: Model = {
    csvOptions: Object.assign({}, csvOptions, { columns: true }),
  };

  return {
    read: P.flow(_read, (r) => r(model)),
  };
}
