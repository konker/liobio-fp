/// <reference types="node" />
import type { Writable } from 'stream';
import type { AppendableDataAccessor } from '../../../accessor/appendable/AppendableDataAccessor';
import type * as P from '../../../prelude';
import type { Err } from '../../../types';
import type { FileWriter } from '../FileWriter';
/**
 * An extension to FileWriter which allows writing to a file in append mode
 *
 * @template T - The type of thing that can be written
 */
export declare type AppendableFileWriter<T> = FileWriter<T> & {
    /**
     * Open the given file for appending
     */
    openForAppend: (dataAccessor: AppendableDataAccessor, filePath: string) => P.TaskEither<Err, Writable>;
};
/**
 * Default implementation of openForAppend
 *
 * @param dataAccessor
 * @param filePath
 */
export declare function openForAppend(dataAccessor: AppendableDataAccessor, filePath: string): P.TaskEither<Err, Writable>;
