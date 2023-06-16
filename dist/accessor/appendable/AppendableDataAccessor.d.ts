/// <reference types="node" />
import type { Writable } from 'stream';
import type * as P from '../../prelude';
import type { Err } from '../../types';
import type { DataAccessor } from '../DataAccessor';
/**
 * Extension of IDataAccessor to additionally provide an interface for appending to files
 */
export declare type AppendableDataAccessor = DataAccessor & {
    /**
     * Get a stream to write to the given file in append mode
     *
     * @param filePath - The full path of the file to append to
     */
    getFileAppendWriteStream: (filePath: string) => P.TaskEither<Err, Writable>;
};
