import type csvStringify from 'csv-stringify';
import csvStringifierSync from 'csv-stringify/lib/sync';
import type { Writable } from 'stream';

import * as P from '../../prelude';
import type { CsvData } from '../../types';
import type { FileWriter } from './FileWriter';
import { close, open, write } from './FileWriter';

type Model = {
  csvOptions: csvStringify.Options;
};
export type Data = Array<CsvData>;

/**
 * Write the given data to the file, serialized as JSON
 */
function _write(fp: Writable, data: Data): P.ReaderTaskEither<Model, string, void> {
  return ({ csvOptions }) => write(fp, csvStringifierSync(data, csvOptions));
}

/**
 * CSV file implementation of FileWriter
 */
export function csvFileWriter(csvOptions: csvStringify.Options): FileWriter<Data> {
  const model: Model = {
    csvOptions,
  };

  return {
    open,
    write: P.flow(_write, (r) => r(model)),
    close,
  };
}
