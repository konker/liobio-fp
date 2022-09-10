import type { DataAccessor } from '../../accessor/DataAccessor';
import * as P from '../../prelude';
import type { JsonData } from '../../types';
import type { FileReader } from './FileReader';

export type Data = JsonData;

function read(dataAccessor: DataAccessor, filePath: string): P.TaskEither<string, Data> {
  //[FIXME:fp should wrap JSON.parse in a try/catch?]
  return P.pipe(
    dataAccessor.readFile(filePath),
    P.TaskEither_.map((data) => JSON.parse(data.toString()))
  );
}

/**
 * JSON file implementation of IFileReader
 *
 * Reads in an entire JSON file and returns an array or object depending on the content of the JSON file
 */
export function jsonFileReader(): FileReader<Data> {
  return {
    read,
  };
}
