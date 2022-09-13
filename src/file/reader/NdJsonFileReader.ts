import type { DataAccessor } from '../../accessor/DataAccessor';
import * as P from '../../prelude';
import type { JsonData } from '../../types';
import type { FileReader } from './FileReader';

export type Data = Array<JsonData>;

/*[XXX:remove this whole module, and only have one NdJsonReader (line reader)*/
function read(dataAccessor: DataAccessor, filePath: string): P.TaskEither<string, Data> {
  return P.pipe(
    dataAccessor.getFileLineReadStream(filePath),
    (x) => x,
    P.TaskEither_.chain((fp) =>
      P.TaskEither_.tryCatch(async (): Promise<Data> => {
        const data: Data = [];
        for await (const line of await fp) {
          data.push(JSON.parse(line));
        }
        return data;
      }, String)
    )
  );
}

/**
 * NDJSON file implementation of IFileReader
 *
 * Read an entire NDJSON file and return an array of objects corresponding to the data on each line
 * See: http://ndjson.org/
 */
export function ndJsonFileReader(): FileReader<Data> {
  return {
    read,
  };
}
