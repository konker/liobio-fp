import { Writable } from 'stream';
import { DataAccessor } from '../DataAccessor';
import * as P from '../../prelude';

/**
 * Extension of IDataAccessor to additionally provide an interface for appending to files
 */
export type AppendableDataAccessor = DataAccessor & {
    /**
     * Get a stream to write to the given file in append mode
     *
     * @param filePath - The full path of the file to append to
     */
    getFileAppendWriteStream: (filePath: string) => P.TaskEither<string, Writable>;
}
