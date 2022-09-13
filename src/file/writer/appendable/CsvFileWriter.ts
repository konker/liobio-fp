import type csvStringify from 'csv-stringify';
import csvStringifierSync from 'csv-stringify/lib/sync';
import type { Writable } from 'stream';

import * as P from '../../../prelude';
import type { CsvData } from '../../../types';
import { close, open, write } from '../FileWriter';
import type { AppendableFileWriter } from './AppendableFileWriter';
import { openForAppend } from './AppendableFileWriter';

type Model = {
  csvOptions: csvStringify.Options;
};
export type Data = CsvData;

/**
 * Write the given data to the file
 *
 * Data is serialized as CSV based on the assumption that
 * the data param represents one record in the target CSV file
 */
function _write(fp: Writable, data: Data): P.ReaderTaskEither<Model, string, void> {
  return ({ csvOptions }) => write(fp, csvStringifierSync([data], csvOptions));
}

export function csvAppendableFileWriter(csvOptions: csvStringify.Options): AppendableFileWriter<Data> {
  const model: Model = {
    csvOptions,
  };

  return {
    open,
    openForAppend,
    write: P.flow(_write, (r) => r(model)),
    close,
  };
}
