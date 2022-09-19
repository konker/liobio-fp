import type { DataAccessor } from '../../accessor/DataAccessor';
import * as P from '../../prelude';
import type { Err, JsonData } from '../../types';
import { toLibError } from '../../utils/error';
import type { FileReader } from './FileReader';

export type Data = JsonData;

function read(dataAccessor: DataAccessor, filePath: string): P.TaskEither<Err, Data> {
  return P.pipe(
    dataAccessor.readFile(filePath),
    P.TaskEither_.map((data) => data.toString()),
    P.Task_.map(P.Either_.chain(P.Json_.parse)),
    P.TaskEither_.mapLeft(toLibError)
  );
  // return P.pipe(
  //   dataAccessor.readFile(filePath),
  //   P.TaskEither_.chain((data) =>
  //     P.pipe(data, () => P.TaskEither_.tryCatch(async () => JSON.parse(data.toString()) as P.Json, toLibError))
  //   )
  // );
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
