import type { Writable } from 'stream';

import type * as P from '../../prelude';
import type { JsonData } from '../../types';
import type { FileWriter } from './FileWriter';
import { close, open, write } from './FileWriter';

export type Data = JsonData;

/**
 * Write the given data to the file, serialized as JSON
 */
function _write(fp: Writable, data: Data): P.TaskEither<string, void> {
  return write(fp, JSON.stringify(data));
}

/**
 * JSON file implementation of FileWriter
 */
export function jsonFileWriter(): FileWriter<Data> {
  return {
    open,
    write: _write,
    close,
  };
}
