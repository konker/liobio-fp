import type { Writable } from 'stream';

import type * as P from '../../../prelude';
import type { Err, JsonData } from '../../../types';
import { close, open, write } from '../FileWriter';
import type { AppendableFileWriter } from './AppendableFileWriter';
import { openForAppend } from './AppendableFileWriter';

export type Data = JsonData;

/**
 * Write the given data to the file
 *
 * Data is serialized as JSON based on the assumption that
 * the data param represents one line in the target NDJSON file
 *
 * @param fp - The stream to write to
 * @param data - The data to write, representing one line in the target NDJSON files
 */
function _write(fp: Writable, data: Data): P.TaskEither<Err, void> {
  return write(fp, JSON.stringify(data) + '\n');
}

export function ndJsonFileWriter(): AppendableFileWriter<Data> {
  return {
    open,
    openForAppend,
    write: _write,
    close,
  };
}
